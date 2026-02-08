import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCheck,
  Package,
  ShoppingCart,
  LogOut,
  Printer,
  Palette,
  Wrench,
  Box,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrcamentos, getPrestadores, getUsuarios, inicializarDadosExemplo } from '@/lib/dataStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    orcamentosTotal: 0,
    orcamentosPendentes: 0,
    orcamentosAprovados: 0,
    orcamentosRecusados: 0,
    prestadoresPendentes: 0,
    prestadoresAprovados: 0,
    usuariosTotal: 0,
    vendasMes: 0,
  });

  // Carregar dados do localStorage
  useEffect(() => {
    inicializarDadosExemplo();
    const orcamentos = getOrcamentos();
    const prestadores = getPrestadores();
    const usuarios = getUsuarios();

    setStats({
      orcamentosTotal: orcamentos.length,
      orcamentosPendentes: orcamentos.filter(o => o.status === 'pendente').length,
      orcamentosAprovados: orcamentos.filter(o => o.status === 'aprovado').length,
      orcamentosRecusados: orcamentos.filter(o => o.status === 'recusado').length,
      prestadoresPendentes: prestadores.filter(p => p.status === 'pendente').length,
      prestadoresAprovados: prestadores.filter(p => p.status === 'aprovado').length,
      usuariosTotal: usuarios.length,
      vendasMes: orcamentos.filter(o => o.status === 'aprovado').length,
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };



  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      id: 'orcamentos',
      label: 'Orçamentos',
      icon: FileText,
      path: '/admin/orcamentos',
    },
    {
      id: 'prestadores',
      label: 'Prestadores',
      icon: UserCheck,
      path: '/admin/prestadores',
    },
    {
      id: 'usuarios',
      label: 'Usuários',
      icon: Users,
      path: '/admin/usuarios',
    },
    {
      id: 'produtos',
      label: 'Produtos',
      icon: Package,
      path: '/admin/produtos',
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: ShoppingCart,
      path: '/admin/vendas',
    },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: Package,
      path: '/admin/estoque',
    },
  ];

  const orcamentosPorTipo = [
    { tipo: 'Impressão 3D', total: 18, pendentes: 5, icon: Printer, color: 'text-blue-500' },
    { tipo: 'Modelagem 3D', total: 12, pendentes: 3, icon: Box, color: 'text-purple-500' },
    { tipo: 'Pintura', total: 8, pendentes: 2, icon: Palette, color: 'text-pink-500' },
    { tipo: 'Manutenção', total: 7, pendentes: 2, icon: Wrench, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">3DKPRINT</h1>
          <p className="text-sm text-muted-foreground">Painel Administrativo</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h2>
            <p className="text-muted-foreground">
              Visão geral do sistema 3DKPRINT
            </p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Orçamentos Total
                  </CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.orcamentosTotal}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.orcamentosPendentes} pendentes
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Prestadores
                  </CardTitle>
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.prestadoresAprovados}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.prestadoresPendentes} aguardando aprovação
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Usuários
                  </CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.usuariosTotal}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cadastrados no sistema
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Vendas do Mês
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.vendasMes}</div>
                  <p className="text-xs text-green-600 mt-1">
                    +12% vs mês anterior
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Orçamentos por Tipo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Orçamentos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orcamentosPorTipo.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.tipo}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-background rounded-lg ${item.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{item.tipo}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.pendentes} pendentes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{item.total}</p>
                          <p className="text-xs text-muted-foreground">total</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Status dos Orçamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Orçamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Pendentes</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.orcamentosPendentes}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Aprovados</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.orcamentosAprovados}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Recusados</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.orcamentosRecusados}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/admin/orcamentos')}
                >
                  <FileText className="w-6 h-6" />
                  <span>Ver Orçamentos</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/admin/prestadores')}
                >
                  <UserCheck className="w-6 h-6" />
                  <span>Aprovar Prestadores</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/admin/vendas')}
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Gerenciar Vendas</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
