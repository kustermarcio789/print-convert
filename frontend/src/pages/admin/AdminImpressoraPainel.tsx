import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Camera, Pause, Play, Square, AlertOctagon, RotateCcw, Upload,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Home as HomeIcon,
  Thermometer, Cpu, HardDrive, Loader2, Send, Trash2, Sliders, BarChart3,
  PackagePlus, PackageMinus, RefreshCw, Rocket,
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PrinterDevice, PrinterTelemetry, GcodeOnPrinter, PrinterMacro,
  enviarComando, formatDuration, getTelemetry, stateColor, stateLabel,
  listarImpressorasConectadas, ultimoSnapshot, publicSnapshotUrl,
  listarGcodesImpressora, deletarGcodeImpressora, iniciarPrintLocal,
  definirVelocityFactor, definirExtrudeFactor, definirFan,
  listarMacros,
} from '@/lib/printerControl';
import PrinterDetailModal from '@/components/admin/impressora/PrinterDetailModal';
import UploadGcodeDialog from '@/components/admin/impressora/UploadGcodeDialog';

const JOG_DIST = [0.1, 1, 10, 100];
const BABYSTEP = [0.025, 0.05, 0.1];

export default function AdminImpressoraPainel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [impressora, setImpressora] = useState<PrinterDevice | null>(null);
  const [telemetry, setTelemetry] = useState<PrinterTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    listarImpressorasConectadas().then((list) => {
      const found = list.find((p) => p.id === id);
      setImpressora(found ?? null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const tick = async () => {
      const t = await getTelemetry(id);
      if (!cancelled) setTelemetry(t);
    };
    tick();
    const it = window.setInterval(tick, 3000);
    return () => { cancelled = true; window.clearInterval(it); };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  if (!impressora) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Impressora não encontrada.
      </div>
    );
  }

  const state = telemetry?.state ?? 'offline';
  const isPrinting = state === 'printing';
  const isPaused = state === 'paused';
  const isOnline = state !== 'offline';
  const updatedAgo = telemetry?.updated_at
    ? Math.max(0, Math.floor((Date.now() - new Date(telemetry.updated_at).getTime()) / 1000))
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminHeader title={`Painel — ${impressora.nome}`} />

        {/* HERO BAR sticky com status + ações críticas */}
        <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/impressoras')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>

            <div className={`w-3 h-3 rounded-full ${stateColor(state)} ${isOnline ? 'animate-pulse' : ''}`} />
            <div className="flex flex-col">
              <div className="font-semibold leading-tight">{impressora.nome}</div>
              <div className="text-xs text-gray-500">
                {stateLabel(state)} · {updatedAgo !== null ? `${updatedAgo}s atrás` : '—'} · {impressora.firmware_tipo}
              </div>
            </div>

            <div className="flex-1" />

            {(isPrinting || isPaused) && (
              <>
                {isPrinting && (
                  <Button size="sm" variant="outline" onClick={() => enviarComando(impressora.id, 'pause')}>
                    <Pause className="w-4 h-4 mr-1" /> Pausar
                  </Button>
                )}
                {isPaused && (
                  <Button size="sm" onClick={() => enviarComando(impressora.id, 'resume')}>
                    <Play className="w-4 h-4 mr-1" /> Retomar
                  </Button>
                )}
                <Button size="sm" variant="outline"
                  onClick={() => window.confirm('Cancelar print atual?') && enviarComando(impressora.id, 'cancel')}>
                  <Square className="w-4 h-4 mr-1" /> Cancelar
                </Button>
              </>
            )}

            {!isPrinting && !isPaused && (
              <Button size="sm" onClick={() => setUploadOpen(true)} disabled={!isOnline}>
                <Upload className="w-4 h-4 mr-1" /> Imprimir GCODE
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => navigate(`/admin/impressoras/${impressora.id}/cockpit`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              <Rocket className="w-4 h-4 mr-1" /> Cockpit Mode
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDetalhesOpen(true)}>
              <BarChart3 className="w-4 h-4 mr-1" /> Detalhes
            </Button>
            <Button size="sm" variant="destructive"
              onClick={() => window.confirm('EMERGENCY STOP — confirmar?') && enviarComando(impressora.id, 'emergency_stop')}>
              <AlertOctagon className="w-4 h-4 mr-1" /> E-Stop
            </Button>
          </div>
        </div>

        {/* GRID principal */}
        <div className="max-w-screen-2xl mx-auto p-4 grid grid-cols-12 gap-4">
          {/* COLUNA ESQUERDA — Câmera + Status visual */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <CameraCard impressora={impressora} />
            <ProgressCard telemetry={telemetry} isPrinting={isPrinting} isPaused={isPaused} />
            <TempCard telemetry={telemetry} impressora={impressora} />
          </div>

          {/* COLUNA CENTRAL — Movimentação + sliders ao vivo */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <MovementCard impressora={impressora} disabled={!isOnline} />
            {(isPrinting || isPaused) && (
              <LiveSlidersCard
                impressora={impressora}
                velocityPct={(telemetry as any)?.raw?.velocity_factor_pct ?? 100}
                extrudePct={(telemetry as any)?.raw?.extrude_factor_pct ?? 100}
                fanPct={(telemetry as any)?.raw?.fan_pct ?? 0}
              />
            )}
            <BabystepCard impressora={impressora} disabled={!isOnline}
              currentZOffset={(telemetry as any)?.raw?.z_offset_mm} />
          </div>

          {/* COLUNA DIREITA — Operações */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <FilesCard impressora={impressora} disabled={!isOnline} />
            <MacrosCard impressora={impressora} disabled={!isOnline} />
            <ConsoleCard impressora={impressora} />
          </div>
        </div>

        {detalhesOpen && (
          <PrinterDetailModal impressora={impressora} onClose={() => setDetalhesOpen(false)} />
        )}
        {uploadOpen && (
          <UploadGcodeDialog impressora={impressora} onClose={() => setUploadOpen(false)} />
        )}
      </main>
    </div>
  );
}

// ============================================================
// Cards
// ============================================================

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b flex items-center justify-between bg-gray-50">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CameraCard({ impressora }: { impressora: PrinterDevice }) {
  const [snap, setSnap] = useState<{ url: string; takenAt: string } | null>(null);
  const [streamError, setStreamError] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const s = await ultimoSnapshot(impressora.id);
    if (s) setSnap({ url: publicSnapshotUrl(s.storage_path), takenAt: s.taken_at });
  };
  useEffect(() => { reload(); }, [impressora.id]);

  const publicStream = impressora.webcam_public_url
    || (impressora.public_base_url ? impressora.public_base_url.replace(/\/+$/, '') + '/webcam/?action=stream' : null);
  const localUrl = (() => {
    if (!impressora.api_url) return null;
    try { const u = new URL(impressora.api_url); return `${u.protocol}//${u.hostname}/`; }
    catch { return null; }
  })();

  const captureNow = async () => {
    setBusy(true);
    try {
      await enviarComando(impressora.id, 'capture_snapshot');
      setTimeout(reload, 4500);
    } finally {
      setTimeout(() => setBusy(false), 4500);
    }
  };

  return (
    <Section
      title="Câmera"
      action={
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={captureNow} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </Button>
        </div>
      }
    >
      {publicStream && !streamError ? (
        <img
          src={publicStream}
          alt="Stream ao vivo"
          className="w-full rounded bg-black"
          onError={() => setStreamError(true)}
        />
      ) : snap ? (
        <>
          <img src={snap.url} className="w-full rounded bg-black" alt="Foto" />
          <div className="text-xs text-gray-500 mt-1">
            Foto: {new Date(snap.takenAt).toLocaleTimeString('pt-BR')}
          </div>
        </>
      ) : (
        <div className="aspect-video bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
          Sem foto ainda — clique no ícone acima pra capturar
        </div>
      )}
      <div className="flex gap-2 mt-2 flex-wrap">
        {localUrl && (
          <Button size="sm" variant="outline" className="text-xs"
            onClick={() => window.open(localUrl, '_blank', 'noopener')}>
            🏠 Mainsail local
          </Button>
        )}
        {impressora.public_base_url && (
          <Button size="sm" variant="outline" className="text-xs"
            onClick={() => window.open(impressora.public_base_url!, '_blank', 'noopener')}>
            🌐 Mainsail público
          </Button>
        )}
      </div>
    </Section>
  );
}

function ProgressCard({ telemetry, isPrinting, isPaused }: { telemetry: PrinterTelemetry | null; isPrinting: boolean; isPaused: boolean }) {
  if (!isPrinting && !isPaused) {
    return (
      <Section title="Job atual">
        <div className="text-center py-3 text-sm text-gray-500 italic">
          Sem job em andamento
        </div>
      </Section>
    );
  }
  const progress = telemetry?.progress ?? 0;
  return (
    <Section title="Job atual">
      <div className="text-sm font-medium truncate mb-2" title={telemetry?.current_file ?? ''}>
        📄 {telemetry?.current_file ?? '(sem arquivo)'}
      </div>
      <div className="h-3 bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-full transition-all ${isPaused ? 'bg-yellow-400' : 'bg-green-500'}`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{progress.toFixed(1)}%</span>
        <span>{formatDuration(telemetry?.print_duration_seconds)} / ~{formatDuration(telemetry?.print_time_remaining_seconds)} restantes</span>
      </div>
    </Section>
  );
}

function TempCard({ telemetry, impressora }: { telemetry: PrinterTelemetry | null; impressora: PrinterDevice }) {
  const [setExt, setSetExt] = useState<string>('');
  const [setBed, setSetBed] = useState<string>('');

  const aplicar = (target: 'extruder' | 'bed', valStr: string) => {
    const v = parseFloat(valStr);
    if (Number.isNaN(v)) return;
    enviarComando(impressora.id,
      target === 'extruder' ? 'set_temp_extruder' : 'set_temp_bed',
      { temperature: v });
  };

  return (
    <Section title="Temperaturas">
      <div className="grid grid-cols-2 gap-3">
        <TempBlock
          label="Bico"
          current={telemetry?.extruder_temp ?? 0}
          target={telemetry?.extruder_target ?? 0}
          presets={[200, 215, 220, 240, 260]}
          input={setExt}
          onInput={setSetExt}
          onApply={() => aplicar('extruder', setExt)}
          onOff={() => { setSetExt('0'); aplicar('extruder', '0'); }}
        />
        <TempBlock
          label="Mesa"
          current={telemetry?.bed_temp ?? 0}
          target={telemetry?.bed_target ?? 0}
          presets={[50, 60, 70, 80, 100]}
          input={setBed}
          onInput={setSetBed}
          onApply={() => aplicar('bed', setBed)}
          onOff={() => { setSetBed('0'); aplicar('bed', '0'); }}
        />
      </div>
    </Section>
  );
}

function TempBlock({ label, current, target, presets, input, onInput, onApply, onOff }: {
  label: string; current: number; target: number; presets: number[];
  input: string; onInput: (v: string) => void; onApply: () => void; onOff: () => void;
}) {
  const heating = target > 0 && Math.abs(current - target) > 2;
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Thermometer className={`w-5 h-5 ${heating ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="font-mono font-semibold">
            {current.toFixed(0)}° <span className="text-gray-400 text-sm">/ {target.toFixed(0)}°</span>
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <Input type="number" value={input} onChange={(e) => onInput(e.target.value)} className="text-sm" placeholder="°C" />
        <Button size="sm" onClick={onApply} className="px-2">OK</Button>
        <Button size="sm" variant="outline" onClick={onOff} className="px-2">Off</Button>
      </div>
      <div className="flex gap-1 flex-wrap">
        {presets.map((p) => (
          <button key={p} onClick={() => onInput(String(p))}
            className="text-[10px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded">
            {p}°
          </button>
        ))}
      </div>
    </div>
  );
}

function MovementCard({ impressora, disabled }: { impressora: PrinterDevice; disabled: boolean }) {
  const [dist, setDist] = useState(10);
  const jog = (axis: 'X' | 'Y' | 'Z', sign: 1 | -1) =>
    enviarComando(impressora.id, 'jog', { axis, distance: dist * sign });

  return (
    <Section title="Movimento">
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <Button size="sm" variant="outline" onClick={() => enviarComando(impressora.id, 'home')} disabled={disabled}>
          <HomeIcon className="w-3.5 h-3.5 mr-1" />All
        </Button>
        <Button size="sm" variant="outline" onClick={() => enviarComando(impressora.id, 'home', { axes: 'x' })} disabled={disabled}>X</Button>
        <Button size="sm" variant="outline" onClick={() => enviarComando(impressora.id, 'home', { axes: 'y' })} disabled={disabled}>Y</Button>
        <Button size="sm" variant="outline" onClick={() => enviarComando(impressora.id, 'home', { axes: 'z' })} disabled={disabled}>Z</Button>
      </div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {JOG_DIST.map((d) => (
          <button key={d} onClick={() => setDist(d)}
            className={`px-2.5 py-1 text-xs rounded border transition ${
              dist === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}>
            {d}mm
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="grid grid-cols-3 gap-1.5">
          <div /><Button size="sm" variant="outline" onClick={() => jog('Y', 1)} disabled={disabled}><ChevronUp className="w-3.5 h-3.5" /></Button><div />
          <Button size="sm" variant="outline" onClick={() => jog('X', -1)} disabled={disabled}><ChevronLeft className="w-3.5 h-3.5" /></Button>
          <div className="text-center text-xs text-gray-400 self-center">XY</div>
          <Button size="sm" variant="outline" onClick={() => jog('X', 1)} disabled={disabled}><ChevronRight className="w-3.5 h-3.5" /></Button>
          <div /><Button size="sm" variant="outline" onClick={() => jog('Y', -1)} disabled={disabled}><ChevronDown className="w-3.5 h-3.5" /></Button><div />
        </div>
        <div className="flex flex-col gap-1.5">
          <Button size="sm" variant="outline" onClick={() => jog('Z', 1)} disabled={disabled}><ChevronUp className="w-3.5 h-3.5" /></Button>
          <div className="text-center text-xs text-gray-400">Z</div>
          <Button size="sm" variant="outline" onClick={() => jog('Z', -1)} disabled={disabled}><ChevronDown className="w-3.5 h-3.5" /></Button>
        </div>
      </div>
    </Section>
  );
}

function LiveSlidersCard({ impressora, velocityPct, extrudePct, fanPct }: {
  impressora: PrinterDevice; velocityPct: number; extrudePct: number; fanPct: number;
}) {
  const [v, setV] = useState(velocityPct);
  const [e, setE] = useState(extrudePct);
  const [f, setF] = useState(fanPct);
  useEffect(() => setV(velocityPct), [velocityPct]);
  useEffect(() => setE(extrudePct), [extrudePct]);
  useEffect(() => setF(fanPct), [fanPct]);

  const debouncedSend = (fn: () => void) => {
    const id = window.setTimeout(fn, 350);
    return () => window.clearTimeout(id);
  };

  return (
    <Section title="Ajustes ao vivo">
      <div className="space-y-3">
        <Slider label="Velocidade" value={v} unit="%" min={20} max={200}
          onChange={(val) => { setV(val); debouncedSend(() => definirVelocityFactor(impressora.id, val).catch(() => {})); }} />
        <Slider label="Extrusão" value={e} unit="%" min={50} max={150}
          onChange={(val) => { setE(val); debouncedSend(() => definirExtrudeFactor(impressora.id, val).catch(() => {})); }} />
        <Slider label="Fan" value={f} unit="%" min={0} max={100}
          onChange={(val) => { setF(val); debouncedSend(() => definirFan(impressora.id, val).catch(() => {})); }} />
      </div>
    </Section>
  );
}

function Slider({ label, value, unit, min, max, onChange }: {
  label: string; value: number; unit: string; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono font-medium">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded accent-blue-600" />
    </div>
  );
}

function BabystepCard({ impressora, disabled, currentZOffset }: { impressora: PrinterDevice; disabled: boolean; currentZOffset?: number }) {
  return (
    <Section title="Z baby step">
      <div className="text-xs text-gray-500 mb-2">
        Z-Offset atual: <span className="font-mono">{currentZOffset?.toFixed(3) ?? '0.000'} mm</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {BABYSTEP.map((d) => (
          <React.Fragment key={d}>
            <Button size="sm" variant="outline" disabled={disabled}
              onClick={() => enviarComando(impressora.id, 'baby_step', { delta: -d })}>
              −{d}
            </Button>
            <Button size="sm" variant="outline" disabled={disabled}
              onClick={() => enviarComando(impressora.id, 'baby_step', { delta: +d })}>
              +{d}
            </Button>
          </React.Fragment>
        ))}
      </div>
    </Section>
  );
}

function FilesCard({ impressora, disabled }: { impressora: PrinterDevice; disabled: boolean }) {
  const [files, setFiles] = useState<GcodeOnPrinter[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      setFiles(await listarGcodesImpressora(impressora.id));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const startPrint = async (filename: string) => {
    if (!window.confirm(`Iniciar print "${filename}"?`)) return;
    setBusy(filename);
    try { await iniciarPrintLocal(impressora.id, filename); } finally { setBusy(null); }
  };
  const del = async (filename: string) => {
    if (!window.confirm(`Deletar "${filename}"?`)) return;
    setBusy(filename);
    try {
      await deletarGcodeImpressora(impressora.id, filename);
      reload();
    } finally { setBusy(null); }
  };

  return (
    <Section
      title={`Arquivos da SD ${files ? `(${files.length})` : ''}`}
      action={
        <Button size="sm" variant="ghost" onClick={reload} disabled={loading || disabled}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      }
    >
      {!files ? (
        <button onClick={reload} disabled={disabled}
          className="w-full py-3 text-sm text-blue-600 hover:underline disabled:text-gray-400">
          Carregar lista de arquivos
        </button>
      ) : files.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-2">Sem arquivos.</div>
      ) : (
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {files.slice(0, 30).map((f) => (
            <div key={f.path} className="flex items-center gap-1 group p-1 hover:bg-gray-50 rounded">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" title={f.path}>{f.path}</div>
                <div className="text-[10px] text-gray-500">{(f.size / 1024 / 1024).toFixed(1)}MB · {new Date(f.modified * 1000).toLocaleDateString('pt-BR')}</div>
              </div>
              <button onClick={() => startPrint(f.path)} disabled={busy === f.path}
                className="opacity-60 group-hover:opacity-100 text-green-600 hover:text-green-800 p-1">
                <Play className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => del(f.path)} disabled={busy === f.path}
                className="opacity-60 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function MacrosCard({ impressora, disabled }: { impressora: PrinterDevice; disabled: boolean }) {
  const [macros, setMacros] = useState<PrinterMacro[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listarMacros(impressora.id).then((d) => { setMacros(d); setLoading(false); }).catch(() => setLoading(false));
  }, [impressora.id]);

  const exec = (m: PrinterMacro) => enviarComando(impressora.id, 'gcode_raw', { gcode: m.gcode });

  return (
    <Section title="Macros">
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <Button size="sm" variant="outline" disabled={disabled}
          onClick={() => enviarComando(impressora.id, 'load_filament')}>
          <PackagePlus className="w-3.5 h-3.5 mr-1" />Carregar
        </Button>
        <Button size="sm" variant="outline" disabled={disabled}
          onClick={() => enviarComando(impressora.id, 'unload_filament')}>
          <PackageMinus className="w-3.5 h-3.5 mr-1" />Descarregar
        </Button>
      </div>
      {loading ? <div className="text-xs text-gray-500">carregando…</div> : macros.length === 0 ? (
        <div className="text-xs text-gray-500 italic">
          Nenhuma macro custom — adicione em Detalhes → Macros.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {macros.slice(0, 8).map((m) => (
            <Button key={m.id} size="sm" variant="outline" className="text-xs truncate"
              disabled={disabled} onClick={() => exec(m)} title={m.descricao || m.nome}>
              {m.nome}
            </Button>
          ))}
        </div>
      )}
    </Section>
  );
}

function ConsoleCard({ impressora }: { impressora: PrinterDevice }) {
  const [gcode, setGcode] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const send = async () => {
    if (!gcode.trim()) return;
    try {
      await enviarComando(impressora.id, 'gcode_raw', { gcode });
      setHistory((h) => [gcode, ...h].slice(0, 10));
      setGcode('');
    } catch { /* ignore */ }
  };

  return (
    <Section title="Console GCODE">
      <div className="flex gap-1 mb-2">
        <Input value={gcode} onChange={(e) => setGcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="G1 X100 F3000" className="font-mono text-xs" />
        <Button size="sm" onClick={send} disabled={!gcode.trim()}>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
      {history.length > 0 && (
        <div className="bg-gray-900 text-gray-100 rounded p-2 text-[10px] font-mono space-y-0.5 max-h-32 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="cursor-pointer hover:bg-gray-800 rounded px-1"
              onClick={() => setGcode(h)}>
              {'> '}{h}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
