import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // E-mail master do administrador
  const MASTER_ADMIN_EMAIL = '3dk.print.br@gmail.com';
  const MASTER_ADMIN_PASS = '1@9b8z5X';

  // Funcionários Mock (Simulando banco de dados para o teste solicitado)
  const STAFF_ACCOUNTS = [
    { email: 'atendimento@3dkprint.com.br', pass: 'atend123', role: 'atendimento', screens: ['dashboard', 'orcamentos'] },
    { email: 'producao@3dkprint.com.br', pass: 'prod123', role: 'producao', screens: ['dashboard', 'producao', 'estoque'] }
  ];

  useEffect(() => {
    if (localStorage.getItem('admin_authenticated') === 'true') {
      navigate('/admin/dashboard');
      return;
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // 1. Verificar se é o Master Admin
      if (email === MASTER_ADMIN_EMAIL && password === MASTER_ADMIN_PASS) {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_user', email);
        localStorage.setItem('admin_role', 'master');
        localStorage.setItem('admin_permissions', JSON.all); // Master tem acesso a tudo
        navigate('/admin/dashboard');
        return;
      }

      // 2. Verificar se é um funcionário
      const staff = STAFF_ACCOUNTS.find(s => s.email === email && s.pass === password);
      if (staff) {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_user', email);
        localStorage.setItem('admin_role', staff.role);
        localStorage.setItem('admin_permissions', JSON.stringify(staff.screens));
        navigate('/admin/dashboard');
      } else {
        setError('E-mail ou senha incorretos. Acesso restrito a administradores.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">3DKPRINT - Acesso Restrito</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                E-mail Administrativo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Autenticando...' : 'Entrar no Painel'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              © 2026 3DKPRINT - Todos os direitos reservados
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
