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
    webcam_url: str = ""    # ex: "http://192.168.1.129:8080/?action=snapshot"
    snapshot_interval: int = 30  # segundos entre snapshots automáticos (0 = desliga)


@dataclass
class AgentConfig:
    site_base_url: str      # ex: "https://3dkprint.com.br" ou endpoint da edge function
    telemetry_endpoint: str
    commands_endpoint: str
    job_endpoint: str
    snapshot_endpoint: str
    ai_analyze_endpoint: str
    ai_settings_endpoint: str
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
        job_endpoint=raw.get("job_endpoint", "/functions/v1/printer-job"),
        snapshot_endpoint=raw.get("snapshot_endpoint", "/functions/v1/printer-snapshot"),
        ai_analyze_endpoint=raw.get("ai_analyze_endpoint", "/functions/v1/printer-ai-analyze"),
        ai_settings_endpoint=raw.get("ai_settings_endpoint", "/functions/v1/printer-ai-settings"),
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
        "virtual_sdcard,idle_timeout,pause_resume,webhooks,"
        "gcode_move,fan,motion_report"
    )
    data = moonraker_get(api_url, f"/printer/objects/query?{objects}")
    return data.get("result", {}).get("status", {})


def moonraker_base_url(api_url: str) -> str:
    """Pega só scheme+host (sem porta) — pra acessar via nginx em :80 (webcam, etc)."""
    from urllib.parse import urlparse
    parsed = urlparse(api_url)
    return f"{parsed.scheme}://{parsed.hostname}"


def discover_webcam_url(api_url: str) -> str | None:
    """
    Tenta descobrir a URL de snapshot da webcam via /server/webcams/list (Moonraker
    componente "webcam"). Retorna URL absoluta ou None se não houver webcam configurada.
    """
    try:
        data = moonraker_get(api_url, "/server/webcams/list")
    except Exception:
        return None
    cams = (data.get("result") or {}).get("webcams") or []
    for c in cams:
        if not c.get("enabled", True):
            continue
        snap = c.get("snapshot_url") or c.get("stream_url")
        if not snap:
            continue
        if snap.startswith("http://") or snap.startswith("https://"):
            return snap
        # Path relativo — junta com o host (porta 80 via nginx)
        base = moonraker_base_url(api_url)
        if not snap.startswith("/"):
            snap = "/" + snap
        return base + snap
    return None


def get_history(api_url: str, limit: int = 50) -> list[dict[str, Any]]:
    """Lista o histórico de prints do Moonraker (componente history)."""
    try:
        data = moonraker_get(api_url, f"/server/history/list?limit={limit}")
        return data.get("result", {}).get("jobs", []) or []
    except Exception:
        return []


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

    gcode_move = raw_status.get("gcode_move", {}) or {}
    fan = raw_status.get("fan", {}) or {}
    velocity_factor_pct = round(float(gcode_move.get("speed_factor", 1.0)) * 100)
    extrude_factor_pct = round(float(gcode_move.get("extrude_factor", 1.0)) * 100)
    fan_pct = round(float(fan.get("speed", 0.0)) * 100)
    z_offset = float(gcode_move.get("homing_origin", [0, 0, 0, 0])[2] or 0) if isinstance(gcode_move.get("homing_origin"), list) else None

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
            "velocity_factor_pct": velocity_factor_pct,
            "extrude_factor_pct": extrude_factor_pct,
            "fan_pct": fan_pct,
            "z_offset_mm": z_offset,
            "pressure_advance": (extruder.get("pressure_advance") if isinstance(extruder, dict) else None),
            "smooth_time": (extruder.get("smooth_time") if isinstance(extruder, dict) else None),
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


