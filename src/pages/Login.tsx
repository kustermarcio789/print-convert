import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha e-mail e senha.',
        variant: 'destructive',
      });
      return;
    }

    // Se for admin, usar credenciais hardcoded (temporário)
    if (isAdmin) {
      if (formData.email === 'kuster789jose' && formData.password === '1@9b8z5X') {
        localStorage.setItem('adminToken', 'authenticated');
        navigate('/admin');
        toast({
          title: 'Bem-vindo!',
          description: 'Login de administrador realizado com sucesso.',
        });
        return;
      } else {
        toast({
          title: 'Credenciais inválidas',
          description: 'Usuário ou senha incorretos.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Para clientes, usar Supabase
    setIsLoading(true);
    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        toast({
          title: 'Login realizado!',
          description: 'Bem-vindo de volta!',
        });
        navigate('/');
      } else {
        toast({
          title: 'Erro ao fazer login',
          description: result.error?.message || 'Tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao fazer login.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-24 pb-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo</h1>
                <p className="text-muted-foreground">Faça login para continuar</p>
              </div>

              {/* Toggle Admin/Cliente */}
              <div className="flex gap-2 mb-6 bg-secondary p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setIsAdmin(false)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    !isAdmin
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdmin(true)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    isAdmin
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Admin
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {isAdmin ? 'Usuário' : 'E-mail'}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type={isAdmin ? 'text' : 'email'}
                      placeholder={isAdmin ? 'kuster789jose' : 'seu@email.com'}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              {!isAdmin && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <button
                      onClick={() => navigate('/register')}
                      className="text-accent hover:underline font-medium"
                    >
                      Registre-se aqui
                    </button>
                  </p>
                </div>
              )}

              {isAdmin && (
                <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Dica:</strong> Use as credenciais de administrador para acessar o painel de controle.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
