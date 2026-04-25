import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, Clock, Wrench } from 'lucide-react';
import { listarKpis, PrinterKpi } from '@/lib/printerControl';

/**
 * Dashboard "Saúde da frota" — uma linha por impressora com KPIs agregados:
 * jobs OK/falha, horas impressas, custo de manutenção, valor da máquina,
 * % uso e custo/hora real (manutenção / horas).
 */
export default function ROIDashboard() {
  const [rows, setRows] = useState<PrinterKpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarKpis().then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (rows.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Saúde da frota</h2>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Impressora</th>
              <th className="text-right px-3 py-2">Jobs OK</th>
              <th className="text-right px-3 py-2">Falhas</th>
              <th className="text-right px-3 py-2">Taxa</th>
              <th className="text-right px-3 py-2">Horas impressas</th>
              <th className="text-right px-3 py-2">Horas paradas</th>
              <th className="text-right px-3 py-2">Manutenção</th>
              <th className="text-right px-3 py-2">Compra</th>
              <th className="text-right px-3 py-2">Custo/h real</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const total = r.jobs_ok + r.jobs_falha;
              const taxa = total > 0 ? (r.jobs_ok / total) * 100 : 0;
              const custoPorHora = r.horas_impressao > 0 ? (r.custo_manutencao + r.valor_compra * 0.05) / r.horas_impressao : 0;
              return (
                <tr key={r.printer_id} className="border-t">
                  <td className="px-3 py-2 font-medium">{r.nome}</td>
                  <td className="px-3 py-2 text-right text-green-700">{r.jobs_ok}</td>
                  <td className="px-3 py-2 text-right text-red-700">{r.jobs_falha}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={taxa >= 90 ? 'text-green-700' : taxa >= 75 ? 'text-yellow-700' : 'text-red-700'}>
                      {total > 0 ? `${taxa.toFixed(0)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">{r.horas_impressao.toFixed(1)}h</td>
                  <td className="px-3 py-2 text-right">{r.horas_paradas.toFixed(1)}h</td>
                  <td className="px-3 py-2 text-right">R$ {r.custo_manutencao.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">R$ {r.valor_compra.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">
                    {custoPorHora > 0 ? `R$ ${custoPorHora.toFixed(2)}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500">
        💡 Custo/h real = (manutenção + 5% do valor de compra) ÷ horas impressas. Use como referência
        ao ajustar o "custo por hora" na aba <strong>Precificação</strong> de cada máquina.
      </div>
    </section>
  );
}
