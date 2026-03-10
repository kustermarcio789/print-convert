import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid, refreshAdminToken } from '@/lib/adminAuthService';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Componente que protege rotas do painel administrativo
 * Verifica se o usuário tem um token JWT válido
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Verificar se o token ainda é válido
      if (isTokenValid()) {
        setIsAuthenticated(true);
      } else {
        // Tentar renovar o token
        const refreshed = await refreshAdminToken();
        setIsAuthenticated(refreshed);
      }
    };

    checkAuth();

    // Verificar autenticação a cada 5 minutos
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Enquanto verifica a autenticação, mostrar loading
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Se está autenticado, renderizar o componente
  return <>{children}</>;
}
