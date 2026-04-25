import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import {
  PrinterDevice,
  listarImpressorasConectadas,
} from '@/lib/printerControl';
import PrinterLiveCard from './PrinterLiveCard';
import UploadGcodeDialog from './UploadGcodeDialog';
import ROIDashboard from './ROIDashboard';

/**
 * Painel "Impressoras Conectadas" — lista as impressoras que estão
 * cadastradas em printer_devices (ou seja, com agente rodando) e mostra
 * cards ao vivo com controles. O CRUD local do AdminImpressoras continua
 * funcionando em paralelo até migrar tudo pra cá.
 */
export default function PainelImpressorasConectadas() {
  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<PrinterDevice | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await listarImpressorasConectadas();
      setDevices(list);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && devices.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm">
        Carregando impressoras conectadas…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        Erro ao carregar impressoras conectadas: {error}
        <button onClick={load} className="ml-2 underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Impressoras Conectadas</h2>
          <span className="text-xs text-gray-500">({devices.length})</span>
        </div>
        <button
          onClick={load}
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
          <WifiOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Nenhuma impressora conectada ainda.</p>
          <p className="text-xs text-gray-500 mt-1">
            Cadastre uma impressora real na tabela <code>printer_devices</code> e rode o agente
            no Raspberry Pi — ver <code>printer_agent/README.md</code>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map((d) => (
            <PrinterLiveCard
              key={d.id}
              impressora={d}
              onOpenUpload={(imp) => setUploadTarget(imp)}
            />
          ))}
        </div>
      )}

      {uploadTarget && (
        <UploadGcodeDialog
          impressora={uploadTarget}
          onClose={() => setUploadTarget(null)}
        />
      )}

      {/* ROI Dashboard (KPIs agregados de toda a frota) */}
      <ROIDashboard />
    </section>
  );
}
