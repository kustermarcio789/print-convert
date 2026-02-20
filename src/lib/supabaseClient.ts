import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente - Configure estas no seu .env.local
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas. O sistema usará localStorage como fallback.');
}

// Criar cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  data_cadastro: string;
  ultimo_acesso?: string;
  orcamentos_realizados: number;
  compras_realizadas: number;
  ativo: boolean;
}

export interface Prestador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  servicos: string[];
  bio?: string;
  portfolio_url?: string;
  data_cadastro: string;
  status: 'aguardando_aprovacao' | 'ativo' | 'inativo';
  rating: number;
  total_servicos: number;
  ativo: boolean;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  material?: string;
  imagem_url?: string;
  imagem_storage_path?: string;
  rating: number;
  avaliacoes: number;
  estoque: number;
  ativo: boolean;
  destaque: boolean;
  badge?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface Orcamento {
  id: string;
  usuario_id?: string;
  tipo: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone?: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'concluido';
  valor?: number;
  data_criacao: string;
  data_atualizacao: string;
  detalhes?: Record<string, any>;
  arquivo_url?: string;
  arquivo_storage_path?: string;
  observacoes?: string;
}

export interface Venda {
  id: string;
  usuario_id?: string;
  orcamento_id?: string;
  produto_id?: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  status: 'pendente' | 'pago' | 'enviado' | 'entregue';
  data_venda: string;
  data_entrega?: string;
  observacoes?: string;
}

export interface Producao {
  id: string;
  orcamento_id: string;
  status: 'nao_iniciada' | 'em_progresso' | 'concluida' | 'com_problema';
  data_inicio?: string;
  data_conclusao?: string;
  tempo_impressao_horas?: number;
  material_usado?: string;
  quantidade_material_gramas?: number;
  custo_material?: number;
  observacoes?: string;
  data_criacao: string;
}

export interface InventarioMaterial {
  id: string;
  material: string;
  cor?: string;
  quantidade_gramas: number;
  quantidade_minima: number;
  preco_por_grama: number;
  data_atualizacao: string;
  ativo: boolean;
}

// ============================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================================================

export async function signUpUsuario(email: string, password: string, nome: string, telefone: string) {
  try {
    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          telefone,
        },
      },
    });

    if (authError) throw authError;

    // Criar registro na tabela usuarios
    if (authData.user) {
      const { error: dbError } = await supabase.from('usuarios').insert([
        {
          id: authData.user.id,
          nome,
          email,
          telefone,
          data_cadastro: new Date().toISOString(),
        },
      ]);

      if (dbError) throw dbError;
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return { success: false, error };
  }
}

export async function signInUsuario(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Atualizar último acesso
    if (data.user) {
      await supabase.from('usuarios').update({ ultimo_acesso: new Date().toISOString() }).eq('id', data.user.id);
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error };
  }
}

export async function signOutUsuario() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { success: false, error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
}

// ============================================================================
// FUNÇÕES PARA USUÁRIOS
// ============================================================================

