import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Package, Users, TrendingUp,
  Clock, CheckCircle, AlertCircle, BarChart3, Settings,
  LogOut, ExternalLink, Box, Truck, ClipboardList, Database,
  FileText, UserCheck, Factory, Search, Filter, Eye, Copy, Edit, Trash2,
  Printer, Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { orcamentosAPI } from '@/lib/apiClient'; // Supondo que você tenha uma API para orçamentos

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
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    const fetchOrcamentos = async () => {
      try {
        setLoading(true);
        const data = await orcamentosAPI.getAll(); // Buscar todos os orçamentos
        setOrcamentos(data);
      } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrcamentos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
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

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'impressao': return 'Impressão 3D';
      case 'modelagem': return 'Modelagem 3D';
      case 'pintura': return 'Pintura';
      case 'manutencao': return 'Manutenção';
      default: return tipo;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </span>
        );
      case 'recusado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Recusado
          </span>
        );
      default:
        return null;
    }
  };

  const filteredOrcamentos = orcamentos.filter((orc) => {
    const matchesSearch = 
      orc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === 'todos' || orc.tipo === filterTipo;
    const matchesStatus = filterStatus === 'todos' || orc.status === filterStatus;

    return matchesSearch && matchesTipo && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, newStatus: 'aprovado' | 'recusado') => {
    try {
      await orcamentosAPI.updateStatus(id, newStatus);
      setOrcamentos(prev => prev.map(orc => orc.id === id ? { ...orc, status: newStatus } : orc));
    } catch (error) {
      console.error(`Erro ao atualizar status do orçamento ${id}:`, error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await orcamentosAPI.delete(id);
        setOrcamentos(prev => prev.filter(orc => orc.id !== id));
      } catch (error) {
        console.error(`Erro ao excluir orçamento ${id}:`, error);
      }
    }
  };

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
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  window.location.pathname === item.path 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={item.color}><Icon size={20} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-800">Orçamentos</h2>
            <div className="flex items-center gap-4">
              <Link to="/" target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Ver Site <ExternalLink size={14} />
              </Link>
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Orçamentos</h1>
            <p className="text-gray-600">Visualize e gerencie todos os orçamentos do sistema.</p>
          </motion.div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente, email ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Orçamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="impressao">Impressão 3D</SelectItem>
                    <SelectItem value="modelagem">Modelagem 3D</SelectItem>
                    <SelectItem value="pintura">Pintura</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
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

          {/* Lista de Orçamentos */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-48"></Card>
              ))}
            </div>
          ) : filteredOrcamentos.length > 0 ? (
            <div className="space-y-4">
              {filteredOrcamentos.map((orc, index) => {
                const TipoIcon = getTipoIcon(orc.tipo);
                return (
                  <motion.div
                    key={orc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <TipoIcon className="w-6 h-6 text-blue-600" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{orc.id}</h3>
                                {getStatusBadge(orc.status)}
                              </div>

                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Tipo:</span>{' '}
                                {getTipoLabel(orc.tipo)}
                              </p>

                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Cliente:</span> {orc.cliente}
                              </p>

                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Email:</span> {orc.email}
                              </p>

                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Telefone:</span> {orc.telefone}
                              </p>

                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Data:</span>{' '}
                                {new Date(orc.data).toLocaleDateString('pt-BR')}
                              </p>

                              {orc.valor && (
                                <p className="text-sm font-semibold text-green-600 mt-2">
                                  Valor: R$ {Number(orc.valor).toFixed(2).replace('.', ',')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/orcamentos/${orc.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver
                            </Button>

                            {orc.status === 'pendente' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleUpdateStatus(orc.id, 'aprovado')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aprovar
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleUpdateStatus(orc.id, 'recusado')}
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Recusar
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(orc.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum orçamento encontrado com os filtros selecionados.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setFilterTipo('todos'); setFilterStatus('todos'); }} className="mt-2 text-blue-600">
                Limpar todos os filtros
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
