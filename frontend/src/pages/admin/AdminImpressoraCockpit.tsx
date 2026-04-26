import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pause, Play, Square, AlertOctagon, Upload, Maximize2,
  Thermometer, Activity, Cpu, BarChart3, Loader2, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Home as HomeIcon, Send, Brain, Settings as SettingsIcon,
  Zap, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PrinterDevice, PrinterTelemetry,
  enviarComando, formatDuration, getTelemetry, stateColor, stateLabel,
  listarImpressorasConectadas,
  definirVelocityFactor, definirExtrudeFactor, definirFan,
} from '@/lib/printerControl';
import PrinterAICameraOverlay from '@/components/admin/impressora/PrinterAICameraOverlay';
import PrinterFailureDetectionCard from '@/components/admin/impressora/PrinterFailureDetectionCard';
import PrinterFailureTimeline from '@/components/admin/impressora/PrinterFailureTimeline';
import PrinterAnalyticsDashboard from '@/components/admin/impressora/PrinterAnalyticsDashboard';
import PrinterDetailModal from '@/components/admin/impressora/PrinterDetailModal';
import UploadGcodeDialog from '@/components/admin/impressora/UploadGcodeDialog';

type ViewTab = 'cockpit' | 'analytics' | 'failures';

const JOG = [0.1, 1, 10, 100];

export default function AdminImpressoraCockpit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [impressora, setImpressora] = useState<PrinterDevice | null>(null);
  const [telemetry, setTelemetry] = useState<PrinterTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ViewTab>('cockpit');
  const [detailOpen, setDetailOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    listarImpressorasConectadas().then((list) => {
      setImpressora(list.find((p) => p.id === id) ?? null);
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400"/>
      </div>
    );
  }
  if (!impressora) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
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

  const raw = (telemetry as any)?.raw || {};

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* TOP BAR sticky */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-gray-900 to-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/impressoras')} className="text-gray-300 hover:text-white hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-1"/>Voltar
          </Button>

          <div className={`w-3 h-3 rounded-full ${stateColor(state)} ${isOnline ? 'animate-pulse' : ''}`} />
          <div>
            <div className="font-semibold leading-tight text-white">{impressora.nome}</div>
            <div className="text-xs text-gray-400">
              <span className="text-blue-400">{stateLabel(state)}</span>
              {updatedAgo !== null && ` · ${updatedAgo}s atrás`}
              {' · '}
              <span className="font-mono">{impressora.firmware_tipo}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-800/60 rounded-lg p-1 ml-6">
            {([
              { id: 'cockpit', label: 'Cockpit', icon: <Maximize2 className="w-3.5 h-3.5"/> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5"/> },
              { id: 'failures', label: 'Falhas', icon: <Brain className="w-3.5 h-3.5"/> },
            ] as const).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                  tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {(isPrinting || isPaused) && (
            <>
              {isPrinting && (
                <Button size="sm" variant="outline" className="bg-gray-800 border-gray-700 text-yellow-300 hover:bg-gray-700"
                  onClick={() => enviarComando(impressora.id, 'pause')}>
                  <Pause className="w-4 h-4 mr-1"/>Pausar
                </Button>
              )}
              {isPaused && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => enviarComando(impressora.id, 'resume')}>
                  <Play className="w-4 h-4 mr-1"/>Retomar
                </Button>
              )}
              <Button size="sm" variant="outline" className="bg-gray-800 border-gray-700 text-orange-300 hover:bg-gray-700"
                onClick={() => window.confirm('Cancelar print?') && enviarComando(impressora.id, 'cancel')}>
                <Square className="w-4 h-4 mr-1"/>Cancelar
              </Button>
            </>
          )}

          {!isPrinting && !isPaused && isOnline && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setUploadOpen(true)}>
              <Upload className="w-4 h-4 mr-1"/>Imprimir
            </Button>
          )}

          <Button size="sm" variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            onClick={() => setDetailOpen(true)}>
            <SettingsIcon className="w-4 h-4 mr-1"/>Detalhes
          </Button>
          <Button size="sm" variant="destructive"
            onClick={() => window.confirm('EMERGENCY STOP — confirmar?') && enviarComando(impressora.id, 'emergency_stop')}>
            <AlertOctagon className="w-4 h-4 mr-1"/>E-Stop
          </Button>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-screen-2xl mx-auto p-4">
        {tab === 'cockpit' && (
          <CockpitView impressora={impressora} telemetry={telemetry} raw={raw} isPrinting={isPrinting} isPaused={isPaused} isOnline={isOnline} />
        )}
        {tab === 'analytics' && <PrinterAnalyticsDashboard impressora={impressora} />}
        {tab === 'failures' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PrinterFailureDetectionCard impressora={impressora} />
            <PrinterFailureTimeline impressora={impressora} />
          </div>
        )}
      </div>

      {detailOpen && <PrinterDetailModal impressora={impressora} onClose={() => setDetailOpen(false)} />}
      {uploadOpen && <UploadGcodeDialog impressora={impressora} onClose={() => setUploadOpen(false)} />}
    </div>
  );
}

