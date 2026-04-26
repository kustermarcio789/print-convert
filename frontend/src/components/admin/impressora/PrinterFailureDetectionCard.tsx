import React, { useEffect, useState } from 'react';
import { Brain, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PrinterDevice, PrinterAISettings, FailureType, FAILURE_LABELS,
  getAISettings, upsertAISettings,
} from '@/lib/printerControl';

const ALL_TYPES: FailureType[] = [
  'spaghetti_failure', 'bed_detachment', 'layer_shift', 'extrusion_failure', 'unknown_failure',
];

export default function PrinterFailureDetectionCard({ impressora }: { impressora: PrinterDevice }) {
  const [s, setS] = useState<Partial<PrinterAISettings>>({
    printer_id: impressora.id,
    ai_enabled: false,
    pause_on_failure: true,
    confidence_threshold: 0.75,
    snapshot_interval_seconds: 60,
    provider: 'stub',
    enabled_types: ALL_TYPES,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    getAISettings(impressora.id).then((data) => {
      if (data) setS(data);
      setLoading(false);
    });
  }, [impressora.id]);

  const save = async () => {
    setSaving(true);
    try {
      await upsertAISettings({ ...s, printer_id: impressora.id } as any);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const toggleType = (t: FailureType) => {
    const cur = s.enabled_types || ALL_TYPES;
    const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t];
    setS({ ...s, enabled_types: next });
  };

  if (loading) {
    return <div className="text-sm text-gray-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>carregando…</div>;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">AI Failure Detection</h3>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
          s.ai_enabled ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
          'bg-gray-800 text-gray-500 border border-gray-700'
        }`}>
          {s.ai_enabled ? '● Ativa' : '○ Desligada'}
        </span>
      </div>

      {/* Switch principal */}
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <div>
          <div className="text-sm text-gray-200">Ativar IA pra esta impressora</div>
          <div className="text-xs text-gray-500">Análise automática da webcam durante prints</div>
        </div>
        <input
          type="checkbox"
          checked={!!s.ai_enabled}
          onChange={(e) => setS({ ...s, ai_enabled: e.target.checked })}
          className="w-10 h-6 accent-blue-500"
        />
      </label>

      {/* Switch pause */}
      <label className="flex items-center justify-between gap-3 cursor-pointer pt-3 border-t border-gray-800">
        <div>
          <div className="text-sm text-gray-200">Pausar print automaticamente</div>
          <div className="text-xs text-gray-500">Quando confiança ≥ threshold</div>
        </div>
        <input
          type="checkbox"
          checked={!!s.pause_on_failure}
          onChange={(e) => setS({ ...s, pause_on_failure: e.target.checked })}
          className="w-10 h-6 accent-orange-500"
        />
      </label>

      {/* Threshold + intervalo */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Threshold confiança: <span className="text-blue-400 font-mono">{((s.confidence_threshold ?? 0.75) * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range" min={0.3} max={1} step={0.05}
            value={s.confidence_threshold ?? 0.75}
            onChange={(e) => setS({ ...s, confidence_threshold: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Intervalo análise (s)</label>
          <Input
            type="number" min={10} max={600}
            value={s.snapshot_interval_seconds ?? 60}
            onChange={(e) => setS({ ...s, snapshot_interval_seconds: parseInt(e.target.value) || 60 })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      {/* Provider */}
      <div className="pt-3 border-t border-gray-800">
        <label className="text-xs text-gray-400 block mb-1">Provider de IA</label>
        <select
          value={s.provider}
          onChange={(e) => setS({ ...s, provider: e.target.value as any })}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded p-2 text-sm"
        >
          <option value="stub">stub (modo simulação — sem custo, nunca detecta)</option>
          <option value="anthropic">anthropic (Claude vision — precisa ANTHROPIC_API_KEY no Supabase)</option>
          <option value="openai">openai (GPT-4o-mini vision — precisa OPENAI_API_KEY no Supabase)</option>
        </select>
      </div>

      {/* Tipos */}
      <div className="pt-3 border-t border-gray-800">
        <div className="text-xs text-gray-400 mb-2">Tipos de falha pra detectar</div>
        <div className="grid grid-cols-1 gap-1">
          {ALL_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={(s.enabled_types || ALL_TYPES).includes(t)}
                onChange={() => toggleType(t)}
                className="accent-blue-500"
              />
              {FAILURE_LABELS[t]}
            </label>
          ))}
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
        {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : <Save className="w-4 h-4 mr-1"/>}
        Salvar configurações
      </Button>
      {savedMsg && <div className="text-xs text-green-400 text-center">✓ Salvo. O agente sincroniza em até 60s.</div>}
    </div>
  );
}
