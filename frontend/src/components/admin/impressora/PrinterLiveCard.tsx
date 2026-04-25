import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, AlertOctagon, RotateCcw, Upload, Thermometer, Sliders, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PrinterDevice,
  PrinterTelemetry,
  enviarComando,
  formatDuration,
  getTelemetry,
  stateColor,
  stateLabel,
} from '@/lib/printerControl';
import PrinterAdvancedControls from './PrinterAdvancedControls';
import PrinterDetailModal from './PrinterDetailModal';

interface Props {
  impressora: PrinterDevice;
  onOpenUpload: (impressora: PrinterDevice) => void;
}

/**
 * Card com telemetria ao vivo da impressora (polling a cada 5s) e
 * botões de controle. Cada botão cria um comando na fila; o agente local
 * puxa e executa no Moonraker.
 */
export default function PrinterLiveCard({ impressora, onOpenUpload }: Props) {
  const [telemetry, setTelemetry] = useState<PrinterTelemetry | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const t = await getTelemetry(impressora.id);
        if (!cancelled) setTelemetry(t);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [impressora.id]);

  const handleCommand = async (
    cmd: Parameters<typeof enviarComando>[1],
    confirmMsg?: string,
    params?: Record<string, unknown>,
  ) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setSending(cmd);
    setError(null);
    try {
      await enviarComando(impressora.id, cmd, params);
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

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className={`w-3 h-3 rounded-full ${stateColor(state)} ${isOnline ? 'animate-pulse' : ''}`} />
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{impressora.nome}</div>
          <div className="text-xs text-gray-500">
            {impressora.marca} {impressora.modelo} · {stateLabel(state)}
            {updatedAgo !== null && <span className="ml-2">({updatedAgo}s atrás)</span>}
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
          {impressora.firmware_tipo}
        </span>
      </div>

      {/* Telemetria */}
      <div className="px-5 py-4 space-y-3">
        {telemetry?.current_file && (
          <div className="text-sm text-gray-700 truncate" title={telemetry.current_file}>
            📄 <span className="font-medium">{telemetry.current_file}</span>
          </div>
        )}

        {/* Progress */}
        {isPrinting || isPaused ? (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progresso</span>
              <span className="font-semibold">{telemetry?.progress?.toFixed(1) ?? 0}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${isPaused ? 'bg-yellow-400' : 'bg-green-500'}`}
                style={{ width: `${Math.max(0, Math.min(100, telemetry?.progress ?? 0))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatDuration(telemetry?.print_duration_seconds)} decorrido</span>
              <span>~{formatDuration(telemetry?.print_time_remaining_seconds)} restantes</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">Sem job ativo</div>
        )}

        {/* Temperaturas */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <TempGauge
            label="Bico"
            current={telemetry?.extruder_temp}
            target={telemetry?.extruder_target}
          />
          <TempGauge
            label="Mesa"
            current={telemetry?.bed_temp}
            target={telemetry?.bed_target}
          />
        </div>

        {error && <div className="text-xs text-red-600 bg-red-50 rounded p-2">{error}</div>}
      </div>

      {/* Botões de controle */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 grid grid-cols-3 gap-2">
        {isPrinting && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCommand('pause')}
            disabled={sending === 'pause'}
          >
            <Pause className="w-4 h-4 mr-1" /> Pausar
          </Button>
        )}
        {isPaused && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCommand('resume')}
            disabled={sending === 'resume'}
          >
            <Play className="w-4 h-4 mr-1" /> Retomar
          </Button>
        )}
        {(isPrinting || isPaused) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCommand('cancel', 'Cancelar o print atual? Essa ação não pode ser desfeita.')}
            disabled={sending === 'cancel'}
          >
            <Square className="w-4 h-4 mr-1" /> Cancelar
          </Button>
        )}
        {!isPrinting && !isPaused && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onOpenUpload(impressora)}
            disabled={!isOnline}
            className="col-span-2"
          >
            <Upload className="w-4 h-4 mr-1" /> Enviar GCODE & Imprimir
          </Button>
        )}
        {!isPrinting && !isPaused && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCommand('home')}
            disabled={sending === 'home' || !isOnline}
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Home
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="col-span-3"
          onClick={() => setAdvancedOpen(true)}
          disabled={!isOnline}
        >
          <Sliders className="w-4 h-4 mr-1" /> Controles avançados
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="col-span-3"
          onClick={() => setDetailOpen(true)}
        >
          <BarChart3 className="w-4 h-4 mr-1" /> Detalhes & análise
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="col-span-3"
          onClick={() =>
            handleCommand(
              'emergency_stop',
              'EMERGENCY STOP vai travar a impressora imediatamente — confirmar?',
            )
          }
          disabled={!isOnline || sending === 'emergency_stop'}
        >
          <AlertOctagon className="w-4 h-4 mr-1" /> Emergency Stop
        </Button>
      </div>

      {advancedOpen && (
        <PrinterAdvancedControls
          impressora={impressora}
          onClose={() => setAdvancedOpen(false)}
        />
      )}

      {detailOpen && (
        <PrinterDetailModal
          impressora={impressora}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}

function TempGauge({
  label,
  current,
  target,
}: {
  label: string;
  current?: number | null;
  target?: number | null;
}) {
  const cur = current ?? 0;
  const tgt = target ?? 0;
  const heating = tgt > 0 && Math.abs(cur - tgt) > 2;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2">
      <Thermometer className={`w-4 h-4 ${heating ? 'text-orange-500' : 'text-gray-400'}`} />
      <div className="text-xs">
        <div className="text-gray-500">{label}</div>
        <div className="font-mono text-gray-900">
          {cur.toFixed(0)}° <span className="text-gray-400">/ {tgt.toFixed(0)}°</span>
        </div>
      </div>
    </div>
  );
}