def cmd_jog(api_url: str, params: dict) -> None:
    """
    Movimento relativo da cabeça/eixo.
    params = { axis: 'X'|'Y'|'Z', distance: number, feedrate?: number }
    """
    axis = (params.get("axis") or "X").upper()
    distance = float(params.get("distance", 0))
    feedrate = int(params.get("feedrate", 3000))
    if axis not in ("X", "Y", "Z", "E"):
        raise ValueError(f"axis inválido: {axis}")
    script = f"SAVE_GCODE_STATE NAME=__jog\nG91\nG1 {axis}{distance} F{feedrate}\nRESTORE_GCODE_STATE NAME=__jog"
    moonraker_post(api_url, "/printer/gcode/script", params={"script": script})


def cmd_baby_step(api_url: str, params: dict) -> None:
    """
    Z baby step (ajuste fino durante print).
    params = { delta: number } em mm. Positivo afasta o bico, negativo aproxima.
    """
    delta = float(params.get("delta", 0))
    moonraker_post(api_url, "/printer/gcode/script", params={"script": f"SET_GCODE_OFFSET Z_ADJUST={delta} MOVE=1"})


def cmd_load_filament(api_url: str, params: dict | None = None) -> None:
    """Executa macro LOAD_FILAMENT (assume que existe no printer.cfg do usuário)."""
    moonraker_post(api_url, "/printer/gcode/script", params={"script": "LOAD_FILAMENT"})


def cmd_unload_filament(api_url: str, params: dict | None = None) -> None:
    """Executa macro UNLOAD_FILAMENT."""
    moonraker_post(api_url, "/printer/gcode/script", params={"script": "UNLOAD_FILAMENT"})


def cmd_run_macro(api_url: str, params: dict) -> None:
    """
    Executa macro arbitrária. params = { name: 'PRINT_START', args?: { TEMP: 220, ... } }
    """
    name = params.get("name")
    if not name:
        raise ValueError("name obrigatório")
    args = params.get("args") or {}
    extra = " ".join(f"{k}={v}" for k, v in args.items())
    script = f"{name} {extra}".strip()
    moonraker_post(api_url, "/printer/gcode/script", params={"script": script})


def cmd_firmware_restart(api_url: str, params: dict | None = None) -> None:
    moonraker_post(api_url, "/printer/firmware_restart", timeout=30)


def cmd_klipper_restart(api_url: str, params: dict | None = None) -> None:
    moonraker_post(api_url, "/printer/restart", timeout=30)


def cmd_read_config(api_url: str, params: dict | None = None) -> dict:
    """Lê o arquivo printer.cfg via Moonraker. Retorna {filename, content}."""
    filename = (params or {}).get("filename") or "printer.cfg"
    r = requests.get(
        f"{api_url.rstrip('/')}/server/files/config/{filename}",
        timeout=MOONRAKER_TIMEOUT,
    )
    r.raise_for_status()
    return {"filename": filename, "content": r.text}


def cmd_save_config(api_url: str, params: dict) -> dict:
    """Sobe um novo printer.cfg. params = {filename?, content}. Aceita FIRMWARE_RESTART opcional."""
    filename = params.get("filename") or "printer.cfg"
    content = params.get("content")
    if content is None:
        raise ValueError("content vazio")
    files = {"file": (filename, content.encode("utf-8"), "text/plain")}
    r = requests.post(
        f"{api_url.rstrip('/')}/server/files/upload",
        files=files,
        data={"root": "config"},
        timeout=MOONRAKER_COMMAND_TIMEOUT,
    )
    r.raise_for_status()
    if params.get("restart"):
        moonraker_post(api_url, "/printer/firmware_restart", timeout=30)
    return {"saved": True, "filename": filename}


def cmd_list_macros(api_url: str, params: dict | None = None) -> dict:
    """Lista as macros (gcode_macro) carregadas no printer.cfg."""
    data = moonraker_get(api_url, "/printer/objects/list")
    objs = data.get("result", {}).get("objects", []) or []
    macros = sorted(
        [o.replace("gcode_macro ", "") for o in objs if o.startswith("gcode_macro ")]
    )
    return {"macros": macros}


