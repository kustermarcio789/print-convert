import React, { useEffect, useMemo, useState } from 'react';
import {
  X, History, Wrench, DollarSign, Camera, FileCode, Plus, Trash2, Save, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PrinterDevice, PrintJob, MaintenanceLog, PrinterPricing, PrinterMacro,
  listarPrintJobs, listarManutencoes, criarManutencao, deletarManutencao,
  getPricing, upsertPricing, listarMacros, salvarMacro, deletarMacro,
  lerPrinterCfg, salvarPrinterCfg, ultimoSnapshot, publicSnapshotUrl,
  enviarComando, formatDuration,
} from '@/lib/printerControl';

type TabId = 'history' | 'maintenance' | 'pricing' | 'webcam' | 'macros' | 'config';

interface Props {
  impressora: PrinterDevice;
  onClose: () => void;
}

export default function PrinterDetailModal({ impressora, onClose }: Props) {
  const [tab, setTab] = useState<TabId>('history');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div>
            <div className="font-semibold">{impressora.nome}</div>
            <div className="text-xs text-gray-500">
              Detalhes & análise · {impressora.firmware_tipo}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b text-sm overflow-x-auto">
          {[
            { id: 'history', label: 'Histórico', icon: <History className="w-4 h-4" /> },
            { id: 'maintenance', label: 'Manutenção', icon: <Wrench className="w-4 h-4" /> },
            { id: 'pricing', label: 'Precificação', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'webcam', label: 'Webcam', icon: <Camera className="w-4 h-4" /> },
            { id: 'macros', label: 'Macros', icon: <Plus className="w-4 h-4" /> },
            { id: 'config', label: 'printer.cfg', icon: <FileCode className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as TabId)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
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

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'history' && <HistoryTab impressora={impressora} />}
          {tab === 'maintenance' && <MaintenanceTab impressora={impressora} />}
          {tab === 'pricing' && <PricingTab impressora={impressora} />}
          {tab === 'webcam' && <WebcamTab impressora={impressora} />}
          {tab === 'macros' && <MacrosTab impressora={impressora} />}
          {tab === 'config' && <ConfigTab impressora={impressora} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Histórico de jobs
// ============================================================
function HistoryTab({ impressora }: { impressora: PrinterDevice }) {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarPrintJobs(impressora.id, 50).then((d) => {
      setJobs(d);
      setLoading(false);
    });
  }, [impressora.id]);

  if (loading) return <Loading />;

  const totalHoras = jobs.reduce((s, j) => s + (j.duration_seconds || 0), 0) / 3600;
  const ok = jobs.filter((j) => j.status === 'completed').length;
  const fail = jobs.filter((j) => j.status === 'failed' || j.status === 'cancelled').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total de jobs" value={jobs.length.toString()} />
        <Stat label="Concluídos / Falha" value={`${ok} / ${fail}`} />
        <Stat label="Horas impressas" value={`${totalHoras.toFixed(1)}h`} />
      </div>

      {jobs.length === 0 ? (
        <Empty>Nenhum job registrado ainda.</Empty>
      ) : (
        <div className="border rounded-lg divide-y">
          {jobs.map((j) => (
            <div key={j.id} className="px-4 py-3 flex items-center gap-3">
              <StatusBadge status={j.status} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{j.gcode_filename || '(sem arquivo)'}</div>
                <div className="text-xs text-gray-500">
                  {new Date(j.started_at).toLocaleString('pt-BR')} · {formatDuration(j.duration_seconds)}
                  {j.failure_reason && <span className="text-red-600 ml-2">· {j.failure_reason}</span>}
                </div>
              </div>
              {j.filament_used_g && (
                <span className="text-xs text-gray-500">{j.filament_used_g.toFixed(0)}g</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PrintJob['status'] }) {
  const map: Record<PrintJob['status'], string> = {
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-yellow-100 text-yellow-700',
    running: 'bg-blue-100 text-blue-700',
  };
  const label: Record<PrintJob['status'], string> = {
    completed: 'OK',
    failed: 'Falha',
    cancelled: 'Cancel.',
    running: 'Rodando',
  };
  return <span className={`text-xs px-2 py-0.5 rounded ${map[status]}`}>{label[status]}</span>;
}

// ============================================================
// Manutenção
// ============================================================
function MaintenanceTab({ impressora }: { impressora: PrinterDevice }) {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<MaintenanceLog>>({
    tipo: 'preventiva', descricao: '', custo: 0, horas_paradas: 0,
  });
  const [saving, setSaving] = useState(false);

  const reload = () => listarManutencoes(impressora.id).then((d) => { setLogs(d); setLoading(false); });
  useEffect(() => { reload(); }, [impressora.id]);

  const totalCusto = logs.reduce((s, l) => s + (l.custo || 0), 0);
  const totalHorasParadas = logs.reduce((s, l) => s + (l.horas_paradas || 0), 0);

  const submit = async () => {
    if (!form.descricao) return;
    setSaving(true);
    try {
      await criarManutencao({ ...form, printer_id: impressora.id });
      setForm({ tipo: 'preventiva', descricao: '', custo: 0, horas_paradas: 0 });
      await reload();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Manutenções" value={logs.length.toString()} />
        <Stat label="Custo total" value={`R$ ${totalCusto.toFixed(2)}`} />
        <Stat label="Horas paradas" value={`${totalHorasParadas.toFixed(1)}h`} />
      </div>

      <div className="border rounded-lg p-4 space-y-2">
        <div className="font-medium text-sm">Nova manutenção</div>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="border rounded p-2 text-sm"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as MaintenanceLog['tipo'] })}
          >
            <option value="preventiva">Preventiva</option>
            <option value="corretiva">Corretiva</option>
            <option value="upgrade">Upgrade</option>
            <option value="calibracao">Calibração</option>
          </select>
          <Input
            type="number"
            placeholder="Custo (R$)"
            value={form.custo ?? 0}
            onChange={(e) => setForm({ ...form, custo: parseFloat(e.target.value) || 0 })}
          />
          <Input
            type="number"
            placeholder="Horas paradas"
            value={form.horas_paradas ?? 0}
            onChange={(e) => setForm({ ...form, horas_paradas: parseFloat(e.target.value) || 0 })}
          />
          <Input
            placeholder="Técnico"
            value={form.tecnico ?? ''}
            onChange={(e) => setForm({ ...form, tecnico: e.target.value })}
          />
        </div>
        <Input
          placeholder="Descrição"
          value={form.descricao ?? ''}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />
        <Input
          placeholder="Componentes trocados (opcional)"
          value={form.componentes ?? ''}
          onChange={(e) => setForm({ ...form, componentes: e.target.value })}
        />
        <Button onClick={submit} disabled={saving || !form.descricao}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
          Adicionar
        </Button>
      </div>

      {logs.length === 0 ? (
        <Empty>Nenhuma manutenção registrada.</Empty>
      ) : (
        <div className="border rounded-lg divide-y">
          {logs.map((l) => (
            <div key={l.id} className="px-4 py-3 flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{l.tipo}</span>
                  <span className="font-medium text-sm">{l.descricao}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(l.data).toLocaleDateString('pt-BR')}
                  {l.tecnico && ` · ${l.tecnico}`}
                  {l.componentes && ` · ${l.componentes}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">R$ {l.custo.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{l.horas_paradas}h paradas</div>
              </div>
              <button
                onClick={() => deletarManutencao(l.id).then(reload)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Precificação
// ============================================================
function PricingTab({ impressora }: { impressora: PrinterDevice }) {
  const [pricing, setPricing] = useState<PrinterPricing>({
    printer_id: impressora.id,
    custo_hora: 0, custo_filamento_kg: 0, custo_setup: 0,
    margem_percentual: 30, tempo_minimo_horas: 0.5,
    observacoes: null, updated_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Calculadora de simulação
  const [simTempo, setSimTempo] = useState(2);
  const [simFilamento, setSimFilamento] = useState(50);
  const [simQtd, setSimQtd] = useState(1);

  useEffect(() => {
    getPricing(impressora.id).then((p) => {
      if (p) setPricing(p);
      setLoading(false);
    });
  }, [impressora.id]);

  const sim = useMemo(() => {
    const tempo = Math.max(simTempo, pricing.tempo_minimo_horas || 0);
    const co = tempo * pricing.custo_hora;
    const cf = (simFilamento / 1000) * pricing.custo_filamento_kg;
    const cs = pricing.custo_setup;
    const ct = co + cf + cs;
    const mv = ct * (pricing.margem_percentual / 100);
    const pu = ct + mv;
    return { co, cf, cs, ct, mv, pu, total: pu * Math.max(1, simQtd) };
  }, [pricing, simTempo, simFilamento, simQtd]);

  const save = async () => {
    setSaving(true);
    try {
      await upsertPricing(pricing);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-medium text-sm mb-2">Custos da máquina</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Custo por hora (R$)"
            help="Energia + depreciação + mão de obra"
            value={pricing.custo_hora}
            onChange={(v) => setPricing({ ...pricing, custo_hora: v })}
          />
          <NumberField
            label="Custo do filamento (R$/kg)"
            value={pricing.custo_filamento_kg}
            onChange={(v) => setPricing({ ...pricing, custo_filamento_kg: v })}
          />
          <NumberField
            label="Setup fixo por job (R$)"
            help="Limpeza, preparação, atendimento"
            value={pricing.custo_setup}
            onChange={(v) => setPricing({ ...pricing, custo_setup: v })}
          />
          <NumberField
            label="Margem (%)"
            value={pricing.margem_percentual}
            onChange={(v) => setPricing({ ...pricing, margem_percentual: v })}
          />
          <NumberField
            label="Tempo mínimo cobrado (h)"
            value={pricing.tempo_minimo_horas}
            onChange={(v) => setPricing({ ...pricing, tempo_minimo_horas: v })}
          />
        </div>
        <Button onClick={save} disabled={saving} className="mt-3">
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Salvar
        </Button>
        {savedMsg && <span className="text-xs text-green-700 ml-2">✓ Salvo</span>}
      </div>

      <div>
        <h3 className="font-medium text-sm mb-2">Calculadora rápida</h3>
        <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Tempo (h)" value={simTempo} onChange={setSimTempo} />
            <NumberField label="Filamento (g)" value={simFilamento} onChange={setSimFilamento} />
            <NumberField label="Quantidade" value={simQtd} onChange={setSimQtd} />
          </div>
          <div className="bg-white rounded p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Operação ({Math.max(simTempo, pricing.tempo_minimo_horas).toFixed(2)}h):</span><span>R$ {sim.co.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Filamento ({simFilamento}g):</span><span>R$ {sim.cf.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Setup:</span><span>R$ {sim.cs.toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-1"><span>Custo total:</span><span className="font-medium">R$ {sim.ct.toFixed(2)}</span></div>
            <div className="flex justify-between text-blue-600"><span>Margem ({pricing.margem_percentual}%):</span><span>R$ {sim.mv.toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-1 text-base font-semibold text-green-700">
              <span>Preço unitário:</span><span>R$ {sim.pu.toFixed(2)}</span>
            </div>
            {simQtd > 1 && (
              <div className="flex justify-between text-base font-semibold">
                <span>Total ({simQtd}x):</span><span>R$ {sim.total.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Webcam (snapshots)
// ============================================================
function WebcamTab({ impressora }: { impressora: PrinterDevice }) {
  const [snap, setSnap] = useState<{ url: string; takenAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const reload = async () => {
    const s = await ultimoSnapshot(impressora.id);
    if (s) setSnap({ url: publicSnapshotUrl(s.storage_path), takenAt: s.taken_at });
    setLoading(false);
  };

  useEffect(() => {
    reload();
    const t = setInterval(reload, 10000);
    return () => clearInterval(t);
  }, [impressora.id]);

  const captureNow = async () => {
    setRequesting(true);
    try {
      await enviarComando(impressora.id, 'capture_snapshot');
      // dá tempo do agente capturar e subir
      setTimeout(reload, 4000);
    } finally {
      setTimeout(() => setRequesting(false), 4000);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      {snap ? (
        <>
          <img
            src={snap.url}
            alt="Webcam"
            className="w-full rounded-lg border"
          />
          <div className="text-xs text-gray-500">
            Última captura: {new Date(snap.takenAt).toLocaleString('pt-BR')}
          </div>
        </>
      ) : (
        <Empty>
          Sem snapshots ainda. Configure <code>webcam_url</code> no <code>config.json</code> do agente
          (geralmente <code>http://IP_DA_IMPRESSORA:8080/?action=snapshot</code>) ou clique em "Capturar agora".
        </Empty>
      )}
      <Button onClick={captureNow} disabled={requesting}>
        {requesting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Camera className="w-4 h-4 mr-1" />}
        Capturar agora
      </Button>
    </div>
  );
}

// ============================================================
// Macros (CRUD)
// ============================================================
function MacrosTab({ impressora }: { impressora: PrinterDevice }) {
  const [macros, setMacros] = useState<PrinterMacro[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Partial<PrinterMacro> | null>(null);

  const reload = () => listarMacros(impressora.id).then((d) => { setMacros(d); setLoading(false); });
  useEffect(() => { reload(); }, [impressora.id]);

  const exec = async (m: PrinterMacro) => {
    await enviarComando(impressora.id, 'gcode_raw', { gcode: m.gcode });
  };

  const save = async () => {
    if (!edit?.nome || !edit?.gcode) return;
    await salvarMacro({ ...edit, printer_id: impressora.id });
    setEdit(null);
    reload();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      <Button onClick={() => setEdit({ nome: '', gcode: '', ordem: macros.length })}>
        <Plus className="w-4 h-4 mr-1" /> Nova macro
      </Button>

      {macros.length === 0 ? (
        <Empty>Nenhuma macro customizada cadastrada.</Empty>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {macros.map((m) => (
            <div key={m.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{m.nome}</div>
                  {m.descricao && <div className="text-xs text-gray-500 truncate">{m.descricao}</div>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEdit(m)} className="text-gray-500 hover:text-gray-900 text-xs px-2">edit</button>
                  <button onClick={() => deletarMacro(m.id).then(reload)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={() => exec(m)}>Executar</Button>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-3">
            <div className="font-semibold">{edit.id ? 'Editar macro' : 'Nova macro'}</div>
            <Input placeholder="Nome (ex: PURGE_LINE)" value={edit.nome ?? ''} onChange={(e) => setEdit({ ...edit, nome: e.target.value.toUpperCase() })} />
            <Input placeholder="Descrição (opcional)" value={edit.descricao ?? ''} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} />
            <textarea
              className="border rounded w-full font-mono text-xs p-2 h-40"
              placeholder="GCODE (uma linha por comando)..."
              value={edit.gcode ?? ''}
              onChange={(e) => setEdit({ ...edit, gcode: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEdit(null)}>Cancelar</Button>
              <Button onClick={save} disabled={!edit.nome || !edit.gcode}>Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// printer.cfg editor
// ============================================================
function ConfigTab({ impressora }: { impressora: PrinterDevice }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const [restartAfterSave, setRestartAfterSave] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await lerPrinterCfg(impressora.id);
      setContent(c);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setLoading(true);
    setError(null);
    try {
      await salvarPrinterCfg(impressora.id, content, restartAfterSave);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileCode className="w-4 h-4 mr-1" />}
          {content ? 'Recarregar do agente' : 'Carregar printer.cfg'}
        </Button>
        {content && (
          <>
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={restartAfterSave} onChange={(e) => setRestartAfterSave(e.target.checked)} />
              FIRMWARE_RESTART após salvar
            </label>
            <Button onClick={save} disabled={loading} variant="default">
              <Save className="w-4 h-4 mr-1" />
              Salvar no agente
            </Button>
          </>
        )}
        {savedMsg && <span className="text-xs text-green-700">✓ Salvo</span>}
      </div>

      {error && <div className="text-xs text-red-700 bg-red-50 rounded p-2">{error}</div>}

      <textarea
        className="border rounded w-full font-mono text-xs p-3 h-[60vh]"
        placeholder="Clique em 'Carregar printer.cfg' pra puxar o arquivo do agente..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="text-xs text-gray-500">
        ⚠️ Ao salvar, o agente sobe o arquivo via Moonraker e reinicia o firmware se a opção
        estiver marcada. Use com cautela — sintaxe errada pode travar o Klipper.
      </div>
    </div>
  );
}

// ============================================================
// Helpers locais
// ============================================================
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function NumberField({ label, value, onChange, help }: { label: string; value: number; onChange: (v: number) => void; help?: string }) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
      {help && <div className="text-[10px] text-gray-400 mt-0.5">{help}</div>}
    </div>
  );
}

function Loading() {
  return <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" />Carregando...</div>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-center py-8 text-sm text-gray-500 border border-dashed rounded-lg">{children}</div>;
}