// ============================================================
// Cockpit View — layout principal premium dark
// ============================================================
function CockpitView({ impressora, telemetry, raw, isPrinting, isPaused, isOnline }: {
  impressora: PrinterDevice; telemetry: PrinterTelemetry | null; raw: any;
  isPrinting: boolean; isPaused: boolean; isOnline: boolean;
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* CÂMERA + AI — col 7 */}
      <div className="col-span-12 xl:col-span-7 space-y-4">
        <PrinterAICameraOverlay impressora={impressora} />

        {/* MEGA CARDS — Bico, Mesa, Velocidade, Extrusão, Fan, Klipper status */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <MegaCard
            icon={<Thermometer className="w-5 h-5"/>}
            label="Bico"
            value={`${(telemetry?.extruder_temp ?? 0).toFixed(0)}°`}
            target={`/ ${(telemetry?.extruder_target ?? 0).toFixed(0)}°`}
            color="orange"
          />
          <MegaCard
            icon={<Layers className="w-5 h-5"/>}
            label="Mesa"
            value={`${(telemetry?.bed_temp ?? 0).toFixed(0)}°`}
            target={`/ ${(telemetry?.bed_target ?? 0).toFixed(0)}°`}
            color="red"
          />
          <MegaCard
            icon={<Zap className="w-5 h-5"/>}
            label="Velocidade"
            value={`${raw.velocity_factor_pct ?? 100}%`}
            color="blue"
          />
          <MegaCard
            icon={<Activity className="w-5 h-5"/>}
            label="Extrusão"
            value={`${raw.extrude_factor_pct ?? 100}%`}
            color="purple"
          />
          <MegaCard
            icon={<Activity className="w-5 h-5"/>}
            label="Fan"
            value={`${raw.fan_pct ?? 0}%`}
            color="cyan"
          />
          <MegaCard
            icon={<Cpu className="w-5 h-5"/>}
            label="Klipper"
            value={isOnline ? '● online' : '○ offline'}
            color={isOnline ? 'green' : 'gray'}
          />
        </div>

        {/* Progresso atual (se imprimindo) */}
        {(isPrinting || isPaused) && (
          <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 border border-blue-500/30 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-white text-sm truncate" title={telemetry?.current_file || ''}>
                📄 {telemetry?.current_file ?? '(sem arquivo)'}
              </div>
              <span className="text-xs text-blue-300 font-mono">
                {(telemetry?.progress ?? 0).toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${isPaused ? 'bg-yellow-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`}
                style={{ width: `${Math.max(0, Math.min(100, telemetry?.progress ?? 0))}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{formatDuration(telemetry?.print_duration_seconds)} decorrido</span>
              <span>~{formatDuration(telemetry?.print_time_remaining_seconds)} restantes</span>
            </div>
          </div>
        )}

        {/* Live sliders */}
        {(isPrinting || isPaused) && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3">Ajustes ao vivo</h4>
            <LiveSlidersDark
              impressora={impressora}
              v={raw.velocity_factor_pct ?? 100}
              e={raw.extrude_factor_pct ?? 100}
              f={raw.fan_pct ?? 0}
            />
          </div>
        )}
      </div>

      {/* LATERAL DIREITA — col 5 */}
      <div className="col-span-12 xl:col-span-5 space-y-4">
        <CommandsCard impressora={impressora} disabled={!isOnline} />
        <TempControlsCard impressora={impressora} telemetry={telemetry} />
        <ConsoleDarkCard impressora={impressora} />
      </div>
    </div>
  );
}

function MegaCard({ icon, label, value, target, color }: { icon: React.ReactNode; label: string; value: string; target?: string; color: 'orange'|'red'|'blue'|'purple'|'cyan'|'green'|'gray' }) {
  const map: Record<string, string> = {
    orange: 'border-orange-500/30 from-orange-500/10 text-orange-300',
    red: 'border-red-500/30 from-red-500/10 text-red-300',
    blue: 'border-blue-500/30 from-blue-500/10 text-blue-300',
    purple: 'border-purple-500/30 from-purple-500/10 text-purple-300',
    cyan: 'border-cyan-500/30 from-cyan-500/10 text-cyan-300',
    green: 'border-emerald-500/30 from-emerald-500/10 text-emerald-300',
    gray: 'border-gray-700 from-gray-800/40 text-gray-400',
  };
  return (
    <div className={`bg-gradient-to-br to-gray-900 border rounded-2xl p-3 ${map[color]}`}>
      <div className="flex items-center gap-1.5 text-xs opacity-80 mb-1">{icon}{label}</div>
      <div className="text-2xl font-bold font-mono">{value} <span className="text-sm opacity-60">{target}</span></div>
    </div>
  );
}

function LiveSlidersDark({ impressora, v, e, f }: { impressora: PrinterDevice; v: number; e: number; f: number }) {
  const [sV, setSV] = useState(v);
  const [sE, setSE] = useState(e);
  const [sF, setSF] = useState(f);
  useEffect(() => setSV(v), [v]);
  useEffect(() => setSE(e), [e]);
  useEffect(() => setSF(f), [f]);
  const debounced = (fn: () => void) => { const id = window.setTimeout(fn, 350); return () => window.clearTimeout(id); };

  return (
    <div className="space-y-3">
      <SliderDark label="Velocidade" value={sV} unit="%" min={20} max={200}
        onChange={(val) => { setSV(val); debounced(() => definirVelocityFactor(impressora.id, val).catch(() => {})); }} />
      <SliderDark label="Extrusão" value={sE} unit="%" min={50} max={150}
        onChange={(val) => { setSE(val); debounced(() => definirExtrudeFactor(impressora.id, val).catch(() => {})); }} />
      <SliderDark label="Fan" value={sF} unit="%" min={0} max={100}
        onChange={(val) => { setSF(val); debounced(() => definirFan(impressora.id, val).catch(() => {})); }} />
    </div>
  );
}

function SliderDark({ label, value, unit, min, max, onChange }: { label: string; value: number; unit: string; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 text-gray-400">
        <span>{label}</span>
        <span className="font-mono text-blue-400">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={(ev) => onChange(parseInt(ev.target.value))}
        className="w-full h-1.5 bg-gray-800 rounded accent-blue-500" />
    </div>
  );
}

function CommandsCard({ impressora, disabled }: { impressora: PrinterDevice; disabled: boolean }) {
  const [dist, setDist] = useState(10);
  const jog = (axis: 'X'|'Y'|'Z', sign: 1|-1) => enviarComando(impressora.id, 'jog', { axis, distance: dist * sign });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-white mb-3">Comandos rápidos</h4>

      {/* Home */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <DarkBtn onClick={() => enviarComando(impressora.id, 'home')} disabled={disabled} icon={<HomeIcon className="w-3.5 h-3.5"/>}>All</DarkBtn>
        <DarkBtn onClick={() => enviarComando(impressora.id, 'home', { axes: 'x' })} disabled={disabled}>X</DarkBtn>
        <DarkBtn onClick={() => enviarComando(impressora.id, 'home', { axes: 'y' })} disabled={disabled}>Y</DarkBtn>
        <DarkBtn onClick={() => enviarComando(impressora.id, 'home', { axes: 'z' })} disabled={disabled}>Z</DarkBtn>
      </div>

      {/* Jog dist */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {JOG.map((d) => (
          <button key={d} onClick={() => setDist(d)}
            className={`px-2.5 py-1 text-xs rounded border transition ${
              dist === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}>
            {d}mm
          </button>
        ))}
      </div>

      {/* XY pad + Z */}
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="grid grid-cols-3 gap-1.5">
          <div /><DarkBtn onClick={() => jog('Y', 1)} disabled={disabled}><ChevronUp className="w-3.5 h-3.5"/></DarkBtn><div />
          <DarkBtn onClick={() => jog('X', -1)} disabled={disabled}><ChevronLeft className="w-3.5 h-3.5"/></DarkBtn>
          <div className="text-center text-xs text-gray-500 self-center">XY</div>
          <DarkBtn onClick={() => jog('X', 1)} disabled={disabled}><ChevronRight className="w-3.5 h-3.5"/></DarkBtn>
          <div /><DarkBtn onClick={() => jog('Y', -1)} disabled={disabled}><ChevronDown className="w-3.5 h-3.5"/></DarkBtn><div />
        </div>
        <div className="flex flex-col gap-1.5">
          <DarkBtn onClick={() => jog('Z', 1)} disabled={disabled}><ChevronUp className="w-3.5 h-3.5"/></DarkBtn>
          <div className="text-center text-xs text-gray-500">Z</div>
          <DarkBtn onClick={() => jog('Z', -1)} disabled={disabled}><ChevronDown className="w-3.5 h-3.5"/></DarkBtn>
        </div>
      </div>

      {/* Macros rápidas */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-800">
        <DarkBtn onClick={() => enviarComando(impressora.id, 'load_filament')} disabled={disabled}>
          Carregar filamento
        </DarkBtn>
        <DarkBtn onClick={() => enviarComando(impressora.id, 'unload_filament')} disabled={disabled}>
          Descarregar
        </DarkBtn>
      </div>
    </div>
  );
}

function DarkBtn({ children, onClick, disabled, icon }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 border border-gray-700 text-gray-200 text-xs font-medium px-2 py-1.5 rounded flex items-center justify-center gap-1 transition">
      {icon}{children}
    </button>
  );
}

function TempControlsCard({ impressora, telemetry }: { impressora: PrinterDevice; telemetry: PrinterTelemetry | null }) {
  const [ext, setExt] = useState('');
  const [bed, setBed] = useState('');
  const aplicar = (target: 'extruder'|'bed', val: string) => {
    const v = parseFloat(val);
    if (Number.isNaN(v)) return;
    enviarComando(impressora.id, target === 'extruder' ? 'set_temp_extruder' : 'set_temp_bed', { temperature: v });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-white mb-3">Aquecimento</h4>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Bico', cur: telemetry?.extruder_temp ?? 0, tgt: telemetry?.extruder_target ?? 0,
            input: ext, setInput: setExt, target: 'extruder' as const,
            presets: [200, 215, 220, 240, 260] },
          { label: 'Mesa', cur: telemetry?.bed_temp ?? 0, tgt: telemetry?.bed_target ?? 0,
            input: bed, setInput: setBed, target: 'bed' as const,
            presets: [50, 60, 70, 80, 100] },
        ].map((b) => (
          <div key={b.label} className="bg-gray-950 border border-gray-800 rounded-xl p-3">
            <div className="text-xs text-gray-400">{b.label}</div>
            <div className="font-mono text-lg text-white">
              {b.cur.toFixed(0)}° <span className="text-gray-500 text-sm">/ {b.tgt.toFixed(0)}°</span>
            </div>
            <div className="flex gap-1 mt-2">
              <Input type="number" value={b.input} onChange={(e) => b.setInput(e.target.value)}
                placeholder="°C" className="bg-gray-800 border-gray-700 text-white text-xs h-8" />
              <button onClick={() => aplicar(b.target, b.input)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 rounded">OK</button>
              <button onClick={() => { b.setInput('0'); aplicar(b.target, '0'); }}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-2 rounded border border-gray-700">Off</button>
            </div>
            <div className="flex gap-1 flex-wrap mt-2">
              {b.presets.map((p) => (
                <button key={p} onClick={() => b.setInput(String(p))}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300">
                  {p}°
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsoleDarkCard({ impressora }: { impressora: PrinterDevice }) {
  const [gcode, setGcode] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const send = async () => {
    if (!gcode.trim()) return;
    try {
      await enviarComando(impressora.id, 'gcode_raw', { gcode });
      setHistory((h) => [gcode, ...h].slice(0, 15));
      setGcode('');
    } catch { /* noop */ }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-white mb-3">Console GCODE</h4>
      <div className="flex gap-1 mb-2">
        <Input value={gcode} onChange={(e) => setGcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="G1 X100 F3000"
          className="bg-gray-950 border-gray-700 text-blue-300 font-mono text-xs" />
        <button onClick={send} disabled={!gcode.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white px-3 rounded">
          <Send className="w-3.5 h-3.5"/>
        </button>
      </div>
      {history.length > 0 && (
        <div className="bg-gray-950 border border-gray-800 rounded p-2 text-[11px] font-mono space-y-0.5 max-h-32 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="cursor-pointer hover:bg-gray-800 rounded px-1 text-emerald-300"
              onClick={() => setGcode(h)}>
              {'> '}{h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