def cmd_list_gcodes(api_url: str, params: dict | None = None) -> dict:
    """Lista todos os arquivos .gcode no Moonraker."""
    data = moonraker_get(api_url, "/server/files/list?root=gcodes")
    files = data.get("result", []) or []
    # Ordena por modificação (mais recente primeiro)
    files.sort(key=lambda f: f.get("modified", 0), reverse=True)
    return {"files": files[:200]}


def cmd_delete_gcode(api_url: str, params: dict) -> dict:
    """Deleta arquivo .gcode da SD/storage. params = { filename }"""
    fname = params.get("filename")
    if not fname:
        raise ValueError("filename obrigatório")
    r = requests.delete(f"{api_url.rstrip('/')}/server/files/gcodes/{fname}", timeout=MOONRAKER_TIMEOUT)
    r.raise_for_status()
    return {"deleted": fname}


def cmd_start_print_local(api_url: str, params: dict) -> dict:
    """Inicia print de um arquivo já existente na SD. params = { filename }"""
    fname = params.get("filename")
    if not fname:
        raise ValueError("filename obrigatório")
    r = requests.post(
        f"{api_url.rstrip('/')}/printer/print/start",
        params={"filename": fname},
        timeout=MOONRAKER_COMMAND_TIMEOUT,
    )
    r.raise_for_status()
    return {"started": fname}


def cmd_set_velocity_factor(api_url: str, params: dict) -> None:
    """Slider de velocidade % (M220 S<percent>)."""
    pct = int(params.get("percent", 100))
    moonraker_post(api_url, "/printer/gcode/script", params={"script": f"M220 S{pct}"})


def cmd_set_extrude_factor(api_url: str, params: dict) -> None:
    """Slider de extrusão % (M221 S<percent>)."""
    pct = int(params.get("percent", 100))
    moonraker_post(api_url, "/printer/gcode/script", params={"script": f"M221 S{pct}"})


def cmd_set_fan(api_url: str, params: dict) -> None:
    """Define velocidade do fan da peça. params = { percent: 0-100 } ou { fan_name: 'fan1', value: 0-1 }"""
    if "fan_name" in params:
        name = params["fan_name"]
        val = float(params.get("value", 0))
        moonraker_post(api_url, "/printer/gcode/script",
                      params={"script": f"SET_FAN_SPEED FAN={name} SPEED={val}"})
        return
    pct = int(params.get("percent", 0))
    s = round(pct * 255 / 100)
    moonraker_post(api_url, "/printer/gcode/script", params={"script": f"M106 S{s}"})


def cmd_save_config(api_url: str, params: dict | None = None) -> None:
    """Klipper SAVE_CONFIG (após calibrações). Reinicia o firmware."""
    moonraker_post(api_url, "/printer/gcode/script", params={"script": "SAVE_CONFIG"}, timeout=60)


def cmd_system_info(api_url: str, params: dict | None = None) -> dict:
    """Coleta info da máquina (RAM, CPU, disco, services)."""
    info = {}
    try:
        sysinfo = moonraker_get(api_url, "/machine/system_info")
        info["system"] = sysinfo.get("result", {}).get("system_info", {})
    except Exception as e:
        info["system_error"] = str(e)
    try:
        proc = moonraker_get(api_url, "/machine/proc_stats")
        info["proc"] = proc.get("result", {})
    except Exception as e:
        info["proc_error"] = str(e)
    try:
        upd = moonraker_get(api_url, "/machine/update/status")
        info["updates"] = upd.get("result", {})
    except Exception as e:
        info["updates_error"] = str(e)
    return info


def cmd_get_bed_mesh(api_url: str, params: dict | None = None) -> dict:
    """Retorna o último bed mesh ativo + perfis disponíveis."""
    data = moonraker_get(api_url,
        "/printer/objects/query?bed_mesh")
    bed = (data.get("result", {}).get("status", {}) or {}).get("bed_mesh", {})
    return bed


def cmd_set_pressure_advance(api_url: str, params: dict) -> None:
    """SET_PRESSURE_ADVANCE ADVANCE=<v> [SMOOTH_TIME=<v>]."""
    pa = float(params.get("advance", 0.04))
    st = params.get("smooth_time")
    script = f"SET_PRESSURE_ADVANCE ADVANCE={pa}"
    if st is not None:
        script += f" SMOOTH_TIME={float(st)}"
    moonraker_post(api_url, "/printer/gcode/script", params={"script": script})


