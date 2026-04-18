export type TipoPessoa = 'PF' | 'PJ';

export type StatusOrcamento = 'pendente' | 'aprovado' | 'em_producao' | 'convertido' | 'recusado' | 'cancelado';

export type OrigemItem = 'catalogo' | 'manual';

export type ModalidadeEnvio = 'SEDEX' | 'PAC' | 'Transportadora' | 'Retirada' | 'Motoboy';

export interface OrcamentoItem {
  id: string;
  ordem: number;
  origem: OrigemItem;
  produto_id?: string;
  nome: string;
  descricao: string;
  imagem_principal?: string;
  imagens?: string[];
  material?: string;
  cor?: string;
  acabamento?: string;
  largura_mm?: number;
  altura_mm?: number;
  profundidade_mm?: number;
  peso_g?: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  observacoes?: string;
}

export interface EnderecoCorreios {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  ponto_referencia?: string;
}

export interface DadosEnvio {
  modalidade?: ModalidadeEnvio | string;
  valor_frete?: number;
  prazo_dias?: number;
  codigo_rastreio?: string;
  transportadora?: string;
}

export interface OrcamentoV2 {
  id?: string;
  numero?: string;
  cliente_id?: string;
  cliente_tipo: TipoPessoa;
  cliente_nome: string;
  cliente_email: string;
  cliente_whatsapp: string;
  cliente_telefone?: string;
  cliente_cpf_cnpj?: string;
  endereco: EnderecoCorreios;
  envio: DadosEnvio;
  itens: OrcamentoItem[];
  subtotal: number;
  desconto_percentual: number;
  desconto_valor: number;
  valor_total: number;
  status: StatusOrcamento;
  prazo_producao_dias?: number;
  observacoes_internas?: string;
  observacoes_cliente?: string;
  validade_dias: number;
  created_at?: string;
  updated_at?: string;
  origem?: 'manual' | 'site' | 'whatsapp' | 'email';
}

export function novoItemVazio(ordem: number): OrcamentoItem {
  return {
    id: crypto.randomUUID(),
    ordem,
    origem: 'manual',
    nome: '',
    descricao: '',
    quantidade: 1,
    valor_unitario: 0,
    valor_total: 0,
  };
}

export function calcularSubtotal(itens: OrcamentoItem[]): number {
  return itens.reduce((acc, it) => acc + (it.valor_unitario * it.quantidade), 0);
}

export function calcularTotal(subtotal: number, frete: number, descontoPercentual: number): { desconto_valor: number; total: number } {
  const base = subtotal + frete;
  const desconto_valor = base * (descontoPercentual / 100);
  return { desconto_valor, total: base - desconto_valor };
}

export function novoOrcamentoVazio(): OrcamentoV2 {
  return {
    cliente_tipo: 'PF',
    cliente_nome: '',
    cliente_email: '',
    cliente_whatsapp: '',
    endereco: {},
    envio: {},
    itens: [novoItemVazio(0)],
    subtotal: 0,
    desconto_percentual: 0,
    desconto_valor: 0,
    valor_total: 0,
    status: 'pendente',
    validade_dias: 15,
  };
}
