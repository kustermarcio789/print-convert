import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Package, Users, TrendingUp,
  Clock, CheckCircle, AlertCircle, BarChart3, Settings,
  LogOut, ExternalLink, Box, Truck, Database,
  FileText, UserCheck, Factory, Search, Filter, Eye, Copy, Edit, Trash2, Plus
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
import { produtosAPI } from '@/lib/apiClient'; // Supondo que você tenha uma API para produtos

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  created_at: string;
}

export default function AdminProdutos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        const data = await produtosAPI.getAll(); // Buscar todos os produtos
        setProdutos(data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
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

  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'todos' || produto.categoria === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await produtosAPI.delete(id);
        setProdutos(prev => prev.filter(produto => produto.id !== id));
      } catch (error) {
        console.error(`Erro ao excluir produto ${id}:`, error);
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
            <h2 className="text-lg font-semibold text-gray-800">Produtos</h2>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Produtos</h1>
            <p className="text-gray-600">Visualize e gerencie todos os produtos internos.</p>
          </motion.div>

          {/* Filtros e Ações */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Categorias</SelectItem>
                    <SelectItem value="Filamento">Filamento</SelectItem>
                    <SelectItem value="Resina">Resina</SelectItem>
                    <SelectItem value="Peças">Peças</SelectItem>
                    <SelectItem value="Impressora">Impressora</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => navigate('/admin/produtos/novo')} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Produtos */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-48"></Card>
              ))}
            </div>
          ) : filteredProdutos.length > 0 ? (
            <div className="space-y-4">
              {filteredProdutos.map((produto, index) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <Package className="w-6 h-6 text-green-600" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{produto.nome}</h3>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Categoria:</span> {produto.categoria}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Preço:</span> R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Estoque:</span> {produto.estoque}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Cadastrado em: {new Date(produto.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/produtos/${produto.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/produtos/${produto.id}/editar`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(produto.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum produto encontrado com os filtros selecionados.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setFilterCategory('todos'); }} className="mt-2 text-blue-600">
                Limpar todos os filtros
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
