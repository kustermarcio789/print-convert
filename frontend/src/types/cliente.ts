import type { EnderecoCorreios, TipoPessoa } from './orcamento';

export type TagCliente = 'VIP' | 'Recorrente' | 'Problema' | 'Prospect' | 'Revendedor';

export interface Cliente {
  id?: string;
  tipo: TipoPessoa;
  nome: string;
  nome_fantasia?: string;
  cpf_cnpj?: string;
  rg_ie?: string;
  email?: string;
  whatsapp?: string;
  telefone?: string;
  endereco: EnderecoCorreios;
  tags?: TagCliente[];
  observacoes?: string;
  origem?: 'manual' | 'site' | 'importado';
  ativo?: boolean;
  total_orcamentos?: number;
  total_vendas?: number;
  valor_total_gasto?: number;
  ultima_compra?: string;
  created_at?: string;
  updated_at?: string;
}

export function novoClienteVazio(tipo: TipoPessoa = 'PF'): Cliente {
  return {
    tipo,
    nome: '',
    endereco: {},
    tags: [],
    origem: 'manual',
    ativo: true,
  };
}

export function nomeExibicaoCliente(c: Cliente): string {
  if (c.tipo === 'PJ' && c.nome_fantasia) {
    return `${c.nome_fantasia} (${c.nome})`;
  }
  return c.nome;
}
