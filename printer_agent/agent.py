#!/usr/bin/env python3
"""
3dkprint — agente de impressora (Klipper/Moonraker)

Roda num Raspberry Pi (ou qualquer Linux da rede local).
Lê status via Moonraker, envia telemetria pro site 3dkprint e executa
comandos (pausar/cancelar/imprimir) postados pelo site.

Como rodar (no RPi):
    python3 -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    cp config.example.json config.json   # edita com seus tokens
    python agent.py

Para rodar como serviço systemd, ver printer_agent.service.
"""
from __future__ import annotations

import json
import logging
import os
import signal
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests

CONFIG_PATH = Path(__file__).with_name("config.json")
POLL_INTERVAL_SECONDS = 5         # telemetria a cada 5s
COMMAND_POLL_INTERVAL_SECONDS = 3 # comandos a cada 3s (menor latência de controle)
TELEMETRY_TIMEOUT = 10
MOONRAKER_TIMEOUT = 5             # GET de status (rápido)
MOONRAKER_COMMAND_TIMEOUT = 120   # comandos podem demorar (G28, M104 com aquecimento, upload de gcode)

log = logging.getLogger("agent")
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    level=logging.INFO,
)


# =======================================================================
# Config
# =======================================================================
@dataclass
class PrinterConfig:
    id: str                 # UUID de printer_devices.id
    api_url: str            # ex: "http://192.168.1.129:7125"
    agente_token: str       # token pra autenticar no site
    nome: str = ""


@dataclass
class AgentConfig:
    site_base_url: str      # ex: "https://3dkprint.com.br" ou endpoint da edge function
    telemetry_endpoint: str
    commands_endpoint: str
    printers: list[PrinterConfig]


def load_config() -> AgentConfig:
    if not CONFIG_PATH.exists():
        log.error("config.json não encontrado em %s", CONFIG_PATH)
        log.error("Crie copiando config.example.json e ajustando.")
        sys.exit(1)
    # utf-8-sig aceita arquivo com ou sem BOM (PowerShell adiciona BOM por padrão).
    raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8-sig"))
    printers = [PrinterConfig(**p) for p in raw["printers"]]
    return AgentConfig(
        site_base_url=raw["site_base_url"].rstrip("/"),
        telemetry_endpoint=raw.get("telemetry_endpoint", "/functions/v1/printer-telemetry"),
        commands_endpoint=raw.get("commands_endpoint", "/functions/v1/printer-commands"),
        printers=printers,
    )


# =======================================================================
# Moonraker client (Klipper)
# =======================================================================
def moonraker_get(api_url: str, path: str, **kwargs) -> Any:
    url = f"{api_url.rstrip('/')}{path}"
    r = requests.get(url, timeout=MOONRAKER_TIMEOUT, **kwargs)
    r.raise_for_status()
    return r.json()


def moonraker_post(api_url: str, path: str, **kwargs) -> Any:
    url = f"{api_url.rstrip('/')}{path}"
    # Timeout maior por padrão pra comandos (G28, aquecer mesa etc.).
    # Quem chama pode passar timeout explícito pra reduzir.
    timeout = kwargs.pop("timeout", MOONRAKER_COMMAND_TIMEOUT)
    r = requests.post(url, timeout=timeout, **kwargs)
    r.raise_for_status()
    return r.json()


def moonraker_status(api_url: str) -> dict[str, Any]:
    """Coleta um snapshot consolidado do estado da impressora."""
    objects = (
        "print_stats,display_status,extruder,heater_bed,toolhead,"
        "virtual_sdcard,idle_timeout,pause_resume,webhooks"
    )
    data = moonraker_get(api_url, f"/printer/objects/query?{objects}")
    return data.get("result", {}).get("status", {})


