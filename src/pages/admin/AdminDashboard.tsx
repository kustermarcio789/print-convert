import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Package, Users, TrendingUp,
  Box, Truck, Database, ShoppingCart, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  orcamentosAPI, vendasAPI, produtosAPI, usuariosAPI, prestadoresAPI, estoqueAPI, producaoAPI, trafficAPI
} from '@/lib/apiClient';
import Sidebar, { menuItems } from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrcamentos: 0,
    orcamentosPendentes: 0,
    totalVendas: 0,
    totalProdutos: 0,
    totalUsuarios: 0,
    totalPrestadores: 0,
    itensEstoqueBaixo: 0,
    producoesAtivas: 0,
    visitantesHoje: 0,
    receitaTotal: 0,
    unidadesEmEstoque: 0,
  });
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const savedRole = localStorage.getItem('admin_role');
    const savedPerms = localStorage.getItem('admin_permissions');
    
    if (savedRole === 'master') {
      setPermissions(['all']);
    } else if (savedPerms) {
      setPermissions(savedPerms === 'all' ? ['all'] : JSON.parse(savedPerms));
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const [orcamentos, vendas, produtos, usuarios, prestadores, estoque, producao, traffic] = await Promise.all([
          orcamentosAPI.getAll().catch(() => []),
          vendasAPI.getAll().catch(() => []),
          produtosAPI.getAll().catch(() => []),
          usuariosAPI.getAll().catch(() => []),
          prestadoresAPI.getAll().catch(() => []),
          estoqueAPI.getAll().catch(() => []),
          producaoAPI.getAll().catch(() => []),
          trafficAPI.getDashboardStats().catch(() => ({})),
        ]);

        setStats({
          totalOrcamentos: orcamentos.length,
          orcamentosPendentes: orcamentos.filter((o: any) => o.status === 'pendente').length,
          totalVendas: vendas.length,
          totalProdutos: produtos.length,
          totalUsuarios: usuarios.length,
          totalPrestadores: prestadores.length,
          itensEstoqueBaixo: (estoque || []).filter((e: any) => e.quantidade < 5).length,
          producoesAtivas: producao.filter((p: any) => p.status === 'em_producao').length,
          visitantesHoje: traffic.today || 0,
          receitaTotal: vendas.reduce((sum: number, v: any) => sum + (v.valor_total || 0), 0),
          unidadesEmEstoque: estoque.reduce((sum: number, item: any) => sum + item.quantidade, 0),
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const allowedMenuItems = menuItems.filter(item => 
    permissions.includes('all') || permissions.includes(item.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Dashboard" />

        <div className="p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => <Card key={i} className="animate-pulse h-32"></Card>)}
            </div>
          ) : (
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
          )}

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
