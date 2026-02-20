import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signUpUsuario, signInUsuario, signOutUsuario, getCurrentUser } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, nome: string, telefone: string) => Promise<{ success: boolean; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<{ success: boolean; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar usuário ao montar
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Inscrever-se em mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignUp = async (email: string, password: string, nome: string, telefone: string) => {
    return await signUpUsuario(email, password, nome, telefone);
  };

  const handleSignIn = async (email: string, password: string) => {
    return await signInUsuario(email, password);
  };

  const handleSignOut = async () => {
    return await signOutUsuario();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
