import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Package, Users, TrendingUp,
  Clock, CheckCircle, AlertCircle, BarChart3, Settings,
  LogOut, ExternalLink, Box, Truck, Database,
  FileText, UserCheck, Factory, ShoppingCart, Mail, Globe, Eye, ArrowUp, ArrowDown, DollarSign,
  Calendar, Tag, ListOrdered, Receipt, TrendingDown, RefreshCcw, XCircle, CheckCircle2, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  orcamentosAPI, vendasAPI, produtosAPI, usuariosAPI, prestadoresAPI, estoqueAPI, producaoAPI, relatoriosAPI,
  leadsAPI, trafficAPI
} from '@/lib/apiClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface TrafficSource {
  source: string;
  visits: number;
}

interface PageVisit {
  page: string;
  visits: number;
}

interface GeoData {
  state: string;
  visits: number;
}

interface CityData {
  city: string;
  visits: number;
}

interface StockByBrand {
  brand: string;
  value: number;
}

interface ProductStock {
  id: string;
  name: string;
  brand: string;
  quantidade: number;
  preco_compra: number;
}

interface Order {
  id: string;
  cliente: string;
  status: string;
  valor_total: number;
  data: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrcamentos: 0,
    orcamentosPendentes: 0,
    totalVendas: 0,
    totalProdutos: 0,
    totalUsuarios: 0,
    totalPrestadores: 0,
    itensEstoqueBaixo: 0,
    producoesAtivas: 0,
    leadsCapturados: 0,
    leadsPendentes: 0,
    leadsEnviados: 0,
    leadsEntregues: 0,
    leadsCancelados: 0,
    visitantesOnline: 0,
    visitantesHoje: 0,
    visitantesSeteDias: 0,
    visitantesMes: 0,
    valorEstoqueTotal: 0,
    produtosAtivosEstoque: 0,
    unidadesEmEstoque: 0,
    condicaoNovas: 0,
    condicaoUsadas: 0,
    receitaTotal: 0,
    receitaSite: 0,
    receitaExterna: 0,
    pedidosSite: 0,
    pedidosPendentesSite: 0,
    vendasExternas: 0,
    lucroVendasExternas: 0,
  });
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [topPages, setTopPages] = useState<PageVisit[]>([]);
  const [geoStates, setGeoStates] = useState<GeoData[]>([]);
  const [geoCities, setGeoCities] = useState<CityData[]>([]);
  const [stockByBrand, setStockByBrand] = useState<StockByBrand[]>([]);
  const [hourlyVisits, setHourlyVisits] = useState<{ hour: string; visits: number }[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; site: number; external: number }[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductStock[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: number }[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<{ name: string; value: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [orcamentos, vendas, produtos, usuarios, prestadores, estoque, producao, leads, traffic] = await Promise.all([
          orcamentosAPI.getAll(),
          vendasAPI.getAll(),
          produtosAPI.getAll(),
          usuariosAPI.getAll(),
          prestadoresAPI.getAll(),
          estoqueAPI.getAll(),
          producaoAPI.getAll(),
          leadsAPI.getAll(),
          trafficAPI.getDashboardStats(),
        ]);

        // Processar dados de estoque para as novas métricas
        const valorEstoqueTotal = estoque.reduce((sum: number, item: any) => sum + (item.preco_compra * item.quantidade), 0);
        const produtosAtivosEstoque = estoque.length;
        const unidadesEmEstoque = estoque.reduce((sum: number, item: any) => sum + item.quantidade, 0);
        const condicaoNovas = estoque.filter((item: any) => item.condicao === 'novo').length;
        const condicaoUsadas = estoque.filter((item: any) => item.condicao === 'usado').length;

        const stockByBrandMap = estoque.reduce((acc: { [key: string]: number }, item: any) => {
          acc[item.brand] = (acc[item.brand] || 0) + (item.preco_compra * item.quantidade);
          return acc;
        }, {});
        const stockByBrandArray = Object.keys(stockByBrandMap).map(brand => ({ brand, value: stockByBrandMap[brand] }));

        const lowStockItems = estoque.filter((e: any) => e.quantidade < 5).map((item: any) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          quantidade: item.quantidade,
          preco_compra: item.preco_compra,
        }));

        // Processar dados de vendas para receita
        const receitaTotal = vendas.reduce((sum: number, venda: any) => sum + (venda.valor_total || 0), 0);
        const receitaSite = vendas.filter((v: any) => v.origem === 'site').reduce((sum: number, v: any) => sum + (v.valor_total || 0), 0);
        const receitaExterna = vendas.filter((v: any) => v.origem === 'externo').reduce((sum: number, v: any) => sum + (v.valor_total || 0), 0);
        const pedidosSite = vendas.filter((v: any) => v.origem === 'site').length;
        const pedidosPendentesSite = vendas.filter((v: any) => v.origem === 'site' && v.status === 'pendente').length;
        const vendasExternasCount = vendas.filter((v: any) => v.origem === 'externo').length;
        const lucroVendasExternas = vendas.filter((v: any) => v.origem === 'externo').reduce((sum: number, v: any) => sum + (v.lucro || 0), 0);

        // Processar leads
        const leadsCapturadosCount = leads.length;
        const leadsPendentesCount = leads.filter((l: any) => l.status === 'pendente').length;
        const leadsEnviadosCount = leads.filter((l: any) => l.status === 'enviado').length;
        const leadsEntreguesCount = leads.filter((l: any) => l.status === 'entregue').length;
        const leadsCanceladosCount = leads.filter((l: any) => l.status === 'cancelado').length;

        // Simulação de dados de receita mensal
        const monthlyRevenueData = [
          { month: 'Jan', site: Math.random() * 1000, external: Math.random() * 2000 },
          { month: 'Fev', site: Math.random() * 1000, external: Math.random() * 2000 },
          { month: 'Mar', site: Math.random() * 1000, external: Math.random() * 2000 },
          { month: 'Abr', site: Math.random() * 1000, external: Math.random() * 2000 },
          { month: 'Mai', site: Math.random() * 1000, external: Math.random() * 2000 },
          { month: 'Jun', site: Math.random() * 1000, external: Math.random() * 2000 },
        ];

        // Simulação de visitas por hora
        const hourlyVisitsData = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, '0')}h`,
          visits: Math.floor(Math.random() * 80)
        }));

        // Simulação de pedidos por status
        const ordersByStatusData = [
          { status: 'Pendentes', count: Math.floor(Math.random() * 10) },
          { status: 'Enviados', count: Math.floor(Math.random() * 20) },
          { status: 'Entregues', count: Math.floor(Math.random() * 30) },
          { status: 'Cancelados', count: Math.floor(Math.random() * 5) },
        ];

        // Simulação de produtos mais vendidos
        const topSellingProductsData = [
          { name: 'Produto A', value: Math.floor(Math.random() * 500) + 100 },
          { name: 'Produto B', value: Math.floor(Math.random() * 400) + 80 },
          { name: 'Produto C', value: Math.floor(Math.random() * 300) + 60 },
          { name: 'Produto D', value: Math.floor(Math.random() * 200) + 40 },
          { name: 'Produto E', value: Math.floor(Math.random() * 100) + 20 },
        ];

        // Simulação de pedidos recentes
        const recentOrdersData = [
          { id: 'ORD001', cliente: 'João Silva', status: 'pendente', valor_total: 150.00, data: '2026-02-25' },
          { id: 'ORD002', cliente: 'Maria Souza', status: 'aprovado', valor_total: 300.50, data: '2026-02-24' },
          { id: 'ORD003', cliente: 'Pedro Santos', status: 'enviado', valor_total: 75.20, data: '2026-02-23' },
          { id: 'ORD004', cliente: 'Ana Costa', status: 'entregue', valor_total: 220.00, data: '2026-02-22' },
          { id: 'ORD005', cliente: 'Carlos Lima', status: 'cancelado', valor_total: 50.00, data: '2026-02-21' },
        ];

        setStats({
          totalOrcamentos: orcamentos.length,
          orcamentosPendentes: orcamentos.filter((o: any) => o.status === 'pendente').length,
          totalVendas: vendas.length,
          totalProdutos: produtos.length,
          totalUsuarios: usuarios.length,
          totalPrestadores: prestadores.length,
          itensEstoqueBaixo: lowStockItems.length,
          producoesAtivas: producao.filter((p: any) => p.status === 'em_producao').length,
          leadsCapturados: leadsCapturadosCount,
          leadsPendentes: leadsPendentesCount,
          leadsEnviados: leadsEnviadosCount,
          leadsEntregues: leadsEntreguesCount,
          leadsCancelados: leadsCanceladosCount,
          visitantesOnline: traffic.onlineNow || 0,
          visitantesHoje: traffic.today || 0,
          visitantesSeteDias: traffic.lastSevenDays || 0,
          visitantesMes: traffic.thisMonth || 0,
          valorEstoqueTotal,
          produtosAtivosEstoque,
          unidadesEmEstoque,
          condicaoNovas,
          condicaoUsadas,
          receitaTotal,
          receitaSite,
          receitaExterna,
          pedidosSite,
          pedidosPendentesSite,
          vendasExternas: vendasExternasCount,
          lucroVendasExternas,
        });
        setTrafficSources(traffic.trafficSources || []);
        setTopPages(traffic.topPages || []);
        setGeoStates(traffic.geoStates || []);
        setGeoCities(traffic.geoCities || []);
        setStockByBrand(stockByBrandArray);
        setLowStockProducts(lowStockItems);
        setHourlyVisits(hourlyVisitsData);
        setMonthlyRevenue(monthlyRevenueData);
        setOrdersByStatus(ordersByStatusData);
        setTopSellingProducts(topSellingProductsData);
        setRecentOrders(recentOrdersData);

      } catch (error) {
        console.error('Erro ao carregar estatísticas do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF0000', '#00FF00'];

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
            <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao Painel Administrativo!</h1>
            <p className="text-gray-600">Visão geral e acesso rápido às principais funcionalidades.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i => (
                <Card key={i} className="animate-pulse h-32"></Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cards de Receita e Pedidos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.receitaTotal.toFixed(2).replace('.', ',')}</div>
                  <p className="text-xs text-muted-foreground">Site: R$ {stats.receitaSite.toFixed(2).replace('.', ',')} + Externo: R$ {stats.receitaExterna.toFixed(2).replace('.', ',')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos (Site)</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pedidosSite}</div>
                  <p className="text-xs text-muted-foreground">{stats.pedidosPendentesSite} pendentes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Externas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.vendasExternas}</div>
                  <p className="text-xs text-muted-foreground">Lucro: R$ {stats.lucroVendasExternas.toFixed(2).replace('.', ',')}</p>
                </CardContent>
              </Card>

              {/* Cards de Produtos, Clientes, Leads */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProdutos}</div>
                  <p className="text-xs text-muted-foreground">Ativos no catálogo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
                  <p className="text-xs text-muted-foreground">Registrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Leads</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.leadsCapturados}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.leadsPendentes} pendentes, {stats.leadsEnviados} enviados, {stats.leadsEntregues} entregues, {stats.leadsCancelados} cancelados
                  </p>
                </CardContent>
              </Card>

              {/* Cards de Estoque e Visitantes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.itensEstoqueBaixo}</div>
                  <p className="text-xs text-muted-foreground">produto(s)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.valorEstoqueTotal.toFixed(2).replace('.', ',')}</div>
                  <p className="text-xs text-muted-foreground">{stats.produtosAtivosEstoque} produtos, {stats.unidadesEmEstoque} unidades</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Visitantes Online</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.visitantesOnline}</div>
                  <p className="text-xs text-muted-foreground">Online Agora</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Visitantes Hoje</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.visitantesHoje}</div>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Visitantes Últimos 7 dias</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.visitantesSeteDias}</div>
                  <p className="text-xs text-muted-foreground">total de acessos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Visitantes Este Mês</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.visitantesMes}</div>
                  <p className="text-xs text-muted-foreground">total de acessos</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Inventory Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Detalhes do Estoque</h3>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="animate-pulse h-48"></Card>
                <Card className="animate-pulse h-48"></Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Estoque Baixo (&lt; 5 un.)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lowStockProducts.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        {lowStockProducts.map((product, index) => (
                          <li key={index}>{product.name} {product.brand && `(${product.brand})`} ({product.quantidade} un.)</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum produto com estoque baixo.</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Condição das Peças</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Novas: <span className="font-bold">{stats.condicaoNovas}</span></p>
                    <p>Usadas: <span className="font-bold">{stats.condicaoUsadas}</span></p>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Valor do Estoque por Marca</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stockByBrand.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={stockByBrand}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="brand"
                            label={({ brand, percent }) => `${brand} ${(percent * 100).toFixed(0)}%`}
                          >
                            {stockByBrand.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum dado de estoque por marca disponível.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Top 5 por valor em estoque</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lowStockProducts.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        {lowStockProducts.sort((a, b) => (b.preco_compra * b.quantidade) - (a.preco_compra * a.quantidade)).slice(0, 5).map((product, index) => (
                          <li key={index}>{product.name} ({product.brand}) · {product.quantidade} un. × R$ {product.preco_compra.toFixed(2).replace('.', ',')} = R$ {(product.preco_compra * product.quantidade).toFixed(2).replace('.', ',')}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum produto em estoque para exibir o top 5.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Website Traffic Details Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tráfego do Site</h3>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="animate-pulse h-48"></Card>
                <Card className="animate-pulse h-48"></Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Receita Mensal — Site vs Vendas Externas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {monthlyRevenue.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={monthlyRevenue}
                          margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                          <Legend />
                          <Bar dataKey="site" fill="#8884d8" name="Site" />
                          <Bar dataKey="external" fill="#82ca9d" name="Externo" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem dados de receita mensal.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Visitantes por Hora (Hoje)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hourlyVisits.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={hourlyVisits}
                          margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="visits" fill="#8884d8" name="Visitas" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum dado de visitantes por hora disponível.</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Origem do Tráfego (Hoje)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trafficSources.length > 0 ? (
                      <ul>
                        {trafficSources.map((source, index) => (
                          <li key={index}>{source.source}: {source.visits} visitas</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum dado de origem de tráfego disponível.</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Páginas Mais Visitadas Hoje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topPages.length > 0 ? (
                      <ul>
                        {topPages.map((page, index) => (
                          <li key={index}>{page.page}: {page.visits} visitas</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum dado de páginas mais visitadas disponível.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Distribuição Geográfica (Este Mês)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Por Estado</h4>
                        {geoStates.length > 0 ? (
                          <ul>
                            {geoStates.map((geo, index) => (
                              <li key={index}>{geo.state}: {geo.visits} visitas</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhum dado de estado disponível.</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Top Cidades</h4>
                        {geoCities.length > 0 ? (
                          <ul>
                            {geoCities.map((geo, index) => (
                              <li key={index}>{geo.city}: {geo.visits} visitas</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhum dado de cidade disponível.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Orders and Products Details Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pedidos e Produtos</h3>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="animate-pulse h-48"></Card>
                <Card className="animate-pulse h-48"></Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pedidos por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersByStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={ordersByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="status"
                            label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                          >
                            {ordersByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem dados de pedidos por status.</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Produtos Mais Vendidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topSellingProducts.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={topSellingProducts}
                          margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" hide={true} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#82ca9d" name="Vendas" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem dados de produtos mais vendidos.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Pedidos Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentOrders.length > 0 ? (
                      <ul className="space-y-2">
                        {recentOrders.map((order, index) => (
                          <li key={index} className="flex items-center justify-between text-sm text-gray-700">
                            <span>#{order.id} - {order.cliente}</span>
                            <span className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                                order.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'entregue' ? 'bg-purple-100 text-purple-800' :
                                'bg-red-100 text-red-800'
                              }`}>{order.status}</span>
                              <span>R$ {order.valor_total.toFixed(2).replace('.', ',')}</span>
                              <Link to={`/admin/orcamentos/${order.id}`} className="text-blue-600 hover:underline"><ExternalLink size={14} /></Link>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum pedido recente.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.filter(item => item.id !== 'dashboard').map(item => (
                <Link key={item.id} to={item.path}>
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center justify-center text-center">
                    <item.icon className={`h-8 w-8 mb-2 ${item.color}`} />
                    <span className="text-md font-semibold">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