def parse_telemetry(raw_status: dict[str, Any]) -> dict[str, Any]:
    """Converte o dump do Moonraker no formato que enviamos pro site."""
    print_stats = raw_status.get("print_stats", {}) or {}
    display = raw_status.get("display_status", {}) or {}
    extruder = raw_status.get("extruder", {}) or {}
    bed = raw_status.get("heater_bed", {}) or {}
    toolhead = raw_status.get("toolhead", {}) or {}
    virtual_sd = raw_status.get("virtual_sdcard", {}) or {}
    webhooks = raw_status.get("webhooks", {}) or {}

    state_source = print_stats.get("state") or webhooks.get("state") or "standby"
    # Mapa do print_stats.state do Klipper → nosso state
    state_map = {
        "standby": "standby",
        "printing": "printing",
        "paused": "paused",
        "complete": "standby",
        "cancelled": "standby",
        "error": "error",
        "shutdown": "offline",
        "ready": "standby",
        "startup": "standby",
    }
    state = state_map.get(state_source, state_source)

    progress = None
    if display.get("progress") is not None:
        progress = round(float(display["progress"]) * 100, 2)
    elif virtual_sd.get("progress") is not None:
        progress = round(float(virtual_sd["progress"]) * 100, 2)

    position = toolhead.get("position") or [None, None, None, None]

    duration = print_stats.get("print_duration")
    total_duration = print_stats.get("total_duration")
    est_remaining = None
    if progress and progress > 0 and duration:
        est_total = duration / (progress / 100)
        est_remaining = max(0, int(est_total - duration))

    return {
        "state": state,
        "state_message": print_stats.get("message") or webhooks.get("state_message"),
        "extruder_temp": extruder.get("temperature"),
        "extruder_target": extruder.get("target"),
        "bed_temp": bed.get("temperature"),
        "bed_target": bed.get("target"),
        "progress": progress,
        "current_file": print_stats.get("filename") or None,
        "print_duration_seconds": int(duration) if duration else None,
        "print_time_remaining_seconds": est_remaining,
        "position_x": position[0] if len(position) > 0 else None,
        "position_y": position[1] if len(position) > 1 else None,
        "position_z": position[2] if len(position) > 2 else None,
        "raw": {
            "total_duration": total_duration,
            "filename": print_stats.get("filename"),
        },
    }


# =======================================================================
# Comandos Moonraker
# =======================================================================
def cmd_pause(api_url: str) -> None:
    moonraker_post(api_url, "/printer/print/pause")


def cmd_resume(api_url: str) -> None:
    moonraker_post(api_url, "/printer/print/resume")


def cmd_cancel(api_url: str) -> None:
    moonraker_post(api_url, "/printer/print/cancel")


def cmd_emergency_stop(api_url: str) -> None:
    moonraker_post(api_url, "/printer/emergency_stop")


def cmd_home(api_url: str, params: dict | None = None) -> None:
    axes = (params or {}).get("axes", "xyz").upper()
    script = f"G28 {' '.join(list(axes))}"
    moonraker_post(api_url, "/printer/gcode/script", params={"script": script})


def cmd_set_temp_extruder(api_url: str, params: dict) -> None:
    temp = float(params.get("temperature", 0))
    moonraker_post(api_url, "/printer/gcode/script", params={"script": f"M104 S{temp}"})


def cmd_set_temp_bed(api_url: str, params: dict) -> None:
    temp = float(params.get("temperature", 0))
    moonraker_post(api_url, "/printer/gcode/script", params={"script": f"M140 S{temp}"})


def cmd_gcode_raw(api_url: str, params: dict) -> None:
    script = params.get("gcode") or ""
    if not script:
        raise ValueError("gcode vazio")
    moonraker_post(api_url, "/printer/gcode/script", params={"script": script})


def cmd_print_file(api_url: str, params: dict) -> None:
    """
    Baixa o gcode do Supabase Storage e inicia o print via Moonraker.
    params = { "download_url": "...", "filename": "peca.gcode" }
    """
    download_url = params.get("download_url")
    filename = params.get("filename") or "remote.gcode"
    if not download_url:
        raise ValueError("download_url vazio")

    log.info("Baixando gcode: %s", filename)
    resp = requests.get(download_url, timeout=120)
    resp.raise_for_status()

    files = {"file": (filename, resp.content, "application/octet-stream")}
    log.info("Enviando ao Moonraker (%d bytes)...", len(resp.content))
    r = requests.post(
        f"{api_url.rstrip('/')}/server/files/upload",
        files=files,
        data={"print": "true"},
        timeout=120,
    )
    r.raise_for_status()


COMMAND_HANDLERS = {
    "pause": lambda api, params: cmd_pause(api),
    "resume": lambda api, params: cmd_resume(api),
    "cancel": lambda api, params: cmd_cancel(api),
    "emergency_stop": lambda api, params: cmd_emergency_stop(api),
    "home": lambda api, params: cmd_home(api, params),
    "set_temp_extruder": lambda api, params: cmd_set_temp_extruder(api, params),
    "set_temp_bed": lambda api, params: cmd_set_temp_bed(api, params),
    "gcode_raw": lambda api, params: cmd_gcode_raw(api, params),
    "print_file": lambda api, params: cmd_print_file(api, params),
}


