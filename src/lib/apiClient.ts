import { humanize } from './utils';
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
  
  getById: async (id: string | number) => {
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

  getByBrand: async (brand: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('brand', `%${brand}%`)
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar produtos por marca:', error);
      return [];        
    }
    return data || [];
  },
  
  create: async (data: any) => {
    const { data: result, error } = await supabase
      .from('products')
      .insert([data])
      .select();
    
    if (error) throw error;
    return result[0];
  },
  
  update: async (id: string | number, data: any) => {
    const { data: result, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return result[0];
  },
  
  delete: async (id: string | number) => {
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
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },
  
  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return { authenticated: !!session, session: session };
  }
};

/**
 * API de Orçamentos (Supabase)
 */
export const orcamentosAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('orcamentos').select('*');
    if (error) {
      console.error('Erro ao buscar orçamentos:', error);
      return [];
    }
    return data || [];
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('orcamentos').select('*').eq('id', id).single();
    if (error) {
      console.error('Erro ao buscar orçamento:', error);
      return null;
    }
    return data;
  },
  create: async (data: any) => {
    const { data: result, error } = await supabase.from('orcamentos').insert([data]).select();
    if (error) throw error;
    return result[0];
  },
  update: async (id: string, data: any) => {
    const { data: result, error } = await supabase.from('orcamentos').update(data).eq('id', id).select();
    if (error) throw error;
    return result[0];
  },
  updateStatus: async (id: string, status: string) => {
    const { error } = await supabase.from('orcamentos').update({ status }).eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('orcamentos').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};

/**
 * API de Prestadores (Supabase)
 */
export const prestadoresAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('prestadores').select('*');
    if (error) {
      console.error('Erro ao buscar prestadores:', error);
      return [];
    }
    return data || [];
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('prestadores').select('*').eq('id', id).single();
    if (error) {
      console.error('Erro ao buscar prestador:', error);
      return null;
    }
    return data;
  },
  create: async (data: any) => {
    const { data: result, error } = await supabase.from('prestadores').insert([data]).select();
    if (error) throw error;
    return result[0];
  },
  update: async (id: string, data: any) => {
    const { data: result, error } = await supabase.from('prestadores').update(data).eq('id', id).select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('prestadores').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};

/**
 * API de Usuários (Supabase)
 */
export const usuariosAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
    return data || [];
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();
    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
    return data;
  },
  create: async (data: any) => {
    const { data: result, error } = await supabase.from('usuarios').insert([data]).select();
    if (error) throw error;
    return result[0];
  },
  update: async (id: string, data: any) => {
    const { data: result, error } = await supabase.from('usuarios').update(data).eq('id', id).select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};

/**
 * API de Vendas (Supabase)
 */
export const vendasAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('vendas').select('*');
    if (error) {
      console.error('Erro ao buscar vendas:', error);
      return [];
    }
    return data || [];
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('vendas').select('*').eq('id', id).single();
    if (error) {
      console.error('Erro ao buscar venda:', error);
      return null;
    }
    return data;
  },
  create: async (data: any) => {
    const { data: result, error } = await supabase.from('vendas').insert([data]).select();
    if (error) throw error;
    return result[0];
  },
  update: async (id: string, data: any) => {
    const { data: result, error } = await supabase.from('vendas').update(data).eq('id', id).select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('vendas').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};

/**
 * API de Estoque (Supabase)
 */
export const estoqueAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('estoque').select('*');
    if (error) {
      console.error('Erro ao buscar estoque:', error);
      return [];
    }
    return data || [];
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('estoque').select('*').eq('id', id).single();
    if (error) {
      console.error('Erro ao buscar item de estoque:', error);
      return null;
    }
    return data;
  },
  create: async (data: any) => {
    const { data: result, error } = await supabase.from('estoque').insert([data]).select();
    if (error) throw error;
    return result[0];
  },
  update: async (id: string, data: any) => {
    const { data: result, error } = await supabase.from('estoque').update(data).eq('id', id).select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('estoque').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};

/**
 * API de Produção (Supabase)
 */
export const producaoAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('producao').select('*');
    if (error) {
      console.error('Erro ao buscar produções:', error);
      return [];
    }
    return data || [];
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('producao').select('*').eq('id', id).single();
    if (error) {
      console.error('Erro ao buscar produção:', error);
      return null;
    }
    return data;
  },
  create: async (data: any) => {
    const { data: result, error } = await supabase.from('producao').insert([data]).select();
    if (error) throw error;
    return result[0];
  },
  update: async (id: string, data: any) => {
    const { data: result, error } = await supabase.from('producao').update(data).eq('id', id).select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('producao').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};

