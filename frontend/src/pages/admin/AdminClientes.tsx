import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, User, Building2, Mail, Phone, Loader2, X, Trash2, Edit,
  Users, FileText, TrendingUp, Save,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import EnderecoCorreios from '@/components/admin/orcamento/EnderecoCorreios';
import { clientesAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { novoClienteVazio, type Cliente, type TagCliente } from '@/types/cliente';

const TAGS: TagCliente[] = ['VIP', 'Recorrente', 'Prospect', 'Revendedor', 'Problema'];
const TAG_COLOR: Record<TagCliente, string> = {
  VIP: 'bg-amber-100 text-amber-700',
  Recorrente: 'bg-emerald-100 text-emerald-700',
  Prospect: 'bg-blue-100 text-blue-700',
  Revendedor: 'bg-purple-100 text-purple-700',
  Problema: 'bg-red-100 text-red-700',
};

function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function AdminClientes() {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filterAtivo, setFilterAtivo] = useState('todos');
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await clientesAPI.getAll();
      setClientes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    return clientes.filter(c => {
      if (filterAtivo === 'ativo' && !c.ativo) return false;
      if (filterAtivo === 'inativo' && c.ativo) return false;
      if (!busca) return true;
      const q = busca.toLowerCase();
      return (
        c.nome?.toLowerCase().includes(q) ||
        c.nome_fantasia?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.cpf_cnpj?.includes(q) ||
        c.whatsapp?.includes(q)
      );
    });
  }, [clientes, busca, filterAtivo]);

  const novaFicha = () => setEditando(novoClienteVazio('PF'));

  const fecharFicha = () => setEditando(null);

  const patch = <K extends keyof Cliente>(k: K, v: Cliente[K]) => {
    if (!editando) return;
    setEditando({ ...editando, [k]: v });
  };

  const toggleTag = (t: TagCliente) => {
    if (!editando) return;
    const tags = editando.tags || [];
    const next = tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t];
    patch('tags', next);
  };

  const salvar = async () => {
    if (!editando) return;
    if (!editando.nome.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editando.id) {
        await clientesAPI.update(editando.id, editando);
        toast({ title: 'Cliente atualizado' });
      } else {
        await clientesAPI.create(editando);
        toast({ title: 'Cliente cadastrado' });
      }
      fecharFicha();
      carregar();
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deletar = async (c: Cliente) => {
    if (!c.id) return;
    if (!confirm(`Excluir cliente "${c.nome}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await clientesAPI.delete(c.id);
      toast({ title: 'Cliente excluído' });
      carregar();
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
    }
  };

  const stats = useMemo(() => ({
    total: clientes.length,
    ativos: clientes.filter(c => c.ativo).length,
    pj: clientes.filter(c => c.tipo === 'PJ').length,
  }), [clientes]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Clientes" />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
              <p className="text-sm text-gray-500">
                {stats.total} total • {stats.ativos} ativos • {stats.pj} PJ
              </p>
            </div>
            <Button onClick={novaFicha} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> Novo Cliente
            </Button>
          </div>

          {/* Filtros */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome, e-mail, CPF/CNPJ, WhatsApp..."
                    className="pl-9"
                  />
                </div>
                <Select value={filterAtivo} onValueChange={setFilterAtivo}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Apenas ativos</SelectItem>
                    <SelectItem value="inativo">Apenas inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {clientes.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum resultado'}
                </h3>
                <p className="text-gray-500 mb-4">Comece cadastrando seu primeiro cliente.</p>
                <Button onClick={novaFicha} className="gap-2">
                  <Plus className="w-4 h-4" /> Novo Cliente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtrados.map((c) => {
                const Icon = c.tipo === 'PJ' ? Building2 : User;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={`hover:shadow-md transition cursor-pointer ${!c.ativo ? 'opacity-60' : ''}`}
                          onClick={() => setEditando(c)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-semibold text-gray-900 truncate text-sm">{c.nome}</p>
                              {c.tipo === 'PJ' && (
                                <Badge variant="outline" className="text-[10px] h-5">PJ</Badge>
                              )}
                              {!c.ativo && (
                                <Badge variant="secondary" className="text-[10px] h-5 bg-gray-200">Inativo</Badge>
                              )}
                            </div>
                            {c.nome_fantasia && (
                              <p className="text-xs text-gray-500 truncate">{c.nome_fantasia}</p>
                            )}
                            <div className="mt-1 space-y-0.5">
                              {c.email && (
                                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                  <Mail className="w-3 h-3 flex-shrink-0" /> {c.email}
                                </p>
                              )}
                              {c.whatsapp && (
                                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                  <Phone className="w-3 h-3 flex-shrink-0" /> {c.whatsapp}
                                </p>
                              )}
                            </div>
                            {c.tags && c.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {c.tags.map(t => (
                                  <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full ${TAG_COLOR[t]}`}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ficha de cadastro/edição */}
        <AnimatePresence>
          {editando && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={fecharFicha}
            >
              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.96 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {editando.tipo === 'PJ' ? <Building2 className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{editando.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                      <p className="text-xs text-gray-500">
                        {editando.id ? `ID: ${editando.id.slice(0, 8)}` : 'Preencha os dados abaixo'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editando.id && (
                      <Button variant="outline" size="sm" onClick={() => deletar(editando)} className="text-red-600 gap-1">
                        <Trash2 className="w-4 h-4" /> Excluir
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={fecharFicha}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Tipo */}
                  <div className="flex gap-2">
                    <Button type="button" variant={editando.tipo === 'PF' ? 'default' : 'outline'}
                            onClick={() => patch('tipo', 'PF')} size="sm">Pessoa Física</Button>
                    <Button type="button" variant={editando.tipo === 'PJ' ? 'default' : 'outline'}
                            onClick={() => patch('tipo', 'PJ')} size="sm">Pessoa Jurídica</Button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Ativo</span>
                      <Button type="button" variant={editando.ativo ? 'default' : 'outline'}
                              onClick={() => patch('ativo', !editando.ativo)} size="sm">
                        {editando.ativo ? 'Sim' : 'Não'}
                      </Button>
                    </div>
                  </div>

                  {/* Identificação */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">{editando.tipo === 'PJ' ? 'Razão social' : 'Nome completo'} *</Label>
                      <Input value={editando.nome} onChange={(e) => patch('nome', e.target.value)}
                             placeholder={editando.tipo === 'PJ' ? 'Empresa LTDA' : 'Nome e sobrenome'} className="mt-1" />
                    </div>
                    {editando.tipo === 'PJ' && (
                      <div>
                        <Label className="text-xs">Nome fantasia</Label>
                        <Input value={editando.nome_fantasia || ''}
                               onChange={(e) => patch('nome_fantasia', e.target.value)} className="mt-1" />
                      </div>
                    )}
                    <div>
                      <Label className="text-xs">{editando.tipo === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
                      <Input
                        value={editando.cpf_cnpj || ''}
                        onChange={(e) => patch('cpf_cnpj', editando.tipo === 'PJ' ? maskCNPJ(e.target.value) : maskCPF(e.target.value))}
                        placeholder={editando.tipo === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{editando.tipo === 'PJ' ? 'Inscrição Estadual' : 'RG'}</Label>
                      <Input value={editando.rg_ie || ''} onChange={(e) => patch('rg_ie', e.target.value)} className="mt-1" />
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">E-mail</Label>
                      <Input type="email" value={editando.email || ''}
                             onChange={(e) => patch('email', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">WhatsApp</Label>
                      <Input value={editando.whatsapp || ''}
                             onChange={(e) => patch('whatsapp', maskPhone(e.target.value))} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Telefone fixo</Label>
                      <Input value={editando.telefone || ''}
                             onChange={(e) => patch('telefone', maskPhone(e.target.value))} className="mt-1" />
                    </div>
                  </div>

                  {/* Endereço */}
                  <EnderecoCorreios
                    endereco={editando.endereco}
                    envio={{}}
                    onChangeEndereco={(e) => patch('endereco', e)}
                    onChangeEnvio={() => { /* ignorado */ }}
                  />

                  {/* Tags */}
                  <div>
                    <Label className="text-xs mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map(t => {
                        const ativo = (editando.tags || []).includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTag(t)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                              ativo ? TAG_COLOR[t] : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <Label className="text-xs">Observações</Label>
                    <textarea
                      value={editando.observacoes || ''}
                      onChange={(e) => patch('observacoes', e.target.value)}
                      rows={3}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      placeholder="Notas internas: preferências, histórico, condições especiais..."
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={fecharFicha}>Cancelar</Button>
                  <Button onClick={salvar} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {editando.id ? 'Salvar alterações' : 'Cadastrar cliente'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
