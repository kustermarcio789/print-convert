import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock, Flame, Gauge } from 'lucide-react';
import {
  PrinterDevice, PrintJob, PrinterFailureEvent,
  listarPrintJobs, listarFailureEvents, formatDuration,
} from '@/lib/printerControl';

/**
 * Dashboard analítico — KPIs do print + gráficos compactos.
 * Foco em mostrar saúde da impressora num relance.
 */
export default function PrinterAnalyticsDashboard({ impressora }: { impressora: PrinterDevice }) {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [failures, setFailures] = useState<PrinterFailureEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listarPrintJobs(impressora.id, 30),
      listarFailureEvents(impressora.id, 30),
    ]).then(([j, f]) => {
      setJobs(j);
      setFailures(f);
      setLoading(false);
    });
  }, [impressora.id]);

  const stats = useMemo(() => {
    const ok = jobs.filter((j) => j.status === 'completed').length;
    const fail = jobs.filter((j) => j.status === 'failed' || j.status === 'cancelled').length;
    const total = ok + fail;
    const taxa = total > 0 ? (ok / total) * 100 : 0;
    const totalSec = jobs.reduce((s, j) => s + (j.duration_seconds || 0), 0);
    const last7d = failures.filter((f) =>
      new Date(f.detected_at).getTime() > Date.now() - 7 * 24 * 3600 * 1000
    );
    return {
      ok, fail, total, taxa,
      horas: totalSec / 3600,
      falhas7d: last7d.length,
      falsosPositivos: failures.filter((f) => f.status === 'false_positive').length,
    };
  }, [jobs, failures]);

  // Histórico de duração — gráfico de barras simples
  const recentDurations = jobs.slice(0, 20).reverse();
  const maxDur = Math.max(1, ...recentDurations.map((j) => j.duration_seconds || 0));

  if (loading) {
    return <div className="text-sm text-gray-400">carregando…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={<Gauge className="w-4 h-4" />} label="Taxa de sucesso"
          value={stats.total > 0 ? `${stats.taxa.toFixed(0)}%` : '—'}
          color={stats.taxa >= 90 ? 'green' : stats.taxa >= 70 ? 'yellow' : 'red'} />
        <KpiCard icon={<CheckCircle2 className="w-4 h-4" />} label="Jobs OK"
          value={stats.ok.toString()} color="blue" />
        <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="Falhas (7d)"
          value={stats.falhas7d.toString()} color={stats.falhas7d > 3 ? 'red' : 'gray'} />
        <KpiCard icon={<Clock className="w-4 h-4" />} label="Horas impressas"
          value={`${stats.horas.toFixed(1)}h`} color="purple" />
      </div>

      {/* Gráfico de duração */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-400" />
          <h4 className="font-semibold text-white text-sm">Duração dos últimos {recentDurations.length} jobs</h4>
        </div>
        {recentDurations.length === 0 ? (
          <div className="text-xs text-gray-500 italic text-center py-4">Sem jobs registrados.</div>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {recentDurations.map((j) => {
              const h = ((j.duration_seconds || 0) / maxDur) * 100;
              const failed = j.status === 'failed' || j.status === 'cancelled';
              return (
                <div key={j.id} className="flex-1 flex flex-col justify-end items-center group relative"
                  title={`${j.gcode_filename || ''} — ${formatDuration(j.duration_seconds)} (${j.status})`}>
                  <div
                    className={`w-full rounded-t transition-all ${
                      failed ? 'bg-red-500/60' : 'bg-blue-500/60 hover:bg-blue-400'
                    }`}
                    style={{ height: `${Math.max(3, h)}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Distribuição de falhas */}
      {failures.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <h4 className="font-semibold text-white text-sm">Tipos de falha (últimos 30 eventos)</h4>
          </div>
          <FailureBreakdown failures={failures} />
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'blue'|'green'|'yellow'|'red'|'purple'|'gray' }) {
  const map: Record<string, string> = {
    blue: 'border-blue-500/30 from-blue-500/10',
    green: 'border-emerald-500/30 from-emerald-500/10',
    yellow: 'border-yellow-500/30 from-yellow-500/10',
    red: 'border-red-500/30 from-red-500/10',
    purple: 'border-purple-500/30 from-purple-500/10',
    gray: 'border-gray-700 from-gray-800/40',
  };
  const text: Record<string, string> = {
    blue: 'text-blue-300', green: 'text-emerald-300', yellow: 'text-yellow-300',
    red: 'text-red-300', purple: 'text-purple-300', gray: 'text-gray-300',
  };
  return (
    <div className={`bg-gradient-to-br to-gray-900 border rounded-2xl p-3 ${map[color]}`}>
      <div className={`flex items-center gap-1.5 text-xs ${text[color]} opacity-80 mb-1`}>{icon}{label}</div>
      <div className={`text-2xl font-semibold ${text[color]}`}>{value}</div>
    </div>
  );
}

function FailureBreakdown({ failures }: { failures: PrinterFailureEvent[] }) {
  const counts: Record<string, number> = {};
  failures.forEach((f) => { counts[f.failure_type] = (counts[f.failure_type] || 0) + 1; });
  const total = failures.length;
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return (
    <div className="space-y-2">
      {entries.map(([type, count]) => {
        const pct = (count / total) * 100;
        return (
          <div key={type}>
            <div className="flex justify-between text-xs text-gray-300 mb-0.5">
              <span>{type}</span>
              <span className="font-mono">{count} ({pct.toFixed(0)}%)</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded">
              <div className="h-full bg-orange-500/70 rounded" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