/**
 * API de Relatórios (Supabase)
 */
export const relatoriosAPI = {
  getSummary: async (periodo: string) => {
    // Esta é uma implementação simplificada. Em um cenário real, você faria consultas mais complexas
    // para agregar dados de vendas, orçamentos e produção com base no período.
    const { data: vendasData, error: vendasError } = await supabase.from('vendas').select('*');
    const { data: orcamentosData, error: orcamentosError } = await supabase.from('orcamentos').select('*');
    const { data: producaoData, error: producaoError } = await supabase.from('producao').select('*');

    if (vendasError || orcamentosError || producaoError) {
      console.error('Erro ao buscar dados para relatórios:', vendasError || orcamentosError || producaoError);
      return null;
    }

    const totalVendas = vendasData?.reduce((sum: number, venda: any) => sum + (venda.valor_total || 0), 0) || 0;
    const totalOrcamentos = orcamentosData?.length || 0;
    const totalProducao = producaoData?.length || 0;

    // Exemplo de dados para gráficos (precisaria de lógica real de agregação)
    const vendasPorMes = [
      { mes: 'Jan', valor: 1200 }, { mes: 'Fev', valor: 1900 }, { mes: 'Mar', valor: 1500 },
      { mes: 'Abr', valor: 2200 }, { mes: 'Mai', valor: 2500 }, { mes: 'Jun', valor: 1800 },
    ];
    const statusOrcamentos = [
      { status: 'pendente', count: orcamentosData?.filter((o: any) => o.status === 'pendente').length || 0 },
      { status: 'aprovado', count: orcamentosData?.filter((o: any) => o.status === 'aprovado').length || 0 },
      { status: 'recusado', count: orcamentosData?.filter((o: any) => o.status === 'recusado').length || 0 },
    ];

    return {
      totalVendas,
      totalOrcamentos,
      totalProducao,
      vendasPorMes,
      statusOrcamentos,
    };
  },
};

/**
 * API de Leads (Supabase)
 */
export const leadsAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('leads').select('*');
    if (error) {
      console.error('Erro ao buscar leads:', error);
      return [];
    }
    return data || [];
  },
  create: async (data: any) => {
    const { data: result, error } = await supabase.from('leads').insert([data]).select();
    if (error) throw error;
    return result[0];
  },
  update: async (id: string, data: any) => {
    const { data: result, error } = await supabase.from('leads').update(data).eq('id', id).select();
    if (error) throw error;
    return result[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};

/**
 * API de Tráfego (Simulada ou Supabase)
 */
export const trafficAPI = {
  getDashboardStats: async () => {
    // Simulação de dados de tráfego
    return {
      onlineNow: Math.floor(Math.random() * 10) + 1, // 1-10 online
      today: Math.floor(Math.random() * 500) + 100, // 100-600 hoje
      thisMonth: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 este mês
      trafficSources: [
        { source: 'Direto', visits: Math.floor(Math.random() * 200) + 50 },
        { source: 'Google', visits: Math.floor(Math.random() * 150) + 30 },
        { source: 'Instagram', visits: Math.floor(Math.random() * 100) + 20 },
        { source: 'Facebook', visits: Math.floor(Math.random() * 80) + 10 },
      ],
      topPages: [
        { page: 'Início', visits: Math.floor(Math.random() * 100) + 20 },
        { page: 'Catálogo', visits: Math.floor(Math.random() * 50) + 10 },
        { page: '/admin', visits: Math.floor(Math.random() * 30) + 5 },
        { page: '/produtos/xyz', visits: Math.floor(Math.random() * 20) + 5 },
      ],
      geoStates: [
        { state: 'São Paulo', visits: Math.floor(Math.random() * 100) + 10 },
        { state: 'Rio de Janeiro', visits: Math.floor(Math.random() * 70) + 5 },
        { state: 'Minas Gerais', visits: Math.floor(Math.random() * 50) + 5 },
      ],
      geoCities: [
        { city: 'São Paulo', visits: Math.floor(Math.random() * 50) + 10 },
        { city: 'Rio de Janeiro', visits: Math.floor(Math.random() * 30) + 5 },
        { city: 'Belo Horizonte', visits: Math.floor(Math.random() * 20) + 5 },
      ],
    };
  },
};
