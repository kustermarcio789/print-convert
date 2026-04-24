import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PrinterDevice,
  enviarComando,
  signedGcodeUrl,
  uploadGcode,
} from '@/lib/printerControl';

interface Props {
  impressora: PrinterDevice;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Dialog que faz upload do .gcode para o Supabase Storage e, em seguida,
 * cria o comando `print_file` na fila com uma signed URL. O agente no RPi
 * puxa, baixa e manda pro Moonraker com print=true.
 */
export default function UploadGcodeDialog({ impressora, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<'upload' | 'enqueue' | 'done'>('upload');

  const handleEnviar = async () => {
    if (!file) {
      setError('Selecione um arquivo .gcode primeiro.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      setStage('upload');
      const saved = await uploadGcode(file);
      setStage('enqueue');
      const url = await signedGcodeUrl(saved.storage_path, 60 * 60 * 2); // 2h
      await enviarComando(impressora.id, 'print_file', {
        download_url: url,
        filename: saved.nome_original,
        gcode_file_id: saved.id,
      });
      setStage('done');
      onSuccess?.();
      setTimeout(onClose, 800);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <div className="font-semibold">Enviar GCODE & imprimir</div>
            <div className="text-xs text-gray-500">{impressora.nome}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Arquivo .gcode</span>
            <input
              type="file"
              accept=".gcode,.g,.gco"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-medium
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
              disabled={loading}
            />
          </label>

          {file && (
            <div className="text-xs text-gray-600 border border-gray-100 rounded p-2">
              <div className="font-mono truncate">{file.name}</div>
              <div>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {stage === 'upload' && 'Enviando arquivo para o storage…'}
              {stage === 'enqueue' && 'Criando comando para o agente…'}
              {stage === 'done' && 'Ok! Comando enfileirado.'}
            </div>
          )}

          {error && <div className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>}

          <div className="text-xs text-gray-500 leading-relaxed">
            O arquivo é enviado pro Supabase Storage e o agente local da {impressora.nome}
            {' '}(Klipper/Moonraker) vai baixar e iniciar o print na próxima passada
            (até 5 segundos). Você pode acompanhar o progresso pelo card ao vivo.
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleEnviar} disabled={loading || !file}>
            <Upload className="w-4 h-4 mr-1" />
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
}
