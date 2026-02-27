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

  // Sistema de Permissões
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Carregar permissões do localStorage
    const savedRole = localStorage.getItem('admin_role');
    const savedPerms = localStorage.getItem('admin_permissions');
    
    if (savedRole === 'master') {
      setPermissions(['all']);
    } else if (savedPerms) {
      setPermissions(JSON.parse(savedPerms));
    }
    setUserRole(savedRole || '');

    const fetchStats = async () => {
      try {
        setLoading(true);
        const [orcamentos, vendas, produtos, usuarios, prestadores, estoque, producao, leads, traffic] = await Promise.all([
          orcamentosAPI.getAll().catch(() => []),
          vendasAPI.getAll().catch(() => []),
          produtosAPI.getAll().catch(() => []),
          usuariosAPI.getAll().catch(() => []),
          prestadoresAPI.getAll().catch(() => []),
          estoqueAPI.getAll().catch(() => []),
          producaoAPI.getAll().catch(() => []),
          leadsAPI.getAll().catch(() => []),
          trafficAPI.getDashboardStats().catch(() => ({})),
        ]);

        const valorEstoqueTotal = (estoque || []).reduce((sum: number, item: any) => sum + (item.preco_compra * item.quantidade), 0);
        const lowStockItems = (estoque || []).filter((e: any) => e.quantidade < 5).map((item: any) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          quantidade: item.quantidade,
          preco_compra: item.preco_compra,
        }));

        setStats({
          totalOrcamentos: orcamentos.length,
          orcamentosPendentes: orcamentos.filter((o: any) => o.status === 'pendente').length,
          totalVendas: vendas.length,
          totalProdutos: produtos.length,
          totalUsuarios: usuarios.length,
          totalPrestadores: prestadores.length,
          itensEstoqueBaixo: lowStockItems.length,
          producoesAtivas: producao.filter((p: any) => p.status === 'em_producao').length,
          leadsCapturados: leads.length,
          leadsPendentes: leads.filter((l: any) => l.status === 'pendente').length,
          leadsEnviados: leads.filter((l: any) => l.status === 'enviado').length,
          leadsEntregues: leads.filter((l: any) => l.status === 'entregue').length,
          leadsCancelados: leads.filter((l: any) => l.status === 'cancelado').length,
          visitantesOnline: traffic.onlineNow || 0,
          visitantesHoje: traffic.today || 0,
          visitantesSeteDias: traffic.lastSevenDays || 0,
          visitantesMes: traffic.thisMonth || 0,
          valorEstoqueTotal,
          produtosAtivosEstoque: estoque.length,
          unidadesEmEstoque: estoque.reduce((sum: number, item: any) => sum + item.quantidade, 0),
          condicaoNovas: estoque.filter((item: any) => item.condicao === 'novo').length,
          condicaoUsadas: estoque.filter((item: any) => item.condicao === 'usado').length,
          receitaTotal: vendas.reduce((sum: number, v: any) => sum + (v.valor_total || 0), 0),
          receitaSite: vendas.filter((v: any) => v.origem === 'site').reduce((sum: number, v: any) => sum + (v.valor_total || 0), 0),
          receitaExterna: vendas.filter((v: any) => v.origem === 'externo').reduce((sum: number, v: any) => sum + (v.valor_total || 0), 0),
          pedidosSite: vendas.filter((v: any) => v.origem === 'site').length,
          pedidosPendentesSite: vendas.filter((v: any) => v.origem === 'site' && v.status === 'pendente').length,
          vendasExternas: vendas.filter((v: any) => v.origem === 'externo').length,
          lucroVendasExternas: vendas.filter((v: any) => v.origem === 'externo').reduce((sum: number, v: any) => sum + (v.lucro || 0), 0),
        });
        
        setTrafficSources(traffic.trafficSources || []);
        setTopPages(traffic.topPages || []);
        setGeoStates(traffic.geoStates || []);
        setGeoCities(traffic.geoCities || []);
        setLowStockProducts(lowStockItems);
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
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_permissions');
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

  // Filtrar menu baseado em permissões
  const allowedMenuItems = menuItems.filter(item => 
    permissions.includes('all') || permissions.includes(item.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-blue-600" />
            3DKPRINT Admin
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Acesso: {userRole}</p>
        </div>
        <nav className="flex-1 mt-4 px-4 space-y-1">
          {allowedMenuItems.map((item) => {
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
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} /> Sair do Painel
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-4">
              <Link to="/" target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Ver Site <ExternalLink size={14} />
              </Link>
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {userRole === 'master' ? 'MA' : 'ST'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Dashboard Stats Grid - Apenas um resumo para o exemplo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Visitantes Hoje</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.visitantesHoje}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Orçamentos Pendentes</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.orcamentosPendentes}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">R$ {stats.receitaTotal.toFixed(2)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Itens em Estoque</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.unidadesEmEstoque}</div></CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allowedMenuItems.filter(item => item.id !== 'dashboard').map(item => (
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
