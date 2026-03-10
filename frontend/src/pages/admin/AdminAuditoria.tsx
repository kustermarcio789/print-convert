import { useState, useEffect } from 'react';
import { Shield, Search, Trash2, Download, Calendar, User, FileText, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/admin/Sidebar';

interface LogEntry {
  data: string;
  acao: string;
  executadoPor: string;
  alvo: string;
  detalhes: string;
}

export default function AdminAuditoria() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filterAcao, setFilterAcao] = useState('todos');

  useEffect(() => {
    const saved = localStorage.getItem('admin_audit_logs');
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  const refresh = () => {
    const saved = localStorage.getItem('admin_audit_logs');
    if (saved) setLogs(JSON.parse(saved));
  };

  const clearLogs = () => {
    if (!window.confirm('Limpar todos os logs de auditoria?')) return;
    localStorage.setItem('admin_audit_logs', '[]');
    setLogs([]);
  };

  const exportCSV = () => {
    const header = 'Data,Ação,Executado Por,Alvo,Detalhes\n';
    const rows = logs.map(l => `"${new Date(l.data).toLocaleString('pt-BR')}","${l.acao}","${l.executadoPor}","${l.alvo}","${l.detalhes}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'auditoria_3dkprint.csv'; a.click();
  };

  const acoes = [...new Set(logs.map(l => l.acao))];
  const filtered = logs.filter(l => {
    const matchSearch = !search || l.acao.toLowerCase().includes(search.toLowerCase()) || l.executadoPor.toLowerCase().includes(search.toLowerCase()) || l.alvo.toLowerCase().includes(search.toLowerCase());
    const matchAcao = filterAcao === 'todos' || l.acao === filterAcao;
    return matchSearch && matchAcao;
  });

  const acaoColor = (acao: string) => {
    if (acao.includes('Criou') || acao.includes('Adicionou')) return 'text-green-400 bg-green-500/20';
    if (acao.includes('Excluiu') || acao.includes('Removeu')) return 'text-red-400 bg-red-500/20';
    if (acao.includes('Atualizou') || acao.includes('Editou')) return 'text-blue-400 bg-blue-500/20';
    if (acao.includes('Login')) return 'text-amber-400 bg-amber-500/20';
    return 'text-gray-400 bg-gray-500/20';
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-[#161923] border-b border-white/10 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="text-gray-400" size={22} />Logs de Auditoria</h2>
              <p className="text-sm text-gray-400 mt-1">Registro de todas as ações realizadas no sistema</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={refresh} className="bg-white/10 hover:bg-white/20 text-white border-0"><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
              <Button onClick={exportCSV} className="bg-white/10 hover:bg-white/20 text-white border-0"><Download className="w-4 h-4 mr-2" />Exportar</Button>
              <Button onClick={clearLogs} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-0"><Trash2 className="w-4 h-4 mr-2" />Limpar</Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 bg-[#161923] px-3 py-1.5 rounded-lg border border-white/10">{logs.length} registro(s)</span>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 bg-[#161923] border border-white/10 rounded-lg text-white text-sm" />
            </div>
            {acoes.length > 0 && (
              <select value={filterAcao} onChange={e => setFilterAcao(e.target.value)}
                className="px-4 py-2 bg-[#161923] border border-white/10 rounded-lg text-white text-sm [&>option]:bg-slate-800">
                <option value="todos">Todas as Ações</option>
                {acoes.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-[#161923] rounded-xl border border-white/10">
              <Shield className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">Nenhum log de auditoria encontrado.</p>
              <p className="text-sm text-gray-500 mt-1">Ações realizadas no sistema serão registradas aqui.</p>
            </div>
          ) : (
            <div className="bg-[#161923] rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ação</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Executado Por</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Alvo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(log.data).toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${acaoColor(log.acao)}`}>{log.acao}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        <div className="flex items-center gap-1.5"><User size={12} className="text-gray-500" />{log.executadoPor}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{log.alvo}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs max-w-[200px] truncate">{log.detalhes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
