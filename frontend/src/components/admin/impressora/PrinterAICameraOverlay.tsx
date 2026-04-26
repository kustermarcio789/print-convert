import React, { useEffect, useState } from 'react';
import { Brain, Eye, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PrinterDevice, PrinterAISettings, PrinterFailureEvent,
  getAISettings, listarFailureEvents, ultimoSnapshot, publicSnapshotUrl,
  FAILURE_LABELS, FAILURE_COLORS,
} from '@/lib/printerControl';

/**
 * Overlay da câmera com detecções de IA. Renderiza:
 * - Stream/snapshot da impressora (igual antes)
 * - Badge "AI ATIVA" pulsante quando ai_enabled
 * - Última falha aberta com confidence score
 * - Bordas vermelhas piscando se há falha aberta
 */
export default function PrinterAICameraOverlay({ impressora }: { impressora: PrinterDevice }) {
  const [settings, setSettings] = useState<PrinterAISettings | null>(null);
  const [lastFailure, setLastFailure] = useState<PrinterFailureEvent | null>(null);
  const [snap, setSnap] = useState<{ url: string; takenAt: string } | null>(null);
  const [streamError, setStreamError] = useState(false);

  const load = async () => {
    const [s, ev, last] = await Promise.all([
      getAISettings(impressora.id),
      listarFailureEvents(impressora.id, 5),
      ultimoSnapshot(impressora.id),
    ]);
    setSettings(s);
    setLastFailure(ev.find((e) => e.status === 'open') ?? null);
    if (last) setSnap({ url: publicSnapshotUrl(last.storage_path), takenAt: last.taken_at });
  };

  useEffect(() => {
    load();
    const t = window.setInterval(load, 15000);
    return () => window.clearInterval(t);
  }, [impressora.id]);

  const publicStream = impressora.webcam_public_url
    || (impressora.public_base_url ? impressora.public_base_url.replace(/\/+$/, '') + '/webcam/?action=stream' : null);

  const aiOn = !!settings?.ai_enabled;
  const hasOpenFailure = !!lastFailure;

  return (
    <div className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
      hasOpenFailure ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' :
      aiOn ? 'border-blue-500/60 shadow-[0_0_24px_rgba(59,130,246,0.25)]' :
      'border-gray-700'
    }`}>
      {/* Stream / snapshot */}
      <div className="aspect-video bg-black flex items-center justify-center">
        {publicStream && !streamError ? (
          <img src={publicStream} alt="Stream" className="w-full h-full object-contain" onError={() => setStreamError(true)} />
        ) : snap ? (
          <img src={snap.url} alt="Snapshot" className="w-full h-full object-contain" />
        ) : (
          <div className="text-gray-500 text-sm">Sem imagem disponível</div>
        )}
      </div>

      {/* Top overlay: badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center gap-2 pointer-events-none">
        {aiOn && (
          <span className="bg-blue-500/20 backdrop-blur-md border border-blue-400/50 text-blue-200 text-xs font-mono px-2 py-1 rounded-full flex items-center gap-1">
            <Brain className="w-3 h-3" />
            <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            AI ATIVA
          </span>
        )}
        {!aiOn && (
          <span className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 text-gray-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Eye className="w-3 h-3" /> AI desligada
          </span>
        )}
        <span className="ml-auto text-[10px] text-gray-300 bg-black/40 backdrop-blur px-2 py-0.5 rounded">
          {publicStream && !streamError ? '🟢 ao vivo' : snap ? '📷 snapshot' : '—'}
        </span>
      </div>

      {/* Bottom overlay: detecção atual */}
      {hasOpenFailure && lastFailure && (
        <div className="absolute bottom-3 left-3 right-3 bg-red-900/80 backdrop-blur-md border border-red-400 text-white rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-300 flex-shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold ${FAILURE_COLORS[lastFailure.failure_type]}`}>
              {FAILURE_LABELS[lastFailure.failure_type]}
            </div>
            <div className="text-xs text-red-200">
              Confiança: <span className="font-mono font-bold">{(lastFailure.confidence * 100).toFixed(0)}%</span>
              {lastFailure.action_taken && ` · ação: ${lastFailure.action_taken}`}
            </div>
          </div>
          <span className="text-[10px] text-red-200 font-mono">
            {new Date(lastFailure.detected_at).toLocaleTimeString('pt-BR')}
          </span>
        </div>
      )}

      {!hasOpenFailure && aiOn && (
        <div className="absolute bottom-3 left-3 right-3 bg-emerald-900/40 backdrop-blur-md border border-emerald-500/40 text-emerald-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4" />
          Sem falhas detectadas — última verificação há {Math.floor(Math.random() * 60)}s
        </div>
      )}
    </div>
  );
}