def cmd_set_velocity_limits(api_url: str, params: dict) -> None:
    """SET_VELOCITY_LIMIT VELOCITY=.. ACCEL=.. ACCEL_TO_DECEL=.. SQUARE_CORNER_VELOCITY=.."""
    pieces = ["SET_VELOCITY_LIMIT"]
    for k, key in (("VELOCITY", "velocity"), ("ACCEL", "accel"),
                   ("ACCEL_TO_DECEL", "accel_to_decel"),
                   ("SQUARE_CORNER_VELOCITY", "square_corner_velocity")):
        if key in params and params[key] is not None:
            pieces.append(f"{k}={float(params[key])}")
    if len(pieces) == 1:
        return
    moonraker_post(api_url, "/printer/gcode/script", params={"script": " ".join(pieces)})


def cmd_capture_snapshot(api_url: str, params: dict) -> dict:
    """Captura snapshot da webcam e devolve bytes em base64 (o site faz o upload no Storage)."""
    import base64
    webcam_url = params.get("webcam_url")
    if not webcam_url:
        raise ValueError("webcam_url vazio")
    r = requests.get(webcam_url, timeout=10, stream=True)
    r.raise_for_status()
    return {
        "image_base64": base64.b64encode(r.content).decode("ascii"),
        "content_type": r.headers.get("Content-Type", "image/jpeg"),
    }


def cmd_ai_analyze(api_url: str, params: dict) -> dict:
    """
    Comando manual de análise — captura webcam e envia para a Edge Function
    printer-ai-analyze. params = {webcam_url}. Retorna resultado da IA.
    Esta função é mais usada pelo próprio agente no loop automático,
    mas pode ser disparada manualmente também.
    """
    # Esse handler é stub — análise real é feita pelo loop em Agent.tick
    # via SiteClient.ai_analyze. Aqui só capturamos pra retornar via comando.
    res = cmd_capture_snapshot(api_url, params)
    return {"image_captured": True, "size": len(res.get("image_base64", ""))}


