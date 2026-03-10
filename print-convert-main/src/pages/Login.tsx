import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Printer, LogIn, UserPlus, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type LoginMode = 'choose' | 'login' | 'register' | 'admin';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<LoginMode>('choose');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `Login com ${provider}`,
      description: `Redirecionando para autenticação ${provider}... (Em breve disponível)`,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('user_authenticated', 'true');
      localStorage.setItem('user_email', formData.email);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
      navigate('/minha-conta');
    }, 1000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const adminEmails = ['3dk.print.br@gmail.com'];
      const isAdmin = adminEmails.includes(formData.email) && formData.password === '1A9B8Z5X';
      
      if (isAdmin) {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_user', 'kuster789jose');
        localStorage.setItem('user_email', formData.email);
        localStorage.setItem('admin_role', 'master');
        localStorage.setItem('admin_permissions', 'all');
        toast({
          title: "Bem-vindo, Administrador!",
          description: "Acesso ao painel administrativo concedido.",
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Acesso negado",
          description: "Credenciais de administrador inválidas.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('user_authenticated', 'true');
      localStorage.setItem('user_email', formData.email);
      localStorage.setItem('user_name', formData.name);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo à 3DKPRINT!",
      });
      navigate('/minha-conta');
    }, 1000);
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', phone: '' });
    setShowPassword(false);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-4"
        >
          <div className="card-elevated p-8 shadow-2xl rounded-2xl bg-white">
            {/* Logo / Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Printer className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {mode === 'choose' && 'Bem-vindo à 3DKPRINT'}
                {mode === 'login' && 'Entrar na sua conta'}
                {mode === 'register' && 'Criar sua conta'}
                {mode === 'admin' && 'Painel Administrativo'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {mode === 'choose' && 'Escolha como deseja continuar'}
                {mode === 'login' && 'Acesse sua área do cliente'}
                {mode === 'register' && 'Crie sua conta grátis'}
                {mode === 'admin' && 'Acesso restrito a administradores'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* ===== MODO ESCOLHA (Botões iniciais) ===== */}
              {mode === 'choose' && (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Botão Entrar */}
                  <button
                    onClick={() => { resetForm(); setMode('login'); }}
                    className="w-full py-4 px-6 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
                  >
                    Entrar
                  </button>

                  {/* Botão Cadastro */}
                  <button
                    onClick={() => { resetForm(); setMode('register'); }}
                    className="w-full py-4 px-6 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
                  >
                    Cadastro Cliente
                  </button>

                  {/* Botão Admin */}
                  <button
                    onClick={() => { resetForm(); setMode('admin'); }}
                    className="w-full py-4 px-6 bg-purple-600 text-white font-bold text-lg rounded-xl hover:bg-purple-700 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
                  >
                    Painel Admin
                  </button>
                </motion.div>
              )}

              {/* ===== MODO LOGIN CLIENTE ===== */}
              {mode === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={() => setMode('choose')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>

                  {/* Social Login */}
                  <div className="space-y-3 mb-6">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Google')}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-border rounded-xl hover:bg-secondary/50 transition-all font-medium text-foreground"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuar com Google
                    </button>
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-muted-foreground font-medium">ou entre com e-mail</span>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <Label htmlFor="email" className="mb-2 block text-sm font-medium">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                        <Link to="/esqueci-senha" className="text-xs text-accent hover:underline">
                          Esqueceu a senha?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 py-6 font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Entrando...' : 'Entrar'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      Não tem uma conta?{' '}
                      <button onClick={() => { resetForm(); setMode('register'); }} className="text-accent font-semibold hover:underline">
                        Criar conta grátis
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ===== MODO CADASTRO ===== */}
              {mode === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={() => setMode('choose')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>

                  {/* Social Register */}
                  <div className="space-y-3 mb-6">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Google')}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-border rounded-xl hover:bg-secondary/50 transition-all font-medium text-foreground"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Cadastrar com Google
                    </button>
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-muted-foreground font-medium">ou cadastre com e-mail</span>
                    </div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="mb-2 block text-sm font-medium">Nome completo</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg-email" className="mb-2 block text-sm font-medium">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="mb-2 block text-sm font-medium">WhatsApp</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(43) 99174-1518"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg-password" className="mb-2 block text-sm font-medium">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6 caracteres"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 text-white hover:bg-green-700 py-6 font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Criando conta...' : 'Criar conta grátis'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      Já tem uma conta?{' '}
                      <button onClick={() => { resetForm(); setMode('login'); }} className="text-accent font-semibold hover:underline">
                        Entrar
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ===== MODO ADMIN ===== */}
              {mode === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={() => setMode('choose')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-purple-800 font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Acesso restrito a administradores autorizados
                    </p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-5">
                    <div>
                      <Label htmlFor="admin-email" className="mb-2 block text-sm font-medium">E-mail Admin</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@3dkprint.com.br"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="admin-password" className="mb-2 block text-sm font-medium">Senha Admin</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-purple-600 text-white hover:bg-purple-700 py-6 font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Verificando...' : 'Acessar Painel Admin'}
                      <ShieldCheck className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