export async function getUsuario(id: string): Promise<Usuario | null> {
  try {
    const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

export async function updateUsuario(id: string, updates: Partial<Usuario>) {
  try {
    const { data, error } = await supabase.from('usuarios').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return { success: false, error };
  }
}

// ============================================================================
// FUNÇÕES PARA ORÇAMENTOS
// ============================================================================

export async function criarOrcamento(orcamento: Omit<Orcamento, 'id' | 'data_criacao' | 'data_atualizacao'>) {
  try {
    const { data, error } = await supabase
      .from('orcamentos')
      .insert([
        {
          ...orcamento,
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    return { success: false, error };
  }
}

export async function getOrcamentos(usuarioId?: string): Promise<Orcamento[]> {
  try {
    let query = supabase.from('orcamentos').select('*');

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    const { data, error } = await query.order('data_criacao', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    return [];
  }
}

export async function updateOrcamento(id: string, updates: Partial<Orcamento>) {
  try {
    const { data, error } = await supabase
      .from('orcamentos')
      .update({ ...updates, data_atualizacao: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    return { success: false, error };
  }
}

export async function deleteOrcamento(id: string) {
  try {
    const { error } = await supabase.from('orcamentos').delete().eq('id', id);
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    return { success: false, error };
  }
}

/**
 * Obter métricas de orçamentos por tipo
 * Usado para o Dashboard com contadores dinâmicos
 */
export async function getOrcamentosMetricas() {
  try {
    const { data, error } = await supabase.from('orcamentos').select('tipo, status');

    if (error) throw error;

    const metricas = {
      total: data?.length || 0,
      pendentes: data?.filter((o: any) => o.status === 'pendente').length || 0,
      aprovados: data?.filter((o: any) => o.status === 'aprovado').length || 0,
      recusados: data?.filter((o: any) => o.status === 'recusado').length || 0,
      concluidos: data?.filter((o: any) => o.status === 'concluido').length || 0,
      porTipo: {
        impressao: data?.filter((o: any) => o.tipo === 'impressao').length || 0,
        modelagem: data?.filter((o: any) => o.tipo === 'modelagem').length || 0,
        pintura: data?.filter((o: any) => o.tipo === 'pintura').length || 0,
        manutencao: data?.filter((o: any) => o.tipo === 'manutencao').length || 0,
      },
    };

    return metricas;
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return {
      total: 0,
      pendentes: 0,
      aprovados: 0,
      recusados: 0,
      concluidos: 0,
      porTipo: { impressao: 0, modelagem: 0, pintura: 0, manutencao: 0 },
    };
  }
}

/**
 * Inscrever-se em mudanças de orçamentos em tempo real
 */
export function subscribeOrcamentos(callback: (payload: any) => void) {
  return supabase
    .channel('orcamentos-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orcamentos',
      },
      callback
    )
    .subscribe();
}

// ============================================================================
// FUNÇÕES PARA UPLOAD DE ARQUIVOS
// ============================================================================

export async function uploadArquivo(bucket: string, path: string, file: File) {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw error;

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return { success: true, path: data.path, publicUrl: publicUrlData.publicUrl };
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return { success: false, error };
  }
}

export async function deleteArquivo(bucket: string, path: string) {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return { success: false, error };
  }
}

// ============================================================================
// FUNÇÕES PARA PRODUTOS
// ============================================================================

export async function getProdutos(): Promise<Produto[]> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('data_criacao', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

export async function getProduto(id: string): Promise<Produto | null> {
  try {
    const { data, error } = await supabase.from('produtos').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
}

export async function criarProduto(produto: Omit<Produto, 'id' | 'data_criacao' | 'data_atualizacao'>) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert([
        {
          ...produto,
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return { success: false, error };
  }
}

export async function updateProduto(id: string, updates: Partial<Produto>) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .update({ ...updates, data_atualizacao: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return { success: false, error };
  }
}

export async function deleteProduto(id: string) {
  try {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return { success: false, error };
  }
}

/**
 * Excluir todos os produtos (para testes)
 */
export async function deleteAllProdutos() {
  try {
    const { error } = await supabase.from('produtos').delete().neq('id', '');
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir todos os produtos:', error);
    return { success: false, error };
  }
}

/**
 * Inscrever-se em mudanças de produtos em tempo real
 */
export function subscribeProdutos(callback: (payload: any) => void) {
  return supabase
    .channel('produtos-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'produtos',
      },
      callback
    )
    .subscribe();
}

// ============================================================================
// FUNÇÕES PARA PRESTADORES
// ============================================================================

export async function getPrestadores(): Promise<Prestador[]> {
  try {
    const { data, error } = await supabase
      .from('prestadores')
      .select('*')
      .eq('status', 'ativo')
      .order('data_cadastro', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar prestadores:', error);
    return [];
  }
}

export async function criarPrestador(prestador: Omit<Prestador, 'id' | 'data_cadastro' | 'rating' | 'total_servicos'>) {
  try {
    const { data, error } = await supabase
      .from('prestadores')
      .insert([
        {
          ...prestador,
          data_cadastro: new Date().toISOString(),
          rating: 0,
          total_servicos: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar prestador:', error);
    return { success: false, error };
  }
}

/**
 * Excluir prestador com reatividade imediata
 */
export async function deletePrestador(id: string) {
  try {
    const { error } = await supabase.from('prestadores').delete().eq('id', id);
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar prestador:', error);
    return { success: false, error };
  }
}

// ============================================================================
// FUNÇÕES PARA INVENTÁRIO
// ============================================================================

export async function getInventarioMateriais(): Promise<InventarioMaterial[]> {
  try {
    const { data, error } = await supabase
      .from('inventario_materiais')
      .select('*')
      .eq('ativo', true)
      .order('material');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar inventário:', error);
    return [];
  }
}

export async function updateInventarioMaterial(id: string, updates: Partial<InventarioMaterial>) {
  try {
    const { data, error } = await supabase
      .from('inventario_materiais')
      .update({ ...updates, data_atualizacao: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar inventário:', error);
    return { success: false, error };
  }
}

/**
 * Excluir material com reatividade imediata
 */
export async function deleteMaterial(id: string) {
  try {
    const { error } = await supabase.from('inventario_materiais').delete().eq('id', id);
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar material:', error);
    return { success: false, error };
  }
}

/**
 * Inscrever-se em mudanças de materiais em tempo real
 */
export function subscribeMateriais(callback: (payload: any) => void) {
  return supabase
    .channel('materiais-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inventario_materiais',
      },
      callback
    )
    .subscribe();
}

// ============================================================================
// FUNÇÕES PARA CONFIGURAÇÕES
// ============================================================================

export async function getConfiguracao(chave: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', chave)
      .single();

    if (error) throw error;
    return data?.valor || null;
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return null;
  }
}

export async function updateConfiguracao(chave: string, valor: string) {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .update({ valor, data_atualizacao: new Date().toISOString() })
      .eq('chave', chave)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return { success: false, error };
  }
}
