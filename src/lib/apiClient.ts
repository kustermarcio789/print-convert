/**
 * Cliente de API - Camada de abstração para comunicação com backend
 * Atualmente usa localStorage, mas pode ser facilmente migrado para API real
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const USE_LOCAL_STORAGE = !API_BASE_URL; // Se não houver URL de API, usa localStorage

/**
 * Configuração de headers padrão
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Função genérica para fazer requisições HTTP
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (USE_LOCAL_STORAGE) {
    // Simular resposta da API usando localStorage
    return simulateAPICall<T>(endpoint, options);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro HTTP: ${response.status}`);
  }

  return response.json();
}

/**
 * Simula chamadas de API usando localStorage
 * Esta função será removida quando migrar para backend real
 */
async function simulateAPICall<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 100));

  const method = options.method || 'GET';
  const [, resource, id] = endpoint.split('/');

  // Simular operações CRUD
  switch (method) {
    case 'GET':
      if (id) {
        return getItem(resource, id) as T;
      }
      return getAll(resource) as T;

    case 'POST':
      const createData = JSON.parse(options.body as string);
      return create(resource, createData) as T;

    case 'PUT':
      const updateData = JSON.parse(options.body as string);
      return update(resource, id!, updateData) as T;

    case 'DELETE':
      return deleteItem(resource, id!) as T;

    default:
      throw new Error(`Método ${method} não suportado`);
  }
}

function getAll(resource: string): any[] {
  const data = localStorage.getItem(resource);
  return data ? JSON.parse(data) : [];
}

function getItem(resource: string, id: string): any {
  const items = getAll(resource);
  return items.find((item: any) => item.id === id) || null;
}

function create(resource: string, data: any): any {
  const items = getAll(resource);
  const newItem = {
    ...data,
    id: data.id || `${resource}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  localStorage.setItem(resource, JSON.stringify(items));
  return newItem;
}

function update(resource: string, id: string, data: any): any {
  const items = getAll(resource);
  const index = items.findIndex((item: any) => item.id === id);
  
  if (index === -1) {
    throw new Error(`Item ${id} não encontrado`);
  }

  items[index] = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(resource, JSON.stringify(items));
  return items[index];
}

function deleteItem(resource: string, id: string): { success: boolean } {
  const items = getAll(resource);
  const filtered = items.filter((item: any) => item.id !== id);
  localStorage.setItem(resource, JSON.stringify(filtered));
  return { success: true };
}

/**
 * API de Orçamentos
 */
export const orcamentosAPI = {
  getAll: () => fetchAPI<any[]>('/orcamentos'),
  
  getById: (id: string) => fetchAPI<any>(`/orcamentos/${id}`),
  
  create: (data: any) => fetchAPI<any>('/orcamentos', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => fetchAPI<any>(`/orcamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => fetchAPI<{ success: boolean }>(`/orcamentos/${id}`, {
    method: 'DELETE',
  }),

  updateStatus: (id: string, status: string) => 
    orcamentosAPI.update(id, { status }),
};

/**
 * API de Usuários
 */
export const usuariosAPI = {
  getAll: () => fetchAPI<any[]>('/usuarios'),
  
  getById: (id: string) => fetchAPI<any>(`/usuarios/${id}`),
  
  create: (data: any) => fetchAPI<any>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => fetchAPI<any>(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => fetchAPI<{ success: boolean }>(`/usuarios/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * API de Prestadores
 */
export const prestadoresAPI = {
  getAll: () => fetchAPI<any[]>('/prestadores'),
  
  getById: (id: string) => fetchAPI<any>(`/prestadores/${id}`),
  
  create: (data: any) => fetchAPI<any>('/prestadores', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => fetchAPI<any>(`/prestadores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => fetchAPI<{ success: boolean }>(`/prestadores/${id}`, {
    method: 'DELETE',
  }),

  approve: (id: string) => prestadoresAPI.update(id, { aprovado: true }),
  
  reject: (id: string) => prestadoresAPI.update(id, { aprovado: false }),
};

/**
 * API de Produtos
 */
export const produtosAPI = {
  getAll: () => fetchAPI<any[]>('/produtos'),
  
  getById: (id: string) => fetchAPI<any>(`/produtos/${id}`),
  
  create: (data: any) => fetchAPI<any>('/produtos', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => fetchAPI<any>(`/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => fetchAPI<{ success: boolean }>(`/produtos/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * API de Autenticação
 */
export const authAPI = {
  login: async (email: string, password: string) => {
    if (USE_LOCAL_STORAGE) {
      // Simulação de login
      if (email === '3dk.print.br@gmail.com' && password === '1A9B8Z5X') {
        const token = 'mock_token_' + Date.now();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_user', JSON.stringify({ email, role: 'admin' }));
        return { success: true, token, user: { email, role: 'admin' } };
      }
      throw new Error('Credenciais inválidas');
    }

    return fetchAPI<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_user');
    return Promise.resolve({ success: true });
  },

  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
    return Promise.resolve({ authenticated: isAuthenticated, token });
  },
};

/**
 * API de Estatísticas
 */
export const statsAPI = {
  getDashboard: async () => {
    const orcamentos = await orcamentosAPI.getAll();
    const usuarios = await usuariosAPI.getAll();
    const prestadores = await prestadoresAPI.getAll();
    const produtos = await produtosAPI.getAll();

    return {
      totalOrcamentos: orcamentos.length,
      orcamentosPendentes: orcamentos.filter((o: any) => o.status === 'pendente').length,
      totalUsuarios: usuarios.length,
      totalPrestadores: prestadores.length,
      prestadoresPendentes: prestadores.filter((p: any) => !p.aprovado).length,
      totalProdutos: produtos.length,
      receitaTotal: orcamentos
        .filter((o: any) => o.status === 'aprovado')
        .reduce((sum: number, o: any) => sum + (o.valor || 0), 0),
    };
  },
};
