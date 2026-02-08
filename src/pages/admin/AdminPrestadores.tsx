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
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrestadores, atualizarStatusPrestador, inicializarDadosExemplo } from '@/lib/dataStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  dataCadastro: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  avaliacao?: number;
}

export default function AdminPrestadores() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('prestadores');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedPrestador, setSelectedPrestador] = useState<Prestador | null>(null);
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);

  // Carregar prestadores do localStorage
  useEffect(() => {
    inicializarDadosExemplo();
    setPrestadores(getPrestadores());
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

  const filteredPrestadores = prestadores.filter((prest) => {
    const matchSearch =
      prest.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prest.apelido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prest.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'todos' || prest.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const handleAprovar = (id: string) => {
    atualizarStatusPrestador(id, 'aprovado');
    setPrestadores(getPrestadores());
  };

  const handleRecusar = (id: string) => {
    atualizarStatusPrestador(id, 'recusado');
    setPrestadores(getPrestadores());
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
              Gestão de Prestadores
            </h2>
            <p className="text-muted-foreground">
              Aprove ou recuse cadastros de prestadores de serviço
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aguardando Aprovação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {prestadores.filter((p) => p.status === 'pendente').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aprovados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {prestadores.filter((p) => p.status === 'aprovado').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recusados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {prestadores.filter((p) => p.status === 'recusado').length}
                </div>
              </CardContent>
            </Card>
          </div>

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
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserCheck className="w-8 h-8 text-primary" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{prest.nome}</h3>
                            {getStatusBadge(prest.status)}
                          </div>

                          <p className="text-sm text-muted-foreground mb-1">
                            <span className="font-medium">Apelido:</span> @{prest.apelido}
                          </p>

                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {prest.email}
                          </p>

                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {prest.telefone}
                          </p>

                          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {prest.cidade} - {prest.estado}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-2">
                            {prest.servicos.map((servico) => (
                              <span
                                key={servico}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {servico}
                              </span>
                            ))}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Experiência:</span>{' '}
                            {prest.experiencia}
                          </p>

                          {prest.avaliacao && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span className="font-medium">{prest.avaliacao.toFixed(1)}</span>
                            </p>
                          )}

                          <p className="text-xs text-muted-foreground mt-2">
                            Cadastrado em:{' '}
                            {new Date(prest.dataCadastro).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {prest.status === 'pendente' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleAprovar(prest.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRecusar(prest.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Recusar
                            </Button>
                          </>
                        )}

                        {prest.portfolio && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(prest.portfolio, '_blank')}
                          >
                            Ver Portfólio
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {filteredPrestadores.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum prestador encontrado com os filtros selecionados
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
