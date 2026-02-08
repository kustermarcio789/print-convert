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
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Box,
  Palette,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrcamentos, atualizarStatusOrcamento, inicializarDadosExemplo } from '@/lib/dataStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Orcamento {
  id: string;
  tipo: 'impressao' | 'modelagem' | 'pintura' | 'manutencao';
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
  const [activeSection, setActiveSection] = useState('orcamentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  // Carregar orçamentos do localStorage
  useEffect(() => {
    inicializarDadosExemplo();
    setOrcamentos(getOrcamentos());
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



  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'impressao':
        return Printer;
      case 'modelagem':
        return Box;
      case 'pintura':
        return Palette;
      case 'manutencao':
        return Wrench;
      default:
        return FileText;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'impressao':
        return 'Impressão 3D';
      case 'modelagem':
        return 'Modelagem 3D';
      case 'pintura':
        return 'Pintura';
      case 'manutencao':
        return 'Manutenção';
      default:
        return tipo;
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
            <XCircle className="w-3 h-3" />
            Recusado
          </span>
        );
      default:
        return null;
    }
  };

  const filteredOrcamentos = orcamentos.filter((orc) => {
    const matchSearch =
      orc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = filterTipo === 'todos' || orc.tipo === filterTipo;
    const matchStatus = filterStatus === 'todos' || orc.status === filterStatus;

    return matchSearch && matchTipo && matchStatus;
  });

  const handleAprovar = (id: string) => {
    atualizarStatusOrcamento(id, 'aprovado');
    setOrcamentos(getOrcamentos());
  };

  const handleRecusar = (id: string) => {
    atualizarStatusOrcamento(id, 'recusado');
    setOrcamentos(getOrcamentos());
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">3DKPRINT</h1>
          <p className="text-sm text-muted-foreground">Painel Administrativo</p>
        </div>

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
              Gestão de Orçamentos
            </h2>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os orçamentos do sistema
            </p>
          </div>

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
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <TipoIcon className="w-6 h-6 text-primary" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{orc.id}</h3>
                              {getStatusBadge(orc.status)}
                            </div>

                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Tipo:</span>{' '}
                              {getTipoLabel(orc.tipo)}
                            </p>

                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Cliente:</span> {orc.cliente}
                            </p>

                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Email:</span> {orc.email}
                            </p>

                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Telefone:</span> {orc.telefone}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Data:</span>{' '}
                              {new Date(orc.data).toLocaleDateString('pt-BR')}
                            </p>

                            {orc.valor && (
                              <p className="text-sm font-semibold text-green-600 mt-2">
                                Valor: R$ {orc.valor.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/orcamentos/${orc.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>

                          {orc.status === 'pendente' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleAprovar(orc.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprovar
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRecusar(orc.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Recusar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {filteredOrcamentos.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum orçamento encontrado com os filtros selecionados
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalhes (simplificado) */}
      {selectedOrcamento && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrcamento(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
          >
            <h3 className="text-2xl font-bold mb-4">
              Detalhes do Orçamento {selectedOrcamento.id}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p className="text-lg">{selectedOrcamento.cliente}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="text-lg">{getTipoLabel(selectedOrcamento.tipo)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Detalhes</p>
                <pre className="bg-accent p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(selectedOrcamento.detalhes, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedOrcamento(null)}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
