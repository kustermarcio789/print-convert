import { supabase } from './supabase';

/**
 * API de Produtos (Supabase)
 */
export const produtosAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
    return data || [];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
    return data;
  },
  
  create: async (data: any) => {
    const { data: result, error } = await supabase
      .from('products')
      .insert([data])
      .select();
    
    if (error) throw error;
    return result[0];
  },
  
  update: async (id: string, data: any) => {
    const { data: result, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return result[0];
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },
};

/**
 * API de Categorias (Supabase)
 */
export const categoriasAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
    return data || [];
  }
};

/**
 * API de Autenticação (Supabase)
 */
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Fallback para login admin estático se o Supabase não estiver configurado
      if (email === '3dk.print.br@gmail.com' && password === '1A9B8Z5X') {
        return { success: true, user: { email, role: 'admin' } };
      }
      throw error;
    }
    return { success: true, user: data.user, session: data.session };
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem('auth_token');
    if (error) throw error;
    return { success: true };
  },
  
  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return { authenticated: !!session, session };
  }
};

/**
 * API de Orçamentos (Simulada ou Supabase)
 */
export const orcamentosAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('orders').select('*');
    return error ? [] : data;
  },
  create: async (data: any) => {
    const { data: result, error } = await supabase
      .from('orders')
      .insert([data])
      .select();
    
    if (error) {
      const orders = JSON.parse(localStorage.getItem('orcamentos') || '[]');
      orders.push({ ...data, id: Date.now().toString(), createdAt: new Date().toISOString() });
      localStorage.setItem('orcamentos', JSON.stringify(orders));
      return { success: true };
    }
    return result[0];
  },
  updateStatus: async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};

/**
 * API de Estatísticas
 */
export const statsAPI = {
  getDashboard: async () => {
    const products = await produtosAPI.getAll();
    const orders = await orcamentosAPI.getAll();
    
    return {
      totalOrcamentos: orders.length,
      orcamentosPendentes: orders.filter((o: any) => o.status === 'pendente').length,
      totalProdutos: products.length,
      receitaTotal: orders
        .filter((o: any) => o.status === 'aprovado')
        .reduce((sum: number, o: any) => sum + (o.valor || 0), 0),
    };
  },
};
