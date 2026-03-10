import { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Eye, Phone, User, Calendar, Tag, Filter, Plus, X, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/admin/Sidebar';

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  interesse: string;
  status: 'novo' | 'contatado' | 'qualificado' | 'convertido' | 'perdido';
  notas: string;
  data: string;
}

const statusConfig: Record<string, { label: string; cor: string; bg: string; icon: any }> = {
  novo: { label: 'Novo', cor: 'text-blue-400', bg: 'bg-blue-500/20', icon: Mail },
  contatado: { label: 'Contatado', cor: 'text-amber-400', bg: 'bg-amber-500/20', icon: Phone },
  qualificado: { label: 'Qualificado', cor: 'text-purple-400', bg: 'bg-purple-500/20', icon: CheckCircle },
  convertido: { label: 'Convertido', cor: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle },
  perdido: { label: 'Perdido', cor: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle },
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showAdd, setShowAdd] = useState(false);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState({ nome: '', email: '', telefone: '', origem: 'site', interesse: '', notas: '' });

  useEffect(() => {
    const saved = localStorage.getItem('admin_leads');
    if (saved) setLeads(JSON.parse(saved));
  }, []);

  const salvar = (data: Lead[]) => { setLeads(data); localStorage.setItem('admin_leads', JSON.stringify(data)); };

  const handleAdd = () => {
    if (!newLead.nome || !newLead.email) { alert('Nome e email são obrigatórios'); return; }
    const lead: Lead = { ...newLead, id: `lead_${Date.now()}`, status: 'novo', data: new Date().toISOString() };
    salvar([lead, ...leads]);
    setNewLead({ nome: '', email: '', telefone: '', origem: 'site', interesse: '', notas: '' });
    setShowAdd(false);
  };

  const handleStatusChange = (id: string, status: Lead['status']) => {
    salvar(leads.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este lead?')) salvar(leads.filter(l => l.id !== id));
  };

  const exportCSV = () => {
    const header = 'Nome,Email,Telefone,Origem,Interesse,Status,Data\n';
    const rows = leads.map(l => `"${l.nome}","${l.email}","${l.telefone}","${l.origem}","${l.interesse}","${l.status}","${new Date(l.data).toLocaleDateString('pt-BR')}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads_3dkprint.csv'; a.click();
  };

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.nome.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const novos = leads.filter(l => l.status === 'novo').length;
  const contatados = leads.filter(l => l.status === 'contatado').length;
  const convertidos = leads.filter(l => l.status === 'convertido').length;

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-[#161923] border-b border-white/10 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Mail className="text-amber-400" size={22} />Leads Capturados</h2>
              <p className="text-sm text-gray-400 mt-1">Gerencie contatos e oportunidades de negócio</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportCSV} className="bg-white/10 hover:bg-white/20 text-white border-0"><Download className="w-4 h-4 mr-2" />Exportar CSV</Button>
              <Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4 mr-2" />Novo Lead</Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <p className="text-3xl font-bold text-white">{leads.length}</p>
              <p className="text-xs text-gray-400">Total Leads</p>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <p className="text-3xl font-bold text-blue-400">{novos}</p>
              <p className="text-xs text-gray-400">Novos</p>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <p className="text-3xl font-bold text-amber-400">{contatados}</p>
              <p className="text-xs text-gray-400">Contatados</p>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <p className="text-3xl font-bold text-green-400">{convertidos}</p>
              <p className="text-xs text-gray-400">Convertidos</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou email..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#161923] border border-white/10 rounded-lg text-white text-sm" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-[#161923] border border-white/10 rounded-lg text-white text-sm [&>option]:bg-slate-800">
              <option value="todos">Todos os Status</option>
              <option value="novo">Novos</option>
              <option value="contatado">Contatados</option>
              <option value="qualificado">Qualificados</option>
              <option value="convertido">Convertidos</option>
              <option value="perdido">Perdidos</option>
            </select>
          </div>

          {/* Modal Novo Lead */}
          {showAdd && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-[#1a1d2e] rounded-xl border border-white/10 p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Novo Lead</h3>
                  <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  <input value={newLead.nome} onChange={e => setNewLead({ ...newLead, nome: e.target.value })} placeholder="Nome completo *"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} placeholder="Email *"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                    <input value={newLead.telefone} onChange={e => setNewLead({ ...newLead, telefone: e.target.value })} placeholder="Telefone"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select value={newLead.origem} onChange={e => setNewLead({ ...newLead, origem: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm [&>option]:bg-slate-800">
                      <option value="site">Site</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="instagram">Instagram</option>
                      <option value="indicacao">Indicação</option>
                      <option value="outro">Outro</option>
                    </select>
                    <input value={newLead.interesse} onChange={e => setNewLead({ ...newLead, interesse: e.target.value })} placeholder="Interesse (ex: Impressão 3D)"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                  </div>
                  <textarea value={newLead.notas} onChange={e => setNewLead({ ...newLead, notas: e.target.value })} placeholder="Notas..."
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm h-20 resize-none" />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button onClick={() => setShowAdd(false)} variant="ghost" className="text-gray-400">Cancelar</Button>
                  <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">Salvar Lead</Button>
                </div>
              </div>
            </div>
          )}

          {/* Lista */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-[#161923] rounded-xl border border-white/10">
              <Mail className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">Nenhum lead encontrado.</p>
              <p className="text-sm text-gray-500 mt-1">Leads capturados pelo site aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(lead => {
                const cfg = statusConfig[lead.status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={lead.id} className="bg-[#161923] rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                          {lead.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{lead.nome}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1"><Mail size={10} />{lead.email}</span>
                            {lead.telefone && <span className="flex items-center gap-1"><Phone size={10} />{lead.telefone}</span>}
                            <span className="flex items-center gap-1"><Calendar size={10} />{new Date(lead.data).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {lead.interesse && <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300">{lead.interesse}</span>}
                        <select value={lead.status} onChange={e => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.cor} border-0 [&>option]:bg-slate-800 [&>option]:text-white`}>
                          <option value="novo">Novo</option>
                          <option value="contatado">Contatado</option>
                          <option value="qualificado">Qualificado</option>
                          <option value="convertido">Convertido</option>
                          <option value="perdido">Perdido</option>
                        </select>
                        <a href={`https://wa.me/55${lead.telefone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors" title="WhatsApp">
                          <Phone size={14} />
                        </a>
                        <button onClick={() => handleDelete(lead.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {lead.notas && <p className="text-xs text-gray-500 mt-2 pl-14">{lead.notas}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
