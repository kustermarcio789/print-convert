import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Factory, Mail, Phone, Loader2, X, Trash2, Globe,
  Truck, Save, Package,
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
import { fornecedoresAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import {
  novoFornecedorVazio,
  CATEGORIAS_FORNECEDOR_LABEL,
  CONDICOES_PAGAMENTO_LABEL,
  type Fornecedor,
  type CategoriaFornecedor,
  type CondicaoPagamento,
} from '@/types/fornecedor';

function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const CATEGORIA_COLOR: Record<CategoriaFornecedor, string> = {
  filamento:   'bg-blue-100 text-blue-700',
  resina:      'bg-purple-100 text-purple-700',
  peca:        'bg-cyan-100 text-cyan-700',
  equipamento: 'bg-orange-100 text-orange-700',
  pintura:     'bg-pink-100 text-pink-700',
  servico:     'bg-emerald-100 text-emerald-700',
  embalagem:   'bg-yellow-100 text-yellow-700',
  outro:       'bg-gray-100 text-gray-700',
};

export default function AdminFornecedores() {
  const { toast } = useToast();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('todos');
  const [filterAtivo, setFilterAtivo] = useState('todos');
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [saving, setSaving] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await fornecedoresAPI.getAll();
      setFornecedores(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    return fornecedores.filter(f => {
      if (filterCategoria !== 'todos' && f.categoria !== filterCategoria) return false;
      if (filterAtivo === 'ativo' && !f.ativo) return false;
      if (filterAtivo === 'inativo' && f.ativo) return false;
      if (!busca) return true;
      const q = busca.toLowerCase();
      return (
        f.razao_social?.toLowerCase().includes(q) ||
        f.nome_fantasia?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.cpf_cnpj?.includes(q)
      );
    });
  }, [fornecedores, busca, filterCategoria, filterAtivo]);

  const novaFicha = () => setEditando(novoFornecedorVazio());
  const fechar = () => setEditando(null);
  const patch = <K extends keyof Fornecedor>(k: K, v: Fornecedor[K]) => {
    if (!editando) return;
    setEditando({ ...editando, [k]: v });
  };

  const salvar = async () => {
    if (!editando) return;
    if (!editando.razao_social.trim()) {
      toast({ title: 'Razão social obrigatória', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editando.id) {
        await fornecedoresAPI.update(editando.id, editando);
        toast({ title: 'Fornecedor atualizado' });
      } else {
        await fornecedoresAPI.create(editando);
        toast({ title: 'Fornecedor cadastrado' });
      }
      fechar();
      carregar();
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deletar = async (f: Fornecedor) => {
    if (!f.id) return;
    if (!confirm(`Excluir fornecedor "${f.razao_social}"?`)) return;
    try {
      await fornecedoresAPI.delete(f.id);
      toast({ title: 'Fornecedor excluído' });
      carregar();
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
    }
  };

  const stats = useMemo(() => ({
    total: fornecedores.length,
    ativos: fornecedores.filter(f => f.ativo).length,
    porCategoria: fornecedores.reduce((acc: Record<string, number>, f) => {
      acc[f.categoria] = (acc[f.categoria] || 0) + 1;
      return acc;
    }, {}),
  }), [fornecedores]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Fornecedores" />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
              <p className="text-sm text-gray-500">
                {stats.total} total • {stats.ativos} ativos
              </p>
            </div>
            <Button onClick={novaFicha} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> Novo Fornecedor
            </Button>
          </div>

          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por razão social, nome fantasia, e-mail, CNPJ..."
                    className="pl-9"
                  />
                </div>
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas categorias</SelectItem>
                    {Object.entries(CATEGORIAS_FORNECEDOR_LABEL).map(([k, label]) => (
                      <SelectItem key={k} value={k}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterAtivo} onValueChange={setFilterAtivo}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Factory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {fornecedores.length === 0 ? 'Nenhum fornecedor cadastrado' : 'Nenhum resultado'}
                </h3>
                <Button onClick={novaFicha} className="gap-2"><Plus className="w-4 h-4" /> Novo Fornecedor</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtrados.map((f) => (
                <motion.div key={f.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`hover:shadow-md transition cursor-pointer ${!f.ativo ? 'opacity-60' : ''}`}
                        onClick={() => setEditando(f)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Factory className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-gray-900 truncate text-sm">
                              {f.nome_fantasia || f.razao_social}
                            </p>
                            {!f.ativo && (
                              <Badge variant="secondary" className="text-[10px] h-5 bg-gray-200">Inativo</Badge>
                            )}
                          </div>
                          {f.nome_fantasia && (
                            <p className="text-xs text-gray-400 truncate">{f.razao_social}</p>
                          )}
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${CATEGORIA_COLOR[f.categoria]}`}>
                            {CATEGORIAS_FORNECEDOR_LABEL[f.categoria]}
                          </span>
                          <div className="mt-2 space-y-0.5">
                            {f.contato_nome && (
                              <p className="text-xs text-gray-500 truncate">👤 {f.contato_nome}</p>
                            )}
                            {f.email && (
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {f.email}
                              </p>
                            )}
                            {f.whatsapp && (
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {f.whatsapp}
                              </p>
                            )}
                            {f.condicao_pagamento && (
                              <p className="text-xs text-gray-500">💳 {CONDICOES_PAGAMENTO_LABEL[f.condicao_pagamento]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Ficha */}
        <AnimatePresence>
          {editando && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={fechar}
            >
              <motion.div
                initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Factory className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        {editando.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {editando.id ? `ID: ${editando.id.slice(0, 8)}` : 'Dados do fornecedor / parceiro comercial'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editando.id && (
                      <Button variant="outline" size="sm" onClick={() => deletar(editando)} className="text-red-600 gap-1">
                        <Trash2 className="w-4 h-4" /> Excluir
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={fechar}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Tipo + Ativo */}
                  <div className="flex gap-2 items-center">
                    <Button type="button" variant={editando.tipo === 'PJ' ? 'default' : 'outline'}
                            onClick={() => patch('tipo', 'PJ')} size="sm">Pessoa Jurídica</Button>
                    <Button type="button" variant={editando.tipo === 'PF' ? 'default' : 'outline'}
                            onClick={() => patch('tipo', 'PF')} size="sm">Pessoa Física</Button>
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
                      <Label className="text-xs">Razão social *</Label>
                      <Input value={editando.razao_social}
                             onChange={(e) => patch('razao_social', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Nome fantasia</Label>
                      <Input value={editando.nome_fantasia || ''}
                             onChange={(e) => patch('nome_fantasia', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">{editando.tipo === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
                      <Input
                        value={editando.cpf_cnpj || ''}
                        onChange={(e) => patch('cpf_cnpj', editando.tipo === 'PJ' ? maskCNPJ(e.target.value) : maskCPF(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Inscrição Estadual</Label>
                      <Input value={editando.inscricao_estadual || ''}
                             onChange={(e) => patch('inscricao_estadual', e.target.value)} className="mt-1" />
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Nome do contato</Label>
                      <Input value={editando.contato_nome || ''}
                             onChange={(e) => patch('contato_nome', e.target.value)}
                             placeholder="Ex: João da Silva" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Cargo</Label>
                      <Input value={editando.contato_cargo || ''}
                             onChange={(e) => patch('contato_cargo', e.target.value)}
                             placeholder="Ex: Vendedor, Gerente" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">E-mail</Label>
                      <Input type="email" value={editando.email || ''}
                             onChange={(e) => patch('email', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Site</Label>
                      <Input value={editando.site || ''}
                             onChange={(e) => patch('site', e.target.value)}
                             placeholder="https://..." className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">WhatsApp</Label>
                      <Input value={editando.whatsapp || ''}
                             onChange={(e) => patch('whatsapp', maskPhone(e.target.value))} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Telefone</Label>
                      <Input value={editando.telefone || ''}
                             onChange={(e) => patch('telefone', maskPhone(e.target.value))} className="mt-1" />
                    </div>
                  </div>

                  {/* Categoria + pagamento */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Categoria *</Label>
                      <Select value={editando.categoria}
                              onValueChange={(v) => patch('categoria', v as CategoriaFornecedor)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORIAS_FORNECEDOR_LABEL).map(([k, label]) => (
                            <SelectItem key={k} value={k}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Condição de pagamento</Label>
                      <Select value={editando.condicao_pagamento || ''}
                              onValueChange={(v) => patch('condicao_pagamento', v as CondicaoPagamento)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(CONDICOES_PAGAMENTO_LABEL).map(([k, label]) => (
                            <SelectItem key={k} value={k}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Prazo de entrega padrão (dias)</Label>
                      <Input type="number" value={editando.prazo_entrega_padrao_dias ?? ''}
                             onChange={(e) => patch('prazo_entrega_padrao_dias', e.target.value ? parseInt(e.target.value) : undefined)}
                             className="mt-1" />
                    </div>
                  </div>

                  {/* Endereço */}
                  <EnderecoCorreios
                    endereco={editando.endereco}
                    envio={{}}
                    onChangeEndereco={(e) => patch('endereco', e)}
                    onChangeEnvio={() => { /* ignorado */ }}
                  />

                  {/* Observações */}
                  <div>
                    <Label className="text-xs">Observações</Label>
                    <textarea
                      value={editando.observacoes || ''}
                      onChange={(e) => patch('observacoes', e.target.value)}
                      rows={3}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      placeholder="Produtos principais, histórico de compras, condições especiais..."
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={fechar}>Cancelar</Button>
                  <Button onClick={salvar} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {editando.id ? 'Salvar alterações' : 'Cadastrar fornecedor'}
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