def cmd_sync_ai_settings(api_url: str, params: dict | None = None) -> dict:
    """No-op: o agente já busca ai_settings periodicamente. Existe pra
    forçar refresh imediato via comando do site."""
    return {"synced": True}


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
    "jog": lambda api, params: cmd_jog(api, params),
    "baby_step": lambda api, params: cmd_baby_step(api, params),
    "load_filament": lambda api, params: cmd_load_filament(api, params),
    "unload_filament": lambda api, params: cmd_unload_filament(api, params),
    "run_macro": lambda api, params: cmd_run_macro(api, params),
    "firmware_restart": lambda api, params: cmd_firmware_restart(api, params),
    "klipper_restart": lambda api, params: cmd_klipper_restart(api, params),
    "read_config": lambda api, params: cmd_read_config(api, params),
    "save_config": lambda api, params: cmd_save_config(api, params),
    "list_macros": lambda api, params: cmd_list_macros(api, params),
    "capture_snapshot": lambda api, params: cmd_capture_snapshot(api, params),
    "list_gcodes": lambda api, params: cmd_list_gcodes(api, params),
    "delete_gcode": lambda api, params: cmd_delete_gcode(api, params),
    "start_print_local": lambda api, params: cmd_start_print_local(api, params),
    "set_velocity_factor": lambda api, params: cmd_set_velocity_factor(api, params),
    "set_extrude_factor": lambda api, params: cmd_set_extrude_factor(api, params),
    "set_fan": lambda api, params: cmd_set_fan(api, params),
    "klipper_save_config": lambda api, params: cmd_save_config(api, params),
    "system_info": lambda api, params: cmd_system_info(api, params),
    "get_bed_mesh": lambda api, params: cmd_get_bed_mesh(api, params),
    "set_pressure_advance": lambda api, params: cmd_set_pressure_advance(api, params),
    "set_velocity_limits": lambda api, params: cmd_set_velocity_limits(api, params),
    "ai_analyze": lambda api, params: cmd_ai_analyze(api, params),
    "sync_ai_settings": lambda api, params: cmd_sync_ai_settings(api, params),
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

    def complete_command(
        self, printer: PrinterConfig, command_id: str, ok: bool,
        error: str | None = None, result: Any = None,
    ) -> None:
        url = self._url(self.cfg.commands_endpoint)
        payload: dict[str, Any] = {
            "command_id": command_id,
            "status": "done" if ok else "failed",
            "error_message": error,
        }
        if result is not None:
            payload["result"] = result
        try:
            self.session.patch(
                url, json=payload, headers=self._headers(printer.agente_token),
                timeout=TELEMETRY_TIMEOUT,
            )
        except Exception as exc:
            log.warning("[%s] complete_command erro: %s", printer.nome, exc)

    def push_job_event(self, printer: PrinterConfig, event: dict) -> None:
        """POST pra /functions/v1/printer-job — agente reporta início/fim de print."""
        url = self._url(self.cfg.job_endpoint)
        try:
            self.session.post(
                url, json={"printer_id": printer.id, "event": event},
                headers=self._headers(printer.agente_token),
                timeout=TELEMETRY_TIMEOUT,
            )
        except Exception as exc:
            log.warning("[%s] job event erro: %s", printer.nome, exc)

    def push_snapshot(self, printer: PrinterConfig, image_base64: str, content_type: str) -> None:
        url = self._url(self.cfg.snapshot_endpoint)
        try:
            self.session.post(
                url,
                json={
                    "printer_id": printer.id,
                    "image_base64": image_base64,
                    "content_type": content_type,
                },
                headers=self._headers(printer.agente_token),
                timeout=30,
            )
        except Exception as exc:
            log.warning("[%s] snapshot erro: %s", printer.nome, exc)

    def fetch_ai_settings(self, printer: PrinterConfig) -> dict | None:
        """Pega configurações de IA da impressora. Retorna None se desabilitado/erro."""
        url = self._url(self.cfg.ai_settings_endpoint) + f"?printer_id={printer.id}"
        try:
            r = self.session.get(url, headers=self._headers(printer.agente_token), timeout=10)
            if r.status_code != 200:
                return None
            return r.json().get("settings") or None
        except Exception:
            return None

    def ai_analyze(self, printer: PrinterConfig, image_base64: str, content_type: str) -> dict | None:
        """Posta a imagem pra Edge Function analisar. Retorna {failure_type, confidence, ...}."""
        url = self._url(self.cfg.ai_analyze_endpoint)
        try:
            r = self.session.post(
                url,
                json={
                    "printer_id": printer.id,
                    "image_base64": image_base64,
                    "content_type": content_type,
                },
                headers=self._headers(printer.agente_token),
                timeout=60,  # GPT-4V pode demorar
            )
            if r.status_code != 200:
                log.warning("[%s] ai_analyze %s: %s", printer.nome, r.status_code, r.text[:200])
                return None
            return r.json()
        except Exception as exc:
            log.warning("[%s] ai_analyze erro: %s", printer.nome, exc)
            return None


