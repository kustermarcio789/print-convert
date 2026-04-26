import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pause, Play, Square, AlertOctagon, BarChart3, Rocket, Wifi, WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PrinterDevice,
  PrinterTelemetry,
  enviarComando,
  getTelemetry,
  stateColor,
  stateLabel,
  ultimoSnapshot,
  publicSnapshotUrl,
} from '@/lib/printerControl';
import PrinterDetailModal from './PrinterDetailModal';

interface Props {
  impressora: PrinterDevice;
  onOpenUpload: (impressora: PrinterDevice) => void;
}

/**
 * Card resumido pra listagem de impressoras conectadas.
 * Foco em: status, webcam ao vivo, e 3 ações (Cockpit / Histórico / E-Stop).
 * Controles detalhados (jog, temp, sliders) ficam no /cockpit dedicado.
 */
export default function PrinterLiveCard({ impressora }: Props) {
  const [telemetry, setTelemetry] = useState<PrinterTelemetry | null>(null);
  const [snap, setSnap] = useState<string | null>(null);
  const [streamError, setStreamError] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [t, s] = await Promise.all([
          getTelemetry(impressora.id),
          ultimoSnapshot(impressora.id),
        ]);
        if (cancelled) return;
        setTelemetry(t);
        if (s) setSnap(publicSnapshotUrl(s.storage_path));
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [impressora.id]);

  const handleCommand = async (
    cmd: Parameters<typeof enviarComando>[1],
    confirmMsg?: string,
  ) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setSending(cmd);
    setError(null);
    try {
      await enviarComando(impressora.id, cmd);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(null);
    }
  };

  const state = telemetry?.state ?? 'offline';
  const isOnline = state !== 'offline';
  const isPrinting = state === 'printing';
  const isPaused = state === 'paused';
  const updatedAgo = telemetry?.updated_at
    ? Math.max(0, Math.floor((Date.now() - new Date(telemetry.updated_at).getTime()) / 1000))
    : null;
  const progress = telemetry?.progress ?? 0;

  const publicStream = impressora.webcam_public_url
    || (impressora.public_base_url
      ? impressora.public_base_url.replace(/\/+$/, '') + '/webcam/?action=stream'
      : null);

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex flex-col">
      {/* Header compacto */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stateColor(state)} ${isOnline ? 'animate-pulse' : ''}`} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{impressora.nome}</div>
          <div className="text-xs text-gray-500 truncate">
            {impressora.marca} {impressora.modelo} · {stateLabel(state)}
            {updatedAgo !== null && <span className="ml-1">({updatedAgo}s atrás)</span>}
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded flex-shrink-0">
          {impressora.firmware_tipo}
        </span>
      </div>

      {/* Webcam preview (grande, em destaque) */}
      <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
        {publicStream && !streamError ? (
          <img
            src={publicStream}
            alt="Webcam ao vivo"
            className="w-full h-full object-contain"
            onError={() => setStreamError(true)}
          />
        ) : snap ? (
          <img src={snap} alt="Snapshot" className="w-full h-full object-contain" />
        ) : (
          <div className="text-gray-500 text-sm flex flex-col items-center gap-2">
            <WifiOff className="w-8 h-8 opacity-40" />
            Sem imagem disponível
          </div>
        )}

        {/* Overlay status */}
        <div className="absolute top-2 left-2 right-2 flex items-center gap-2 pointer-events-none">
          {isOnline && publicStream && !streamError && (
            <span className="bg-black/60 backdrop-blur text-[10px] text-white font-mono px-2 py-0.5 rounded flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              ao vivo
            </span>
          )}
          {(isPrinting || isPaused) && (
            <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur ${
              isPaused ? 'bg-yellow-500/80 text-white' : 'bg-blue-500/80 text-white'
            }`}>
              {progress.toFixed(0)}%
            </span>
          )}
        </div>

        {/* Progress bar embaixo da câmera (só se imprimindo) */}
        {(isPrinting || isPaused) && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div
              className={`h-full transition-all ${isPaused ? 'bg-yellow-400' : 'bg-green-500'}`}
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        )}
      </div>

      {/* Ações contextuais (pause/resume/cancel só durante print) */}
      {(isPrinting || isPaused) && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex gap-2">
          {isPrinting && (
            <Button size="sm" variant="outline" className="flex-1"
              onClick={() => handleCommand('pause')} disabled={sending === 'pause'}>
              <Pause className="w-3.5 h-3.5 mr-1" /> Pausar
            </Button>
          )}
          {isPaused && (
            <Button size="sm" className="flex-1"
              onClick={() => handleCommand('resume')} disabled={sending === 'resume'}>
              <Play className="w-3.5 h-3.5 mr-1" /> Retomar
            </Button>
          )}
          <Button size="sm" variant="outline" className="flex-1"
            onClick={() => handleCommand('cancel', 'Cancelar o print atual?')}
            disabled={sending === 'cancel'}>
            <Square className="w-3.5 h-3.5 mr-1" /> Cancelar
          </Button>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</div>
      )}

      {/* Botões principais */}
      <div className="px-4 py-3 space-y-2">
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 font-semibold"
          onClick={() => navigate(`/admin/impressoras/${impressora.id}/cockpit`)}
        >
          <Rocket className="w-4 h-4 mr-2" /> Cockpit Mode
        </Button>

        <Button variant="outline" className="w-full" onClick={() => setDetailOpen(true)}>
          <BarChart3 className="w-4 h-4 mr-2" /> Histórico, manutenção, ROI
        </Button>

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => handleCommand('emergency_stop', 'EMERGENCY STOP vai travar a impressora — confirmar?')}
          disabled={!isOnline || sending === 'emergency_stop'}
        >
          <AlertOctagon className="w-4 h-4 mr-2" /> Emergency Stop
        </Button>
      </div>

      {detailOpen && (
        <PrinterDetailModal
          impressora={impressora}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}
