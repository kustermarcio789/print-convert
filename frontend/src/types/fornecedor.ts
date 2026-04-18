import type { EnderecoCorreios, TipoPessoa } from './orcamento';

export type CategoriaFornecedor =
  | 'filamento'
  | 'resina'
  | 'peca'
  | 'equipamento'
  | 'pintura'
  | 'servico'
  | 'embalagem'
  | 'outro';

export type CondicaoPagamento =
  | 'avista'
  | '7d'
  | '15d'
  | '28d'
  | '30d'
  | '30_60'
  | '30_60_90'
  | 'outro';

export interface Fornecedor {
  id?: string;
  tipo: TipoPessoa;
  razao_social: string;
  nome_fantasia?: string;
  cpf_cnpj?: string;
  inscricao_estadual?: string;
  contato_nome?: string;
  contato_cargo?: string;
  email?: string;
  whatsapp?: string;
  telefone?: string;
  endereco: EnderecoCorreios;
  categoria: CategoriaFornecedor;
  condicao_pagamento?: CondicaoPagamento;
  prazo_entrega_padrao_dias?: number;
  site?: string;
  observacoes?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function novoFornecedorVazio(): Fornecedor {
  return {
    tipo: 'PJ',
    razao_social: '',
    endereco: {},
    categoria: 'outro',
    ativo: true,
  };
}

export const CATEGORIAS_FORNECEDOR_LABEL: Record<CategoriaFornecedor, string> = {
  filamento: 'Filamento',
  resina: 'Resina',
  peca: 'Peça / Componente',
  equipamento: 'Equipamento / Impressora',
  pintura: 'Pintura / Tinta',
  servico: 'Serviço',
  embalagem: 'Embalagem',
  outro: 'Outro',
};

export const CONDICOES_PAGAMENTO_LABEL: Record<CondicaoPagamento, string> = {
  avista: 'À vista',
  '7d': '7 dias',
  '15d': '15 dias',
  '28d': '28 dias',
  '30d': '30 dias',
  '30_60': '30/60 dias',
  '30_60_90': '30/60/90 dias',
  outro: 'Outro',
};
