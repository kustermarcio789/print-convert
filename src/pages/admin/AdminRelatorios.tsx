import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Package, Users, TrendingUp,
  Clock, CheckCircle, AlertCircle, BarChart3, Settings,
  LogOut, ExternalLink, Box, Truck, Database,
  FileText, UserCheck, Factory, ShoppingCart, Download, Filter, PieChart, LineChart, ArrowUp, ArrowDown, DollarSign
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
import { relatoriosAPI } from '@/lib/apiClient'; // Supondo que você tenha uma API para relatórios

interface RelatorioData {
  totalVendas: number;
  totalOrcamentos: number;
  totalProducao: number;
  vendasPorMes: { mes: string; valor: number }[];
  statusOrcamentos: { status: string; count: number }[];
}

export default function AdminRelatorios() {
  const navigate = useNavigate();
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mensal'); // 'mensal', 'trimestral', 'anual'

  useEffect(() => {
    const fetchRelatorios = async () => {
      try {
        setLoading(true);
        const data = await relatoriosAPI.getSummary(periodo); // Buscar dados de relatório
        setRelatorio(data);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRelatorios();
  }, [periodo]);

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
            <h2 className="text-lg font-semibold text-gray-800">Relatórios</h2>
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
                <h1 className="text-2xl font-bold text-gray-900">Relatórios Gerenciais</h1>
                <div className="flex gap-3">
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecionar Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-32"></Card>
              ))}
            </div>
          ) : relatorio ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {relatorio.totalVendas.toFixed(2).replace('.', ',')}</div>
                  <p className="text-xs text-muted-foreground">No período selecionado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{relatorio.totalOrcamentos}</div>
                  <p className="text-xs text-muted-foreground">No período selecionado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Produção</CardTitle>
                  <Factory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{relatorio.totalProducao}</div>
                  <p className="text-xs text-muted-foreground">Itens produzidos</p>
                </CardContent>
              </Card>

              {/* Gráfico de Vendas por Mês (Exemplo) */}
              {relatorio.vendasPorMes && relatorio.vendasPorMes.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Vendas por Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Aqui você integraria um componente de gráfico, como Recharts ou Chart.js */}
                    <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border border-dashed text-gray-500">
                      <LineChart className="mr-2 h-4 w-4" /> Gráfico de Linhas (Implementar)
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gráfico de Status de Orçamentos (Exemplo) */}
              {relatorio.statusOrcamentos && relatorio.statusOrcamentos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Status dos Orçamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Aqui você integraria um componente de gráfico de pizza */}
                    <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border border-dashed text-gray-500">
                      <PieChart className="mr-2 h-4 w-4" /> Gráfico de Pizza (Implementar)
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum dado de relatório encontrado para o período selecionado.</p>
              <Button variant="link" onClick={() => setPeriodo('mensal')} className="mt-2 text-blue-600">
                Tentar novamente com período mensal
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