# =======================================================================
# Comunicação com o site
# =======================================================================
class SiteClient:
    def __init__(self, cfg: AgentConfig):
        self.cfg = cfg
        self.session = requests.Session()

    def _url(self, endpoint: str) -> str:
        return f"{self.cfg.site_base_url}{endpoint}"

    def _headers(self, token: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    def push_telemetry(self, printer: PrinterConfig, telemetry: dict) -> None:
        url = self._url(self.cfg.telemetry_endpoint)
        payload = {"printer_id": printer.id, "telemetry": telemetry}
        try:
            r = self.session.post(
                url, json=payload, headers=self._headers(printer.agente_token),
                timeout=TELEMETRY_TIMEOUT,
            )
            if r.status_code >= 400:
                log.warning("[%s] telemetry %s: %s", printer.nome or printer.id, r.status_code, r.text[:200])
        except Exception as exc:
            log.warning("[%s] telemetry erro: %s", printer.nome or printer.id, exc)

    def fetch_commands(self, printer: PrinterConfig) -> list[dict]:
        url = self._url(self.cfg.commands_endpoint) + f"?printer_id={printer.id}"
        try:
            r = self.session.get(
                url, headers=self._headers(printer.agente_token),
                timeout=TELEMETRY_TIMEOUT,
            )
            if r.status_code >= 400:
                log.warning("[%s] commands fetch %s: %s", printer.nome, r.status_code, r.text[:200])
                return []
            return r.json().get("commands", [])
        except Exception as exc:
            log.warning("[%s] commands fetch erro: %s", printer.nome, exc)
            return []

    def complete_command(self, printer: PrinterConfig, command_id: str, ok: bool, error: str | None = None) -> None:
        url = self._url(self.cfg.commands_endpoint)
        payload = {
            "command_id": command_id,
            "status": "done" if ok else "failed",
            "error_message": error,
        }
        try:
            self.session.patch(
                url, json=payload, headers=self._headers(printer.agente_token),
                timeout=TELEMETRY_TIMEOUT,
            )
        except Exception as exc:
            log.warning("[%s] complete_command erro: %s", printer.nome, exc)


# =======================================================================
# Loop principal
# =======================================================================
class Agent:
    def __init__(self, cfg: AgentConfig):
        self.cfg = cfg
        self.client = SiteClient(cfg)
        self.stop_flag = False
        signal.signal(signal.SIGINT, self._graceful_stop)
        signal.signal(signal.SIGTERM, self._graceful_stop)

    def _graceful_stop(self, *_):
        log.info("Sinal recebido, finalizando...")
        self.stop_flag = True

    def tick(self, printer: PrinterConfig) -> None:
        # 1) Coletar telemetria do Moonraker e enviar ao site
        try:
            status = moonraker_status(printer.api_url)
            telemetry = parse_telemetry(status)
        except Exception as exc:
            log.warning("[%s] Moonraker offline: %s", printer.nome, exc)
            telemetry = {"state": "offline", "state_message": str(exc)}

        self.client.push_telemetry(printer, telemetry)

        # 2) Buscar comandos pendentes e executar
        commands = self.client.fetch_commands(printer)
        for cmd in commands:
            cid = cmd.get("id")
            name = cmd.get("command")
            params = cmd.get("params") or {}
            handler = COMMAND_HANDLERS.get(name)
            if not handler:
                log.error("[%s] comando desconhecido: %s", printer.nome, name)
                self.client.complete_command(printer, cid, ok=False, error=f"Comando desconhecido: {name}")
                continue
            try:
                log.info("[%s] executando comando %s", printer.nome, name)
                handler(printer.api_url, params)
                self.client.complete_command(printer, cid, ok=True)
            except Exception as exc:
                log.exception("[%s] erro executando %s: %s", printer.nome, name, exc)
                self.client.complete_command(printer, cid, ok=False, error=str(exc))

    def run(self) -> None:
        log.info("Agente iniciado — %d impressora(s) configurada(s).", len(self.cfg.printers))
        for p in self.cfg.printers:
            log.info("  • %s [%s] %s", p.nome or "(sem nome)", p.id[:8], p.api_url)

        last_tick = 0.0
        while not self.stop_flag:
            now = time.time()
            if now - last_tick >= POLL_INTERVAL_SECONDS:
                for printer in self.cfg.printers:
                    if self.stop_flag:
                        break
                    self.tick(printer)
                last_tick = now
            time.sleep(0.5)


def main():
    cfg = load_config()
    Agent(cfg).run()


if __name__ == "__main__":
    main()
