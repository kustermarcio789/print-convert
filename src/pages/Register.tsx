import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Loader, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome || !formData.email || !formData.telefone || !formData.password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'A senha e a confirmação devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Senha fraca',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.nome,
        formData.telefone
      );

      if (result.success) {
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Verifique seu e-mail para confirmar a conta.',
        });
        navigate('/login');
      } else {
        toast({
          title: 'Erro ao registrar',
          description: result.error?.message || 'Tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao registrar.',
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Criar Conta</h1>
                <p className="text-muted-foreground">Junte-se à comunidade 3DKPRINT</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="nome"
                      placeholder="Seu nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
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
                  <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="telefone"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: e.target.value })
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
                      placeholder="Mínimo 6 caracteres"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
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
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar Conta
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-accent hover:underline font-medium"
                  >
                    Faça login
                  </button>
                </p>
              </div>

              <div className="mt-6 p-4 bg-secondary/50 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground">
                  ✓ Seus dados são protegidos e nunca serão compartilhados com terceiros.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
