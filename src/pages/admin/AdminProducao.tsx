import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, Package, Users, TrendingUp,
  Clock, CheckCircle, AlertCircle, BarChart3, Settings,
  LogOut, ExternalLink, Box, Truck, Database,
  FileText, UserCheck, Factory, ShoppingCart, Search, Filter as FilterIcon, Plus, Eye, Trash2, AlertTriangle,
  Edit
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
import { producaoAPI } from '@/lib/apiClient'; // Supondo que você tenha uma API para produção

interface ProducaoRecord {
  id: string;
  nome_peca: string; // Alterado para nome_peca
  material_usado: string; // Alterado para material_usado
  quantidade_produzida: number; // Alterado para quantidade_produzida
  data_producao: string; // Alterado para data_producao
  status: 'pendente' | 'em_producao' | 'concluida' | 'cancelada';
}

export default function AdminProducao() {
  const navigate = useNavigate();
  const [producoes, setProducoes] = useState<ProducaoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    const fetchProducoes = async () => {
      try {
        setLoading(true);
        const data = await producaoAPI.getAll(); // Buscar todos os registros de produção
        setProducoes(data);
      } catch (error) {
        console.error('Erro ao carregar produções:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducoes();
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
      case 'em_producao':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-medium">
            <Factory className="w-3 h-3" />
            Em Produção
          </span>
        );
      case 'concluida':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Concluída
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  const filteredProducoes = producoes.filter((producao) => {
    const matchesSearch =
      producao.nome_peca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producao.material_usado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producao.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || producao.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de produção?')) {
      try {
        await producaoAPI.delete(id);
        setProducoes(prev => prev.filter(producao => producao.id !== id));
      } catch (error) {
        console.error(`Erro ao excluir produção ${id}:`, error);
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
            <h2 className="text-lg font-semibold text-gray-800">Produção</h2>
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
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por peça, material ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_producao">Em Produção</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => navigate('/admin/producao/novo')} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Registro
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-48"></Card>
              ))}
            </div>
          ) : filteredProducoes.length > 0 ? (
            <div className="space-y-4">
              {filteredProducoes.map((producao, index) => (
                <div
                  key={producao.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-yellow-100 rounded-lg">
                            <Factory className="w-6 h-6 text-yellow-600" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{producao.nome_peca}</h3>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Material:</span> {producao.material_usado}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Quantidade:</span> {producao.quantidade_produzida}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Data:</span> {new Date(producao.data_producao).toLocaleDateString('pt-BR')}
                            </p>
                            <div className="mt-2">
                              {getStatusBadge(producao.status)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/producao/${producao.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/producao/${producao.id}/editar`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(producao.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <Factory className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum registro de produção encontrado com os filtros selecionados.</p>
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
