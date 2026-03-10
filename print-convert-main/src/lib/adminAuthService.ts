/**
 * Serviço de Autenticação para Painel Administrativo
 * 
 * Autenticação local segura com suporte a múltiplos níveis de permissão.
 * Usa sessionStorage para maior segurança (dados limpos ao fechar o navegador).
 */

export interface AdminUser {
  id: string;
  email: string;
  role: 'master' | 'atendimento' | 'producao';
  permissions: string[];
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AdminUser;
  token?: string;
  error?: string;
}

// Credenciais administrativas
const ADMIN_CREDENTIALS = [
  {
    email: '3dk.print.br@gmail.com',
    password: '1@9b8z5X',
    user: {
      id: 'admin-master-001',
      email: '3dk.print.br@gmail.com',
      role: 'master' as const,
      permissions: ['dashboard', 'orcamentos', 'produtos', 'usuarios', 'configuracoes', 'relatorios'],
      createdAt: '2024-01-01T00:00:00Z',
    }
  },
  {
    email: 'kuster789jose',
    password: '1@9b8z5X',
    user: {
      id: 'admin-master-002',
      email: 'kuster789jose',
      role: 'master' as const,
      permissions: ['dashboard', 'orcamentos', 'produtos', 'usuarios', 'configuracoes', 'relatorios'],
      createdAt: '2024-01-01T00:00:00Z',
    }
  }
];

/**
 * Gera um token JWT simples para a sessão
 */
function generateToken(user: AdminUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8 horas
  }));
  const signature = btoa(`${header}.${payload}.3dkprint-admin-secret`);
  return `${header}.${payload}.${signature}`;
}

/**
 * Realiza login do administrador
 */
export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
  try {
    // Validação básica
    if (!email || !password) {
      return {
        success: false,
        error: 'E-mail e senha são obrigatórios'
      };
    }

    // Simular delay de rede para UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verificar credenciais
    const credential = ADMIN_CREDENTIALS.find(
      c => (c.email === email.trim().toLowerCase() || c.email === email.trim()) && c.password === password
    );

    if (!credential) {
      return {
        success: false,
        error: 'E-mail ou senha incorretos'
      };
    }

    // Gerar token JWT
    const token = generateToken(credential.user);

    // Armazenar no sessionStorage
    sessionStorage.setItem('admin_token', token);
    sessionStorage.setItem('admin_user', JSON.stringify(credential.user));
    sessionStorage.setItem('admin_role', credential.user.role);
    sessionStorage.setItem('admin_permissions', JSON.stringify(credential.user.permissions));

    // Também salvar no localStorage para persistir entre abas
    localStorage.setItem('admin_authenticated', 'true');
    localStorage.setItem('admin_role', credential.user.role);
    localStorage.setItem('admin_permissions', JSON.stringify(credential.user.permissions));

    return {
      success: true,
      user: credential.user,
      token: token
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return {
      success: false,
      error: 'Erro interno. Tente novamente.'
    };
  }
}

/**
 * Valida se o token JWT ainda é válido
 */
export function isTokenValid(): boolean {
  // Verificar sessionStorage primeiro
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Fallback: verificar localStorage
  return localStorage.getItem('admin_authenticated') === 'true';
}

/**
 * Obtém o usuário admin atualmente autenticado
 */
export function getCurrentAdminUser(): AdminUser | null {
  const userStr = sessionStorage.getItem('admin_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Fallback: criar user básico do localStorage
  if (localStorage.getItem('admin_authenticated') === 'true') {
    return {
      id: 'admin-master-001',
      email: '3dk.print.br@gmail.com',
      role: (localStorage.getItem('admin_role') as any) || 'master',
      permissions: JSON.parse(localStorage.getItem('admin_permissions') || '["dashboard","orcamentos","produtos","usuarios","configuracoes","relatorios"]'),
      createdAt: '2024-01-01T00:00:00Z',
    };
  }

  return null;
}

/**
 * Obtém o token JWT do usuário autenticado
 */
export function getAdminToken(): string | null {
  return sessionStorage.getItem('admin_token');
}

/**
 * Verifica se o usuário tem uma permissão específica
 */
export function hasPermission(permission: string): boolean {
  const user = getCurrentAdminUser();
  if (!user) return false;
  if (user.role === 'master') return true;
  return user.permissions.includes(permission);
}

/**
 * Realiza logout do administrador
 */
export function logoutAdmin(): void {
  sessionStorage.removeItem('admin_token');
  sessionStorage.removeItem('admin_user');
  sessionStorage.removeItem('admin_role');
  sessionStorage.removeItem('admin_permissions');
  localStorage.removeItem('admin_authenticated');
  localStorage.removeItem('admin_role');
  localStorage.removeItem('admin_permissions');
}

/**
 * Atualiza o token quando próximo de expirar
 */
export async function refreshAdminToken(): Promise<boolean> {
  try {
    // Verificar se tem autenticação no localStorage
    if (localStorage.getItem('admin_authenticated') === 'true') {
      const user = getCurrentAdminUser();
      if (user) {
        const token = generateToken(user);
        sessionStorage.setItem('admin_token', token);
        sessionStorage.setItem('admin_user', JSON.stringify(user));
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return false;
  }
}
