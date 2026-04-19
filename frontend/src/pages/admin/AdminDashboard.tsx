import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Package, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, DollarSign, Eye,
  Zap, RefreshCw, ShoppingBag, Layers,
  Activity, Target, BarChart3, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  orcamentosAPI, vendasAPI, produtosAPI, usuariosAPI, estoqueAPI, producaoAPI, trafficAPI
} from '@/lib/apiClient';
import { getProductCountsByBrand } from '@/lib/productsData';
import Sidebar, { menuItems } from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AnalyticsSection from '@/components/admin/AnalyticsSection';
import { fmtBRL } from '@/lib/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrcamentos: 0,
    orcamentosPendentes: 0,
    orcamentosAprovados: 0,
    orcamentosRecusados: 0,
    totalVendas: 0,
    totalProdutos: 0,
    totalUsuarios: 0,
    itensEstoqueBaixo: 0,
    producoesAtivas: 0,
    producoesFinalizadas: 0,
    visitantesHoje: 0,
    receitaTotal: 0,
    receitaMes: 0,
    ticketMedio: 0,
    taxaConversao: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrcamentos, setRecentOrcamentos] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [productCountsByBrand, setProductCountsByBrand] = useState<{ brand: string; count: number }[]>([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [orcamentos, vendas, produtos, usuarios, estoque, producao, traffic, productCountsByBrandData] = await Promise.all([
        orcamentosAPI.getAll().catch(() => []),
        vendasAPI.getAll().catch(() => []),
        produtosAPI.getAll().catch(() => []),
        usuariosAPI.getAll().catch(() => []),
        estoqueAPI.getAll().catch(() => []),
        producaoAPI.getAll().catch(() => []),
        trafficAPI.getDashboardStats().catch(() => ({ today: 0 })),
        getProductCountsByBrand().catch(() => []),
      ]);

      const receitaTotal = vendas.reduce((sum: number, v: any) => sum + (v.valor_total || v.valor || 0), 0);
      const orcPendentes = orcamentos.filter((o: any) => o.status === 'pendente').length;
      const orcAprovados = orcamentos.filter((o: any) => o.status === 'aprovado').length;
      const orcRecusados = orcamentos.filter((o: any) => o.status === 'recusado').length;
      const itensEstoqueBaixo = estoque.filter((e: any) => (e.quantidade || 0) < (e.minimo || 5)).length;
      const producoesAtivas = producao.filter((p: any) => p.status === 'em_andamento' || p.status === 'pendente').length;
      const producoesFinalizadas = producao.filter((p: any) => p.status === 'finalizado' || p.status === 'concluido').length;
      const ticketMedio = vendas.length > 0 ? receitaTotal / vendas.length : 0;
      const taxaConversao = orcamentos.length > 0 ? (orcAprovados / orcamentos.length) * 100 : 0;

      setStats({
        totalOrcamentos: orcamentos.length,
        orcamentosPendentes: orcPendentes,
        orcamentosAprovados: orcAprovados,
        orcamentosRecusados: orcRecusados,
        totalVendas: vendas.length,
        totalProdutos: produtos.length,
        totalUsuarios: usuarios.length,
        itensEstoqueBaixo,
        producoesAtivas,
        producoesFinalizadas,
        visitantesHoje: traffic?.today || 0,
        receitaTotal,
        receitaMes: receitaTotal * 0.3, // Placeholder
        ticketMedio,
        taxaConversao,
      });

      const sorted = [...orcamentos].sort((a: any, b: any) => 
        new Date(b.created_at || b.data || 0).getTime() - new Date(a.created_at || a.data || 0).getTime()
      ).slice(0, 8);
      setRecentOrcamentos(sorted);
      setProductCountsByBrand(productCountsByBrandData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'aprovado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'recusado': return 'bg-red-100 text-red-700 border-red-200';
      case 'em_producao': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'finalizado': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aprovado': return 'Aprovado';
      case 'recusado': return 'Recusado';
      case 'em_producao': return 'Em Produção';
      case 'finalizado': return 'Finalizado';
      default: return status || 'N/A';
    }
  };

  const kpiCards = [
    {
      title: 'Receita Total',
      value: `R$ ${stats.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-700',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      title: 'Total Orçamentos',
      value: stats.totalOrcamentos.toString(),
      change: `${stats.orcamentosPendentes} pendentes`,
      trend: 'neutral',
      icon: ClipboardList,
      gradient: 'from-blue-500 to-blue-700',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      title: 'Vendas',
      value: stats.totalVendas.toString(),
      change: '+8.3%',
      trend: 'up',
      icon: ShoppingBag,
      gradient: 'from-violet-500 to-violet-700',
      shadowColor: 'shadow-violet-500/20',
    },
    {
      title: 'Clientes',
      value: stats.totalUsuarios.toString(),
      change: '+5 novos',
      trend: 'up',
      icon: Users,
      gradient: 'from-pink-500 to-pink-700',
      shadowColor: 'shadow-pink-500/20',
    },
  ];

  const secondaryCards = [
    {
      title: 'Produtos',
      value: stats.totalProdutos,
      icon: Package,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Produções Ativas',
      value: stats.producoesAtivas,
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    // Card 'Visitantes Hoje' oculto — dados vinham de trafficAPI simulado.
    // Religar quando tiver integração com GA4 Data API ou Vercel Analytics.
    {
      title: 'Taxa Conversão',
      value: `${stats.taxaConversao.toFixed(1)}%`,
      icon: Target,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.ticketMedio.toFixed(0)}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Estoque Baixo',
      value: stats.itensEstoqueBaixo,
      icon: Layers,
      color: stats.itensEstoqueBaixo > 0 ? 'text-red-600' : 'text-green-600',
      bg: stats.itensEstoqueBaixo > 0 ? 'bg-red-50' : 'bg-green-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Dashboard" />

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-white rounded-2xl animate-pulse shadow-sm"></div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-24 bg-white rounded-xl animate-pulse shadow-sm"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Welcome Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Bem-vindo ao Painel</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Visão geral do seu negócio • Atualizado {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchStats}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Atualizar
                  </Button>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpiCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={i}
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg ${card.shadowColor} transition-transform hover:scale-[1.02]`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            card.trend === 'up' ? 'bg-white/20' : 'bg-white/15'
                          } flex items-center gap-1`}>
                            {card.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                            {card.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                            {card.change}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 mb-1">{card.title}</p>
                        <p className="text-3xl font-extrabold text-white">{card.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Secondary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {secondaryCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <Card key={i} className="flex flex-col items-center justify-center p-4 text-center hover:shadow-md transition-shadow">
                      <Icon className={`w-6 h-6 mb-2 ${card.color}`} />
                      <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                      <CardContent className="p-0 mt-1 text-xl font-bold text-gray-900">
                        {card.value}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Products by Brand Card */}
              {productCountsByBrand.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Produtos por Marca</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {productCountsByBrand.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium text-foreground">{item.brand}</span>
                          <span className="text-base font-bold text-accent">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analytics Section oculto — os dados eram simulados (Math.random).
                  GA4 real (G-YFB2V50SNS) está coletando; plugar via Data API quando for ligar. */}
              {/* <AnalyticsSection /> */}

              {/* Recent Orders Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Últimos Orçamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">Cliente</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                          <th scope="col" className="px-6 py-3">Valor</th>
                          <th scope="col" className="px-6 py-3">Data</th>
                          <th scope="col" className="px-6 py-3">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrcamentos.map((orcamento) => (
                          <tr key={orcamento.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{
                              orcamento.cliente_nome || orcamento.user_name || 'N/A'
                            }</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(orcamento.status)}`}>
                                {getStatusLabel(orcamento.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold">{fmtBRL(orcamento.valor_total)}</td>
                            <td className="px-6 py-4 text-gray-500">{new Date(orcamento.created_at).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4">
                              <Link to={`/admin/orcamentos?id=${orcamento.id}`} className="font-medium text-blue-600 hover:underline">Ver</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
