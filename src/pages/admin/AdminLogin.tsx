import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Credenciais administrativas
    const ADMIN_USERNAME = 'kuster789jose';
    const ADMIN_PASSWORD = '1@9b8z5X';

    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Salvar sessão administrativa
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_user', username);
        navigate('/admin/dashboard');
      } else {
        setError('Usuário ou senha incorretos');
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
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">3DKPRINT - Acesso Restrito</p>
          </div>

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Erro */}
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

            {/* Usuário */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="pl-10"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Senha */}
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
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar no Painel'}
            </Button>
          </form>

          {/* Rodapé */}
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
