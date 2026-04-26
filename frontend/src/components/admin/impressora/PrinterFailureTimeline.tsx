import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, X, ImageIcon, Clock, Loader2 } from 'lucide-react';
import {
  PrinterDevice, PrinterFailureEvent, listarFailureEvents, atualizarFailureStatus,
  FAILURE_LABELS, FAILURE_COLORS,
} from '@/lib/printerControl';

const STATUS_COLORS: Record<PrinterFailureEvent['status'], string> = {
  open: 'bg-red-500/20 border-red-500/40 text-red-300',
  acknowledged: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  false_positive: 'bg-gray-700 border-gray-600 text-gray-400',
  resolved: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
};

const STATUS_LABEL: Record<PrinterFailureEvent['status'], string> = {
  open: 'Aberto', acknowledged: 'Reconhecido',
  false_positive: 'Falso +', resolved: 'Resolvido',
};

export default function PrinterFailureTimeline({ impressora }: { impressora: PrinterDevice }) {
  const [events, setEvents] = useState<PrinterFailureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const evs = await listarFailureEvents(impressora.id, 50);
      setEvents(evs);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [impressora.id]);

  const setStatus = async (id: string, status: PrinterFailureEvent['status']) => {
    setUpdating(id);
    try {
      await atualizarFailureStatus(id, status);
      await load();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-400" />
        <h3 className="font-semibold text-white">Timeline de detecções</h3>
        <span className="ml-auto text-xs text-gray-500">{events.length} eventos</span>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin"/>carregando…
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500 italic">
          Sem detecções registradas. Bora imprimir tranquilo. 🤖
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {events.map((ev) => (
            <div key={ev.id} className="flex gap-3 items-start p-3 rounded-xl border border-gray-800 hover:border-gray-700 transition bg-gray-950">
              {/* Snapshot */}
              {ev.snapshot_url ? (
                <img src={ev.snapshot_url} alt="snapshot"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-700 flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-6 h-6 text-gray-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${FAILURE_COLORS[ev.failure_type]}`}>
                    {FAILURE_LABELS[ev.failure_type]}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {(ev.confidence * 100).toFixed(0)}%
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[ev.status]}`}>
                    {STATUS_LABEL[ev.status]}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ev.detected_at).toLocaleString('pt-BR')}
                  {ev.action_taken && (
                    <span className="ml-2 text-gray-400">· {ev.action_taken}</span>
                  )}
                </div>
                {ev.notes && (
                  <div className="text-xs text-gray-400 mt-1 italic line-clamp-2">{ev.notes}</div>
                )}

                {ev.status === 'open' && (
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => setStatus(ev.id, 'acknowledged')}
                      disabled={updating === ev.id}
                      className="text-[11px] px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/40">
                      Reconhecer
                    </button>
                    <button onClick={() => setStatus(ev.id, 'false_positive')}
                      disabled={updating === ev.id}
                      className="text-[11px] px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600">
                      <X className="w-3 h-3 inline" /> Falso +
                    </button>
                    <button onClick={() => setStatus(ev.id, 'resolved')}
                      disabled={updating === ev.id}
                      className="text-[11px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40">
                      <Check className="w-3 h-3 inline" /> Resolvido
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
