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
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUsuarios, inicializarDadosExemplo } from '@/lib/dataStore';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade?: string;
  estado?: string;
  dataCadastro: string;
  ultimoAcesso?: string;
  orcamentosRealizados: number;
  comprasRealizadas: number;
}

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Carregar usuários do localStorage
  useEffect(() => {
    inicializarDadosExemplo();
    setUsuarios(getUsuarios());
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



  const filteredUsuarios = usuarios.filter((user) => {
    const matchSearch =
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

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
              Gestão de Usuários
            </h2>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os usuários cadastrados
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usuarios.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Orçamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usuarios.reduce((acc, u) => acc + u.orcamentosRealizados, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usuarios.reduce((acc, u) => acc + u.comprasRealizadas, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Usuários */}
          <div className="space-y-4">
            {filteredUsuarios.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-primary" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{user.nome}</h3>
                            <span className="text-xs text-muted-foreground">
                              {user.id}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>

                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {user.telefone}
                          </p>

                          {user.cidade && user.estado && (
                            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {user.cidade} - {user.estado}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div className="bg-accent/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground">Orçamentos</p>
                              <p className="text-lg font-semibold">
                                {user.orcamentosRealizados}
                              </p>
                            </div>

                            <div className="bg-accent/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground">Compras</p>
                              <p className="text-lg font-semibold">
                                {user.comprasRealizadas}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Cadastrado em:{' '}
                              {new Date(user.dataCadastro).toLocaleDateString('pt-BR')}
                            </p>
                            {user.ultimoAcesso && (
                              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3" />
                                Último acesso:{' '}
                                {new Date(user.ultimoAcesso).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUsuario(user)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {filteredUsuarios.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum usuário encontrado com os filtros selecionados
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalhes (simplificado) */}
      {selectedUsuario && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedUsuario(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
          >
            <h3 className="text-2xl font-bold mb-4">
              Detalhes do Usuário {selectedUsuario.id}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="text-lg">{selectedUsuario.nome}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{selectedUsuario.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                <p className="text-lg">{selectedUsuario.telefone}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Atividade</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-accent p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Orçamentos</p>
                    <p className="text-2xl font-bold">
                      {selectedUsuario.orcamentosRealizados}
                    </p>
                  </div>
                  <div className="bg-accent p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Compras</p>
                    <p className="text-2xl font-bold">
                      {selectedUsuario.comprasRealizadas}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedUsuario(null)}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
