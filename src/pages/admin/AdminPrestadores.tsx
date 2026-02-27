import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Package, Users, TrendingUp,
  Clock, CheckCircle, AlertCircle, BarChart3, Settings,
  LogOut, ExternalLink, Box, Truck, Database,
  FileText, UserCheck, Factory, Search, Filter, Eye, Copy, Edit, Trash2, Mail, Phone, MapPin, Star
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
import { prestadoresAPI } from '@/lib/apiClient'; // Supondo que você tenha uma API para prestadores

interface Prestador {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  servicos: string[];
  experiencia: string;
  portfolio?: string;
  data_cadastro: string; // Alterado para data_cadastro para consistência com Supabase
  status: 'pendente' | 'aprovado' | 'recusado';
  avaliacao?: number;
}

export default function AdminPrestadores() {
  const navigate = useNavigate();
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    const fetchPrestadores = async () => {
      try {
        setLoading(true);
        const data = await prestadoresAPI.getAll(); // Buscar todos os prestadores
        setPrestadores(data);
      } catch (error) {
        console.error('Erro ao carregar prestadores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrestadores();
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

  const filteredPrestadores = prestadores.filter((prest) => {
    const matchesSearch =
      prest.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prest.apelido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prest.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || prest.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, newStatus: 'aprovado' | 'recusado') => {
    try {
      await prestadoresAPI.updateStatus(id, newStatus);
      setPrestadores(prev => prev.map(prest => prest.id === id ? { ...prest, status: newStatus } : prest));
    } catch (error) {
      console.error(`Erro ao atualizar status do prestador ${id}:`, error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este prestador?')) {
      try {
        await prestadoresAPI.delete(id);
        setPrestadores(prev => prev.filter(prest => prest.id !== id));
      } catch (error) {
        console.error(`Erro ao excluir prestador ${id}:`, error);
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
            <h2 className="text-lg font-semibold text-gray-800">Prestadores</h2>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Prestadores</h1>
            <p className="text-gray-600">Visualize e gerencie todos os prestadores de serviço cadastrados.</p>
          </motion.div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, apelido, email ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

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

          {/* Lista de Prestadores */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-48"></Card>
              ))}
            </div>
          ) : filteredPrestadores.length > 0 ? (
            <div className="space-y-4">
              {filteredPrestadores.map((prest, index) => (
                <motion.div
                  key={prest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-8 h-8 text-blue-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{prest.nome}</h3>
                              {getStatusBadge(prest.status)}
                            </div>

                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Apelido:</span> @{prest.apelido}
                            </p>

                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {prest.email}
                            </p>

                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {prest.telefone}
                            </p>

                            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {prest.cidade} - {prest.estado}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-2">
                              {prest.servicos.map((servico) => (
                                <span
                                  key={servico}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {servico}
                                </span>
                              ))}
                            </div>

                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Experiência:</span>{' '}
                              {prest.experiencia}
                            </p>

                            {prest.avaliacao && (
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span className="font-medium">{Number(prest.avaliacao).toFixed(1)}</span>
                              </p>
                            )}

                            <p className="text-xs text-gray-500 mt-2">
                              Cadastrado em:{' '}
                              {new Date(prest.data_cadastro).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/prestadores/${prest.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>

                          {prest.status === 'pendente' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleUpdateStatus(prest.id, 'aprovado')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprovar
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleUpdateStatus(prest.id, 'recusado')}
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
                            onClick={() => handleDelete(prest.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum prestador encontrado com os filtros selecionados.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setFilterStatus('todos'); }} className="mt-2 text-blue-600">
                Limpar todos os filtros
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
