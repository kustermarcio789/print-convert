import { useState, useEffect } from 'react';
import { UserCog, Plus, Trash2, Save, X, Shield, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/admin/Sidebar';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: 'admin_master' | 'supervisor' | 'operador';
  ativo: boolean;
  dataCriacao: string;
  permissoes: Record<string, { ver: boolean; criar: boolean; editar: boolean; excluir: boolean }>;
}

const CARGOS = [
  { value: 'admin_master', label: 'Admin Master', cor: 'text-amber-400', bg: 'bg-amber-500/20' },
  { value: 'supervisor', label: 'Supervisor', cor: 'text-blue-400', bg: 'bg-blue-500/20' },
  { value: 'operador', label: 'Operador', cor: 'text-gray-400', bg: 'bg-gray-500/20' },
];

const MODULOS = ['Dashboard', 'Produtos', 'Orçamentos', 'Vendas', 'Estoque', 'Produção', 'Impressoras', 'Portfólio', 'Leads', 'Usuários', 'Relatórios', 'Auditoria'];

const defaultPerms = (cargo: string) => {
  const p: Record<string, { ver: boolean; criar: boolean; editar: boolean; excluir: boolean }> = {};
  MODULOS.forEach(m => {
    if (cargo === 'admin_master') p[m] = { ver: true, criar: true, editar: true, excluir: true };
    else if (cargo === 'supervisor') p[m] = { ver: true, criar: true, editar: true, excluir: false };
    else p[m] = { ver: true, criar: false, editar: false, excluir: false };
  });
  return p;
};

export default function AdminGerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newUser, setNewUser] = useState({ nome: '', email: '', senha: '', cargo: 'operador' as const });

  useEffect(() => {
    const saved = localStorage.getItem('admin_usuarios_sistema');
    if (saved) setUsuarios(JSON.parse(saved));
  }, []);

  const salvar = (data: Usuario[]) => { setUsuarios(data); localStorage.setItem('admin_usuarios_sistema', JSON.stringify(data)); };

  const handleAdd = () => {
    if (!newUser.nome || !newUser.email) { alert('Nome e email são obrigatórios'); return; }
    if (newUser.senha && newUser.senha.length < 8) { alert('Senha deve ter no mínimo 8 caracteres'); return; }
    const user: Usuario = {
      id: `usr_${Date.now()}`, nome: newUser.nome, email: newUser.email,
      cargo: newUser.cargo, ativo: true, dataCriacao: new Date().toISOString(),
      permissoes: defaultPerms(newUser.cargo),
    };
    salvar([...usuarios, user]);
    setNewUser({ nome: '', email: '', senha: '', cargo: 'operador' });
    setShowAdd(false);
    const logs = JSON.parse(localStorage.getItem('admin_audit_logs') || '[]');
    logs.unshift({ data: new Date().toISOString(), acao: 'Criou usuário', executadoPor: 'Admin', alvo: user.nome, detalhes: `Cargo: ${user.cargo}` });
    localStorage.setItem('admin_audit_logs', JSON.stringify(logs));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Excluir este usuário?')) return;
    const user = usuarios.find(u => u.id === id);
    salvar(usuarios.filter(u => u.id !== id));
    const logs = JSON.parse(localStorage.getItem('admin_audit_logs') || '[]');
    logs.unshift({ data: new Date().toISOString(), acao: 'Excluiu usuário', executadoPor: 'Admin', alvo: user?.nome || id, detalhes: '' });
    localStorage.setItem('admin_audit_logs', JSON.stringify(logs));
  };

  const togglePerm = (userId: string, modulo: string, perm: 'ver' | 'criar' | 'editar' | 'excluir') => {
    salvar(usuarios.map(u => {
      if (u.id !== userId) return u;
      const perms = { ...u.permissoes };
      if (!perms[modulo]) perms[modulo] = { ver: false, criar: false, editar: false, excluir: false };
      perms[modulo] = { ...perms[modulo], [perm]: !perms[modulo][perm] };
      return { ...u, permissoes: perms };
    }));
  };

  const handleCargoChange = (userId: string, cargo: Usuario['cargo']) => {
    salvar(usuarios.map(u => u.id === userId ? { ...u, cargo, permissoes: defaultPerms(cargo) } : u));
  };

  const filtered = usuarios.filter(u => !search || u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-[#161923] border-b border-white/10 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><UserCog className="text-indigo-400" size={22} />Gerenciar Usuários</h2>
              <p className="text-sm text-gray-400 mt-1">Controle de acesso e permissões do sistema</p>
            </div>
            <Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4 mr-2" />Novo Usuário</Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 bg-[#161923] px-3 py-1.5 rounded-lg border border-white/10">{usuarios.length} usuário(s)</span>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 bg-[#161923] border border-white/10 rounded-lg text-white text-sm" />
            </div>
          </div>

          {showAdd && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-[#1a1d2e] rounded-xl border border-white/10 p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Novo Usuário</h3>
                  <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Nome completo</label>
                    <input value={newUser.nome} onChange={e => setNewUser({ ...newUser, nome: e.target.value })} placeholder="João Silva"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">E-mail</label>
                    <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="joao@exemplo.com"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Senha (mín. 8 caracteres)</label>
                    <input type="password" value={newUser.senha} onChange={e => setNewUser({ ...newUser, senha: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Cargo</label>
                    <select value={newUser.cargo} onChange={e => setNewUser({ ...newUser, cargo: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm [&>option]:bg-slate-800">
                      <option value="admin_master">Admin Master</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="operador">Operador</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button onClick={() => setShowAdd(false)} variant="ghost" className="text-gray-400">Cancelar</Button>
                  <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">Criar Usuário</Button>
                </div>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-[#161923] rounded-xl border border-white/10">
              <UserCog className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">Nenhum usuário do sistema cadastrado.</p>
              <p className="text-sm text-gray-500 mt-1">Clique em "Novo Usuário" para adicionar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(user => {
                const cargoInfo = CARGOS.find(c => c.value === user.cargo) || CARGOS[2];
                const isExpanded = expandedId === user.id;
                return (
                  <div key={user.id} className="bg-[#161923] rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{user.nome}</h4>
                          <p className="text-xs text-gray-400">{user.email} | Criado em {new Date(user.dataCriacao).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select value={user.cargo} onChange={e => handleCargoChange(user.id, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${cargoInfo.bg} ${cargoInfo.cor} border-0 [&>option]:bg-slate-800 [&>option]:text-white`}>
                          <option value="admin_master">Admin Master</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="operador">Operador</option>
                        </select>
                        <button onClick={() => setExpandedId(isExpanded ? null : user.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <button onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1"><Shield size={12} />Permissões por Módulo</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-gray-500 text-xs">
                                <th className="text-left py-1 px-2">Módulo</th>
                                <th className="text-center py-1 px-2">Ver</th>
                                <th className="text-center py-1 px-2">Criar</th>
                                <th className="text-center py-1 px-2">Editar</th>
                                <th className="text-center py-1 px-2">Excluir</th>
                              </tr>
                            </thead>
                            <tbody>
                              {MODULOS.map(mod => {
                                const perms = user.permissoes?.[mod] || { ver: false, criar: false, editar: false, excluir: false };
                                return (
                                  <tr key={mod} className="border-t border-white/5">
                                    <td className="py-1.5 px-2 text-gray-300">{mod}</td>
                                    {(['ver', 'criar', 'editar', 'excluir'] as const).map(p => (
                                      <td key={p} className="text-center py-1.5 px-2">
                                        <input type="checkbox" checked={perms[p]} onChange={() => togglePerm(user.id, mod, p)}
                                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500" />
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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
