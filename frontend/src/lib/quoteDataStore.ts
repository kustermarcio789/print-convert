/**
 * Data Store para Orçamentos com Suporte a Múltiplos Itens
 * Gerencia itens de orçamento com arquivo STL e detalhes técnicos
 */

export interface QuoteItem {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'fdm' | 'resina';
  material: string;
  cor: string;
  quantidade: number;
  preenchimento?: number; // Percentual de preenchimento
  arquivo?: {
    nome: string;
    tamanho: number;
    url: string; // URL ou base64 do arquivo STL
    tipo: string;
  };
  observacoes?: string;
  valorEstimado?: number;
  createdAt: string;
}

export interface Quote {
  id: string;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string;
  clienteCPF?: string;
  clienteCNPJ?: string;
  itens: QuoteItem[];
  observacoesGerais?: string;
  valorTotal: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  createdAt: string;
  updatedAt: string;
}

/**
 * Cria um novo item de orçamento
 */
export function criarNovoItem(): QuoteItem {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nome: '',
    descricao: '',
    categoria: 'fdm',
    material: 'pla',
    cor: 'branco',
    quantidade: 1,
    preenchimento: 20,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Cria um novo orçamento vazio
 */
export function criarNovoOrcamento(): Quote {
  return {
    id: `ORC-${Date.now()}`,
    clienteNome: '',
    clienteEmail: '',
    clienteTelefone: '',
    itens: [criarNovoItem()],
    valorTotal: 0,
    status: 'rascunho',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Salva orçamento em localStorage
 */
export function salvarOrcamentoRascunho(orcamento: Quote): void {
  const rascunhos = JSON.parse(localStorage.getItem('orcamentos_rascunho') || '[]');
  const index = rascunhos.findIndex((o: Quote) => o.id === orcamento.id);
  
  if (index >= 0) {
    rascunhos[index] = orcamento;
  } else {
    rascunhos.push(orcamento);
  }
  
  localStorage.setItem('orcamentos_rascunho', JSON.stringify(rascunhos));
}

/**
 * Carrega orçamento rascunho do localStorage
 */
export function carregarOrcamentoRascunho(id: string): Quote | null {
  const rascunhos = JSON.parse(localStorage.getItem('orcamentos_rascunho') || '[]');
  return rascunhos.find((o: Quote) => o.id === id) || null;
}

/**
 * Finaliza orçamento (move de rascunho para enviado)
 */
export function finalizarOrcamento(orcamento: Quote): Quote {
  const finalizado = {
    ...orcamento,
    status: 'enviado' as const,
    updatedAt: new Date().toISOString(),
  };
  
  // Salvar em orçamentos finalizados
  const orcamentos = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  orcamentos.push(finalizado);
  localStorage.setItem('orcamentos', JSON.stringify(orcamentos));
  
  // Remover de rascunhos
  const rascunhos = JSON.parse(localStorage.getItem('orcamentos_rascunho') || '[]');
  const novoRascunho = rascunhos.filter((o: Quote) => o.id !== orcamento.id);
  localStorage.setItem('orcamentos_rascunho', JSON.stringify(novoRascunho));
  
  return finalizado;
}

/**
 * Calcula valor total do orçamento
 */
export function calcularValorTotal(itens: QuoteItem[]): number {
  return itens.reduce((total, item) => {
    return total + (item.valorEstimado || 0);
  }, 0);
}

/**
 * Adiciona novo item ao orçamento
 */
export function adicionarItem(orcamento: Quote): Quote {
  return {
    ...orcamento,
    itens: [...orcamento.itens, criarNovoItem()],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Remove item do orçamento
 */
export function removerItem(orcamento: Quote, itemId: string): Quote {
  return {
    ...orcamento,
    itens: orcamento.itens.filter(item => item.id !== itemId),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Atualiza item do orçamento
 */
export function atualizarItem(orcamento: Quote, itemId: string, atualizacoes: Partial<QuoteItem>): Quote {
  return {
    ...orcamento,
    itens: orcamento.itens.map(item =>
      item.id === itemId ? { ...item, ...atualizacoes } : item
    ),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Exporta orçamento como JSON para enviar ao admin
 */
export function exportarOrcamentoJSON(orcamento: Quote): string {
  return JSON.stringify(orcamento, null, 2);
}

/**
 * Valida se o orçamento está completo
 */
export function validarOrcamento(orcamento: Quote): { valido: boolean; erros: string[] } {
  const erros: string[] = [];
  
  if (!orcamento.clienteNome) erros.push('Nome do cliente é obrigatório');
  if (!orcamento.clienteEmail) erros.push('Email do cliente é obrigatório');
  if (!orcamento.clienteTelefone) erros.push('Telefone do cliente é obrigatório');
  
  if (orcamento.itens.length === 0) {
    erros.push('Adicione pelo menos um item ao orçamento');
  }
  
  orcamento.itens.forEach((item, index) => {
    if (!item.nome) erros.push(`Item ${index + 1}: Nome é obrigatório`);
    if (!item.material) erros.push(`Item ${index + 1}: Material é obrigatório`);
    if (!item.arquivo && !item.descricao) {
      erros.push(`Item ${index + 1}: Arquivo STL ou descrição é obrigatório`);
    }
  });
  
  return {
    valido: erros.length === 0,
    erros,
  };
}
