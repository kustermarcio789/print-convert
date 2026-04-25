import React, { useState } from 'react';
import {
  X,
  Move,
  Thermometer,
  Terminal as TerminalIcon,
  RefreshCw,
  PackagePlus,
  PackageMinus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PrinterDevice, enviarComando } from '@/lib/printerControl';

interface Props {
  impressora: PrinterDevice;
  onClose: () => void;
}

const JOG_DISTANCES = [0.1, 1, 10, 100];
const BABYSTEP_DELTAS = [0.025, 0.05, 0.1];

/**
 * Modal "Controles Avançados" — paridade básica com Mainsail/Fluidd:
 * jog XYZ, aquecimento manual, console gcode, macros (carregar/descarregar
 * filamento, executar arbitrária), Z babysteps, restart de firmware.
 */
export default function PrinterAdvancedControls({ impressora, onClose }: Props) {
  const [tab, setTab] = useState<'movement' | 'temp' | 'console' | 'macros'>('movement');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div>
            <div className="font-semibold">Controles avançados</div>
            <div className="text-xs text-gray-500">{impressora.nome} · {impressora.firmware_tipo}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b text-sm">
          {[
            { id: 'movement', label: 'Movimento', icon: <Move className="w-4 h-4" /> },
            { id: 'temp', label: 'Aquecimento', icon: <Thermometer className="w-4 h-4" /> },
            { id: 'console', label: 'Console', icon: <TerminalIcon className="w-4 h-4" /> },
            { id: 'macros', label: 'Macros', icon: <RefreshCw className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'movement' && <MovementTab impressora={impressora} />}
          {tab === 'temp' && <TempTab impressora={impressora} />}
          {tab === 'console' && <ConsoleTab impressora={impressora} />}
          {tab === 'macros' && <MacrosTab impressora={impressora} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Movement: Home, Jog XYZ, babysteps Z
// ============================================================
function MovementTab({ impressora }: { impressora: PrinterDevice }) {
  const [distance, setDistance] = useState<number>(10);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const send = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const jog = (axis: 'X' | 'Y' | 'Z', sign: 1 | -1) =>
    send(`jog-${axis}${sign}`, () =>
      enviarComando(impressora.id, 'jog', { axis, distance: distance * sign })
    );

  const baby = (delta: number) =>
    send(`baby-${delta}`, () =>
      enviarComando(impressora.id, 'baby_step', { delta })
    );

  return (
    <div className="space-y-5">
      {/* Home */}
      <div>
        <Label>Home</Label>
        <div className="grid grid-cols-4 gap-2 mt-1">
          <Button variant="outline" size="sm" onClick={() => send('home-all', () => enviarComando(impressora.id, 'home'))} disabled={!!busy}>
            <HomeIcon className="w-4 h-4 mr-1" /> All
          </Button>
          <Button variant="outline" size="sm" onClick={() => send('home-x', () => enviarComando(impressora.id, 'home', { axes: 'x' }))} disabled={!!busy}>X</Button>
          <Button variant="outline" size="sm" onClick={() => send('home-y', () => enviarComando(impressora.id, 'home', { axes: 'y' }))} disabled={!!busy}>Y</Button>
          <Button variant="outline" size="sm" onClick={() => send('home-z', () => enviarComando(impressora.id, 'home', { axes: 'z' }))} disabled={!!busy}>Z</Button>
        </div>
      </div>

      {/* Jog distance selector */}
      <div>
        <Label>Distância de movimento (mm)</Label>
        <div className="flex gap-2 mt-1">
          {JOG_DISTANCES.map((d) => (
            <button
              key={d}
              onClick={() => setDistance(d)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                distance === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* XY pad + Z stack */}
      <div className="grid grid-cols-[1fr_auto] gap-6">
        {/* XY cross pad */}
        <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
          <div />
          <Button variant="outline" size="sm" onClick={() => jog('Y', 1)} disabled={!!busy}><ChevronUp className="w-4 h-4" /></Button>
          <div />
          <Button variant="outline" size="sm" onClick={() => jog('X', -1)} disabled={!!busy}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="text-center text-xs text-gray-500 self-center">XY</div>
          <Button variant="outline" size="sm" onClick={() => jog('X', 1)} disabled={!!busy}><ChevronRight className="w-4 h-4" /></Button>
          <div />
          <Button variant="outline" size="sm" onClick={() => jog('Y', -1)} disabled={!!busy}><ChevronDown className="w-4 h-4" /></Button>
          <div />
        </div>

        {/* Z stack */}
        <div className="flex flex-col items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => jog('Z', 1)} disabled={!!busy}><ChevronUp className="w-4 h-4" /></Button>
          <div className="text-xs text-gray-500">Z</div>
          <Button variant="outline" size="sm" onClick={() => jog('Z', -1)} disabled={!!busy}><ChevronDown className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Z babysteps */}
      <div>
        <Label>Z baby step <span className="text-xs text-gray-500 font-normal">(durante o print)</span></Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {BABYSTEP_DELTAS.map((d) => (
            <React.Fragment key={d}>
              <Button variant="outline" size="sm" onClick={() => baby(-d)} disabled={!!busy}>−{d}</Button>
              <Button variant="outline" size="sm" onClick={() => baby(+d)} disabled={!!busy}>+{d}</Button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {err && <ErrorBanner err={err} />}
      {busy && <div className="text-xs text-gray-500 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" />Comando enfileirado…</div>}
    </div>
  );
}

// ============================================================
// Aquecimento manual
// ============================================================
function TempTab({ impressora }: { impressora: PrinterDevice }) {
  const [extruder, setExtruder] = useState<string>('');
  const [bed, setBed] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const setTemp = async (target: 'extruder' | 'bed', valueStr: string) => {
    const t = parseFloat(valueStr);
    if (Number.isNaN(t)) {
      setErr('Temperatura inválida');
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await enviarComando(
        impressora.id,
        target === 'extruder' ? 'set_temp_extruder' : 'set_temp_bed',
        { temperature: t }
      );
      setMsg(`Temperatura ${target === 'extruder' ? 'do bico' : 'da mesa'} ajustada para ${t}°C.`);
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Extruder */}
      <div>
        <Label>Bico (extruder) °C</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="number"
            min={0}
            max={300}
            value={extruder}
            placeholder="ex: 220"
            onChange={(e) => setExtruder(e.target.value)}
          />
          <Button onClick={() => setTemp('extruder', extruder)} disabled={busy || !extruder}>Aplicar</Button>
          <Button variant="outline" onClick={() => setTemp('extruder', '0')} disabled={busy}>Desligar</Button>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {[200, 215, 220, 230, 240, 260].map((t) => (
            <button
              key={t}
              onClick={() => setExtruder(String(t))}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              disabled={busy}
            >
              {t}°
            </button>
          ))}
        </div>
      </div>

      {/* Mesa */}
      <div>
        <Label>Mesa (bed) °C</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="number"
            min={0}
            max={120}
            value={bed}
            placeholder="ex: 60"
            onChange={(e) => setBed(e.target.value)}
          />
          <Button onClick={() => setTemp('bed', bed)} disabled={busy || !bed}>Aplicar</Button>
          <Button variant="outline" onClick={() => setTemp('bed', '0')} disabled={busy}>Desligar</Button>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {[50, 60, 70, 80, 100, 110].map((t) => (
            <button
              key={t}
              onClick={() => setBed(String(t))}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              disabled={busy}
            >
              {t}°
            </button>
          ))}
        </div>
      </div>

      {msg && <div className="text-xs text-green-700 bg-green-50 rounded p-2">{msg}</div>}
      {err && <ErrorBanner err={err} />}
    </div>
  );
}

// ============================================================
// Console GCODE
// ============================================================
function ConsoleTab({ impressora }: { impressora: PrinterDevice }) {
  const [gcode, setGcode] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const send = async () => {
    if (!gcode.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await enviarComando(impressora.id, 'gcode_raw', { gcode });
      setHistory((h) => [gcode, ...h].slice(0, 30));
      setGcode('');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Enviar GCODE</Label>
      <div className="flex gap-2">
        <Input
          value={gcode}
          onChange={(e) => setGcode(e.target.value)}
          placeholder="G1 X100 Y100 F3000"
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="font-mono"
        />
        <Button onClick={send} disabled={busy || !gcode.trim()}>Enviar</Button>
      </div>

      <div className="text-xs text-gray-500">
        ⚠️ Comandos arbitrários — use com cuidado. Sintaxe Klipper / Marlin.
      </div>

      {err && <ErrorBanner err={err} />}

      {history.length > 0 && (
        <div>
          <Label>Histórico recente</Label>
          <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-gray-100 max-h-60 overflow-y-auto space-y-1">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => setGcode(h)}
                className="block w-full text-left hover:bg-gray-800 px-1 rounded"
              >
                {'> '}{h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Macros: Load/Unload Filament + executar macro arbitrária + restart
// ============================================================
function MacrosTab({ impressora }: { impressora: PrinterDevice }) {
  const [macroName, setMacroName] = useState<string>('');
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Macros comuns de filamento */}
      <div>
        <Label>Filamento</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Button
            variant="outline"
            onClick={() => run('load', () => enviarComando(impressora.id, 'load_filament'))}
            disabled={!!busy}
          >
            <PackagePlus className="w-4 h-4 mr-1" /> Carregar
          </Button>
          <Button
            variant="outline"
            onClick={() => run('unload', () => enviarComando(impressora.id, 'unload_filament'))}
            disabled={!!busy}
          >
            <PackageMinus className="w-4 h-4 mr-1" /> Descarregar
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Requer macros <code>LOAD_FILAMENT</code> e <code>UNLOAD_FILAMENT</code> definidas
          no <code>printer.cfg</code> da máquina.
        </div>
      </div>

      {/* Run macro arbitrária */}
      <div>
        <Label>Executar macro</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={macroName}
            onChange={(e) => setMacroName(e.target.value.toUpperCase())}
            placeholder="ex: PRINT_START, BED_MESH_CALIBRATE"
            className="font-mono"
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              macroName &&
              run('macro', () => enviarComando(impressora.id, 'run_macro', { name: macroName }))
            }
          />
          <Button
            onClick={() =>
              macroName && run('macro', () => enviarComando(impressora.id, 'run_macro', { name: macroName }))
            }
            disabled={!!busy || !macroName}
          >
            Executar
          </Button>
        </div>
      </div>

      {/* Restarts */}
      <div>
        <Label>Sistema</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Button
            variant="outline"
            onClick={() =>
              window.confirm('FIRMWARE_RESTART vai reiniciar o firmware da impressora. Confirmar?') &&
              run('fw', () => enviarComando(impressora.id, 'firmware_restart'))
            }
            disabled={!!busy}
          >
            FIRMWARE_RESTART
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.confirm('Reiniciar Klipper. Confirmar?') &&
              run('kl', () => enviarComando(impressora.id, 'klipper_restart'))
            }
            disabled={!!busy}
          >
            RESTART (Klippy)
          </Button>
        </div>
      </div>

      {err && <ErrorBanner err={err} />}
    </div>
  );
}

// ============================================================
// Helpers locais (não exportados)
// ============================================================
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-gray-700">{children}</div>;
}

function ErrorBanner({ err }: { err: string }) {
  return <div className="text-xs text-red-700 bg-red-50 rounded p-2">{err}</div>;
}