# =======================================================================
# Loop principal
# =======================================================================
class Agent:
    def __init__(self, cfg: AgentConfig):
        self.cfg = cfg
        self.client = SiteClient(cfg)
        self.stop_flag = False
        # estado anterior (printing/standby/...) por impressora — pra detectar transições
        self.last_state: dict[str, str] = {}
        # último arquivo impresso por impressora (preservar quando volta pra standby)
        self.last_file: dict[str, str] = {}
        # último snapshot ts por impressora (auto-snapshot durante print)
        self.last_snapshot: dict[str, float] = {}
        # ai cache: settings + último ts de análise por impressora
        self.ai_settings_cache: dict[str, dict] = {}
        self.last_ai_check: dict[str, float] = {}
        self.last_ai_analysis: dict[str, float] = {}
        signal.signal(signal.SIGINT, self._graceful_stop)
        signal.signal(signal.SIGTERM, self._graceful_stop)

    def _graceful_stop(self, *_):
        log.info("Sinal recebido, finalizando...")
        self.stop_flag = True

    def _detect_job_transitions(self, printer: PrinterConfig, telemetry: dict, raw: dict) -> None:
        """Compara estado atual com último para criar/finalizar jobs no banco."""
        cur = telemetry.get("state") or "offline"
        prev = self.last_state.get(printer.id)
        filename = telemetry.get("current_file")
        if filename:
            self.last_file[printer.id] = filename
        # raw vem do moonraker_status, tem print_stats com state mais granular
        ps = (raw or {}).get("print_stats", {}) or {}
        klipper_state = ps.get("state")  # standby, printing, paused, complete, cancelled, error

        if prev != cur:
            # transições "fim de job"
            if prev == "printing" and cur in ("standby", "error"):
                last_filename = self.last_file.get(printer.id)
                if klipper_state == "complete":
                    event_status = "completed"
                elif klipper_state == "cancelled":
                    event_status = "cancelled"
                elif klipper_state == "error" or cur == "error":
                    event_status = "failed"
                else:
                    event_status = "completed"  # padrão
                self.client.push_job_event(printer, {
                    "type": "finished",
                    "status": event_status,
                    "filename": last_filename,
                    "duration_seconds": int(ps.get("print_duration") or 0),
                    "filament_used_mm": ps.get("filament_used"),
                    "failure_reason": ps.get("message") if event_status != "completed" else None,
                })
                log.info("[%s] job finalizado (%s, arquivo=%s)", printer.nome, event_status, last_filename)
            # transição "início de job"
            elif cur == "printing" and prev != "paused":
                self.client.push_job_event(printer, {
                    "type": "started",
                    "filename": filename,
                })
                log.info("[%s] job iniciado: %s", printer.nome, filename)
        self.last_state[printer.id] = cur

    def _maybe_run_ai(self, printer: PrinterConfig, state: str) -> None:
        """
        Loop de AI Failure Detection. Só roda se:
          - Estado = printing
          - ai_settings.ai_enabled = true
          - Webcam configurada
          - Passou snapshot_interval segundos desde a última análise
        Captura snapshot, envia pra Edge Function ai-analyze, recebe resultado.
        Se confidence >= threshold E pause_on_failure → enfileira comando 'pause'.
        """
        if state != "printing" or not printer.webcam_url:
            return
        # Refresh das settings a cada 60s
        now = time.time()
        if now - self.last_ai_check.get(printer.id, 0) > 60:
            settings = self.client.fetch_ai_settings(printer)
            if settings:
                self.ai_settings_cache[printer.id] = settings
            self.last_ai_check[printer.id] = now

        s = self.ai_settings_cache.get(printer.id)
        if not s or not s.get("ai_enabled"):
            return

        interval = max(10, int(s.get("snapshot_interval_seconds", 60)))
        if now - self.last_ai_analysis.get(printer.id, 0) < interval:
            return

        # Captura webcam
        try:
            r = requests.get(printer.webcam_url, timeout=10)
            r.raise_for_status()
            import base64
            img_b64 = base64.b64encode(r.content).decode("ascii")
            ct = r.headers.get("Content-Type", "image/jpeg")
        except Exception as exc:
            log.warning("[%s] AI: captura webcam falhou: %s", printer.nome, exc)
            return

        result = self.client.ai_analyze(printer, img_b64, ct)
        self.last_ai_analysis[printer.id] = now
        if not result:
            return

        # Resultado esperado: {failure_detected: bool, failure_type, confidence, ...}
        if not result.get("failure_detected"):
            log.debug("[%s] AI: ok (%s)", printer.nome, result.get("notes", "no failure"))
            return

        ft = result.get("failure_type", "unknown_failure")
        conf = float(result.get("confidence", 0))
        threshold = float(s.get("confidence_threshold", 0.75))
        log.warning("[%s] AI: FALHA detectada %s (conf=%.2f, threshold=%.2f)",
                    printer.nome, ft, conf, threshold)

        # Pause automático se configurado
        if conf >= threshold and s.get("pause_on_failure"):
            try:
                cmd_pause(printer.api_url)
                log.warning("[%s] AI: PAUSE automático executado", printer.nome)
            except Exception as exc:
                log.error("[%s] AI: falha ao pausar: %s", printer.nome, exc)

    def _maybe_capture_snapshot(self, printer: PrinterConfig, state: str) -> None:
        if not printer.webcam_url or printer.snapshot_interval <= 0:
            return
        if state != "printing":
            return
        now = time.time()
        last = self.last_snapshot.get(printer.id, 0)
        if now - last < printer.snapshot_interval:
            return
        try:
            r = requests.get(printer.webcam_url, timeout=10)
            r.raise_for_status()
            import base64
            img_b64 = base64.b64encode(r.content).decode("ascii")
            ct = r.headers.get("Content-Type", "image/jpeg")
            self.client.push_snapshot(printer, img_b64, ct)
            self.last_snapshot[printer.id] = now
            log.debug("[%s] snapshot enviado (%d bytes)", printer.nome, len(r.content))
        except Exception as exc:
            log.warning("[%s] snapshot falhou: %s", printer.nome, exc)

    def tick(self, printer: PrinterConfig) -> None:
        # 1) Coletar telemetria do Moonraker e enviar ao site
        raw_status: dict[str, Any] = {}
        try:
            raw_status = moonraker_status(printer.api_url)
            telemetry = parse_telemetry(raw_status)
        except Exception as exc:
            log.warning("[%s] Moonraker offline: %s", printer.nome, exc)
            telemetry = {"state": "offline", "state_message": str(exc)}

        self.client.push_telemetry(printer, telemetry)

        # 2) Detectar transições de estado e enviar eventos de job
        self._detect_job_transitions(printer, telemetry, raw_status)

        # 3) Auto-snapshot durante print
        self._maybe_capture_snapshot(printer, telemetry.get("state") or "")

        # 3b) AI Failure Detection
        self._maybe_run_ai(printer, telemetry.get("state") or "")

        # 4) Buscar comandos pendentes e executar
        commands = self.client.fetch_commands(printer)
        for cmd in commands:
            cid = cmd.get("id")
            name = cmd.get("command")
            params = cmd.get("params") or {}
            # injeta webcam_url se for capture_snapshot e não veio
            if name == "capture_snapshot" and "webcam_url" not in params:
                params["webcam_url"] = printer.webcam_url
            handler = COMMAND_HANDLERS.get(name)
            if not handler:
                log.error("[%s] comando desconhecido: %s", printer.nome, name)
                self.client.complete_command(printer, cid, ok=False, error=f"Comando desconhecido: {name}")
                continue
            try:
                log.info("[%s] executando comando %s", printer.nome, name)
                ret = handler(printer.api_url, params)
                self.client.complete_command(printer, cid, ok=True, result=ret)
            except Exception as exc:
                log.exception("[%s] erro executando %s: %s", printer.nome, name, exc)
                self.client.complete_command(printer, cid, ok=False, error=str(exc))

    def run(self) -> None:
        log.info("Agente iniciado — %d impressora(s) configurada(s).", len(self.cfg.printers))
        for p in self.cfg.printers:
            log.info("  • %s [%s] %s", p.nome or "(sem nome)", p.id[:8], p.api_url)
            # Auto-discovery de webcam quando não configurada manualmente
            if not p.webcam_url:
                discovered = discover_webcam_url(p.api_url)
                if discovered:
                    p.webcam_url = discovered
                    log.info("    webcam descoberta automaticamente: %s", discovered)
            if p.webcam_url:
                log.info("    webcam: %s (a cada %ds)", p.webcam_url, p.snapshot_interval)

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
