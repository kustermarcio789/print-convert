import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Package, Users, TrendingUp,
  Clock, CheckCircle, AlertCircle, BarChart3, Settings,
  LogOut, ExternalLink, Box, Truck, ClipboardList, Database,
  FileText, UserCheck, Factory, Search, Filter, Eye, Copy, Edit, Trash2,
  Printer, Wrench, Plus, X, Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { orcamentosAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface Orcamento {
  id: string;
  tipo: string;
  cliente: string;
  email: string;
  telefone: string;
  data: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  valor?: number;
  detalhes: any;
}

export default function AdminOrcamentos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para novo orçamento manual
  const [newOrcamento, setNewOrcamento] = useState({
    cliente: '',
    email: '',
    telefone: '',
    tipo: 'impressao',
    status: 'pendente',
    valor: '',
    descricao: ''
  });

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchOrcamentos = async () => {
    try {
      setLoading(true);
      const data = await orcamentosAPI.getAll();
      setOrcamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_permissions');
    navigate('/admin/login');
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orcamentoToSave = {
        ...newOrcamento,
        id: `MAN-${Math.floor(Math.random() * 10000)}`,
        data: new Date().toISOString(),
        valor: parseFloat(newOrcamento.valor) || 0,
        detalhes: { descricao: newOrcamento.descricao }
      };
      
      await orcamentosAPI.create(orcamentoToSave);
      toast({ title: "Sucesso", description: "Orçamento manual criado com sucesso!" });
      setIsModalOpen(false);
      fetchOrcamentos();
      setNewOrcamento({
        cliente: '',
        email: '',
        telefone: '',
        tipo: 'impressao',
        status: 'pendente',
        valor: '',
        descricao: ''
      });
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      toast({ title: "Erro", description: "Falha ao criar orçamento manual.", variant: "destructive" });
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', color: 'text-blue-600' },
    { id: 'orcamentos', label: 'Orçamentos', icon: ClipboardList, path: '/admin/orcamentos', color: 'text-orange-600' },
    { id: 'prestadores', label: 'Prestadores', icon: Truck, path: '/admin/prestadores', color: 'text-cyan-600' },
    { id: 'usuarios', label: 'Usuários', icon: Users, path: '/admin/usuarios', color: 'text-pink-600' },
    { id: 'produtos', label: 'Produtos', icon: Package, path: '/admin/produtos', color: 'text-green-600' },
    { id: 'vendas', label: 'Vendas', icon: TrendingUp, path: '/admin/vendas', color: 'text-emerald-600' },
    { id: 'estoque', label: 'Estoque', icon: Database, path: '/admin/estoque', color: 'text-purple-600' },
    { id: 'produtos-site', label: 'Produtos do Site', icon: ShoppingCart, path: '/admin/produtos-site', color: 'text-indigo-600' },
    { id: 'producao', label: 'Produção', icon: Box, path: '/admin/producao', color: 'text-yellow-600' },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3, path: '/admin/relatorios', color: 'text-slate-600' },
  ];

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'impressao': return Printer;
      case 'modelagem': return Box;
      case 'pintura': return Factory;
      case 'manutencao': return Wrench;
      default: return FileText;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Pendente</span>;
      case 'aprovado':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" /> Aprovado</span>;
      case 'recusado':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium"><AlertCircle className="w-3 h-3" /> Recusado</span>;
      default: return null;
    }
  };

  const filteredOrcamentos = orcamentos.filter((orc) => {
    const matchesSearch = 
      (orc.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orc.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orc.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || orc.tipo === filterTipo;
    const matchesStatus = filterStatus === 'todos' || orc.status === filterStatus;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-blue-600" />
            3DKPRINT Admin
          </h1>
        </div>
        <nav className="flex-1 mt-4 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${window.location.pathname === item.path ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className={item.color}><Icon size={20} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-800">Orçamentos</h2>
            <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
            </Button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar por cliente, email ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger><SelectValue placeholder="Tipo de Orçamento" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="impressao">Impressão 3D</SelectItem>
                    <SelectItem value="modelagem">Modelagem 3D</SelectItem>
                    <SelectItem value="pintura">Pintura</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista */}
          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="animate-pulse h-32"></Card>)}</div>
          ) : filteredOrcamentos.length > 0 ? (
            <div className="space-y-4">
              {filteredOrcamentos.map((orc) => {
                const TipoIcon = getTipoIcon(orc.tipo);
                return (
                  <Card key={orc.id}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg"><TipoIcon className="w-6 h-6 text-gray-600" /></div>
                        <div>
                          <h3 className="font-bold text-gray-900">{orc.cliente}</h3>
                          <p className="text-sm text-gray-500">{orc.email} · {orc.id}</p>
                          <div className="mt-2">{getStatusBadge(orc.status)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">R$ {(orc.valor || 0).toFixed(2).replace('.', ',')}</p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/orcamentos/${orc.id}`)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => orcamentosAPI.delete(orc.id).then(fetchOrcamentos)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum orçamento encontrado.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Novo Orçamento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900">Criar Orçamento Manual</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateManual} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Cliente</Label>
                    <Input required value={newOrcamento.cliente} onChange={e => setNewOrcamento({...newOrcamento, cliente: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input type="email" required value={newOrcamento.email} onChange={e => setNewOrcamento({...newOrcamento, email: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>WhatsApp/Telefone</Label>
                    <Input value={newOrcamento.telefone} onChange={e => setNewOrcamento({...newOrcamento, telefone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor do Orçamento (R$)</Label>
                    <Input type="number" step="0.01" required value={newOrcamento.valor} onChange={e => setNewOrcamento({...newOrcamento, valor: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Serviço</Label>
                    <Select value={newOrcamento.tipo} onValueChange={v => setNewOrcamento({...newOrcamento, tipo: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="impressao">Impressão 3D</SelectItem>
                        <SelectItem value="modelagem">Modelagem 3D</SelectItem>
                        <SelectItem value="pintura">Pintura</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status Inicial</Label>
                    <Select value={newOrcamento.status} onValueChange={v => setNewOrcamento({...newOrcamento, status: v as any})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição / Detalhes</Label>
                  <Textarea value={newOrcamento.descricao} onChange={e => setNewOrcamento({...newOrcamento, descricao: e.target.value})} placeholder="Descreva os detalhes do serviço..." />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 mr-2" /> Salvar Orçamento</Button>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
