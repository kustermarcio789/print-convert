import { supabase } from './supabaseClient';

/**
 * Cliente para gerenciar produtos com hierarquia Marca -> Modelo -> Tipo
 */

// ============================================================================
// MARCAS
// ============================================================================

export async function getMarcas() {
  try {
    const { data, error } = await supabase
      .from('marcas')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar marcas:', error);
    return [];
  }
}

export async function criarMarca(marca: { nome: string; descricao?: string; logo_url?: string }) {
  try {
    const { data, error } = await supabase
      .from('marcas')
      .insert([marca])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar marca:', error);
    return { success: false, error };
  }
}

export async function deleteMarca(id: string) {
  try {
    const { error } = await supabase.from('marcas').delete().eq('id', id);
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar marca:', error);
    return { success: false, error };
  }
}

// ============================================================================
// MODELOS
// ============================================================================

export async function getModelos(marcaId?: string) {
  try {
    let query = supabase.from('modelos').select('*').eq('ativo', true);

    if (marcaId) {
      query = query.eq('marca_id', marcaId);
    }

    const { data, error } = await query.order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar modelos:', error);
    return [];
  }
}

export async function criarModelo(modelo: {
  marca_id: string;
  nome: string;
  descricao?: string;
  especificacoes?: Record<string, any>;
}) {
  try {
    const { data, error } = await supabase
      .from('modelos')
      .insert([modelo])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar modelo:', error);
    return { success: false, error };
  }
}

export async function deleteModelo(id: string) {
  try {
    const { error } = await supabase.from('modelos').delete().eq('id', id);
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar modelo:', error);
    return { success: false, error };
  }
}

// ============================================================================
// TIPOS DE PRODUTOS
// ============================================================================

export async function getTiposProdutos() {
  try {
    const { data, error } = await supabase
      .from('tipos_produtos')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar tipos de produtos:', error);
    return [];
  }
}

export async function criarTipoProduto(tipo: {
  nome: string;
  descricao?: string;
  categoria?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('tipos_produtos')
      .insert([tipo])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar tipo de produto:', error);
    return { success: false, error };
  }
}

export async function deleteTipoProduto(id: string) {
  try {
    const { error } = await supabase.from('tipos_produtos').delete().eq('id', id);
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar tipo de produto:', error);
    return { success: false, error };
  }
}

// ============================================================================
// PRODUTOS (V2 - COM HIERARQUIA)
// ============================================================================

export async function getProdutosV2(filtros?: {
  marcaId?: string;
  modeloId?: string;
  tipoId?: string;
  categoria?: string;
}) {
  try {
    let query = supabase
      .from('produtos_v2')
      .select(
        `
        *,
        marca:marcas(id, nome),
        modelo:modelos(id, nome),
        tipo:tipos_produtos(id, nome, categoria)
      `
      )
      .eq('ativo', true)
      .eq('visivel', true);

    if (filtros?.marcaId) {
      query = query.eq('marca_id', filtros.marcaId);
    }

    if (filtros?.modeloId) {
      query = query.eq('modelo_id', filtros.modeloId);
    }

    if (filtros?.tipoId) {
      query = query.eq('tipo_id', filtros.tipoId);
    }

    const { data, error } = await query.order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

export async function criarProdutoV2(produto: {
  marca_id?: string;
  modelo_id?: string;
  tipo_id: string;
  nome: string;
  descricao?: string;
  descricao_longa?: string;
  preco: number;
  preco_custo?: number;
  sku?: string;
  estoque?: number;
  estoque_minimo?: number;
  imagem_principal_url?: string;
  especificacoes?: Record<string, any>;
  compatibilidades?: string[];
}) {
  try {
    const { data, error } = await supabase
      .from('produtos_v2')
      .insert([produto])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return { success: false, error };
  }
}

export async function updateProdutoV2(id: string, updates: Record<string, any>) {
  try {
    const { data, error } = await supabase
      .from('produtos_v2')
      .update(updates)
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

export async function deleteProdutoV2(id: string) {
  try {
    const { error } = await supabase.from('produtos_v2').delete().eq('id', id);
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return { success: false, error };
  }
}

// ============================================================================
// VARIAÇÕES DE PRODUTOS
// ============================================================================

export async function getVariacoesProduto(produtoId: string) {
  try {
    const { data, error } = await supabase
      .from('produto_variacoes')
      .select('*')
      .eq('produto_id', produtoId)
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar variações:', error);
    return [];
  }
}

export async function criarVariacao(variacao: {
  produto_id: string;
  nome: string;
  valor: string;
  sku_variacao?: string;
  preco_adicional?: number;
  estoque?: number;
  imagem_url?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('produto_variacoes')
      .insert([variacao])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar variação:', error);
    return { success: false, error };
  }
}

export async function deleteVariacao(id: string) {
  try {
    const { error } = await supabase.from('produto_variacoes').delete().eq('id', id);
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar variação:', error);
    return { success: false, error };
  }
}

// ============================================================================
// COMPATIBILIDADES
// ============================================================================

export async function getCompatibilidadesProduto(produtoId: string) {
  try {
    const { data, error } = await supabase
      .from('produto_compatibilidades')
      .select('modelo:modelos(id, nome)')
      .eq('produto_id', produtoId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar compatibilidades:', error);
    return [];
  }
}

export async function adicionarCompatibilidade(produtoId: string, modeloId: string) {
  try {
    const { data, error } = await supabase
      .from('produto_compatibilidades')
      .insert([{ produto_id: produtoId, modelo_id: modeloId }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao adicionar compatibilidade:', error);
    return { success: false, error };
  }
}

export async function removerCompatibilidade(produtoId: string, modeloId: string) {
  try {
    const { error } = await supabase
      .from('produto_compatibilidades')
      .delete()
      .eq('produto_id', produtoId)
      .eq('modelo_id', modeloId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao remover compatibilidade:', error);
    return { success: false, error };
  }
}

// ============================================================================
// VIEWS / RELATÓRIOS
// ============================================================================

export async function getProdutosBaixoEstoque() {
  try {
    const { data, error } = await supabase
      .from('produtos_baixo_estoque')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos com baixo estoque:', error);
    return [];
  }
}

export async function getProdutosBestsellers() {
  try {
    const { data, error } = await supabase
      .from('produtos_bestsellers')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar bestsellers:', error);
    return [];
  }
}

export async function getProdutosCompletos() {
  try {
    const { data, error } = await supabase
      .from('produtos_completos')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos completos:', error);
    return [];
  }
}
