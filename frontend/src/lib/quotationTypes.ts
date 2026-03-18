/**
 * Tipos para Sistema de Orçamentos - 3DKPRINT
 */

import type { QuotationItem } from './quotePricingEngine';

// Status possíveis do orçamento
export type QuotationStatus = 'rascunho' | 'pendente' | 'enviado' | 'aprovado' | 'convertido' | 'recusado' | 'cancelado';

// Métodos de pagamento aceitos
export type PaymentMethod = 'pix' | 'boleto' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'dinheiro';

// Interface completa do Orçamento
export interface Quotation {
  // Identificação
  id: string;
  quotation_number: string; // Número formatado ex: ORC-2025-0001
  
  // Datas
  created_at: string;
  updated_at: string;
  issue_date: string;      // Data de emissão
  validity_date: string;   // Data de validade
  
  // Status
  status: QuotationStatus;
  
  // Dados do Cliente
  client_name: string;
  company_name?: string;   // Razão Social (se PJ)
  client_email: string;
  client_phone?: string;
  client_whatsapp?: string;
  client_cpf?: string;
  client_cnpj?: string;
  
  // Endereço (opcional)
  client_address?: string;
  client_city?: string;
  client_state?: string;
  client_zip?: string;
  
  // Tipo de serviço principal
  service_type: 'impressao' | 'modelagem' | 'pintura' | 'manutencao' | 'outro';
  
  // Itens do orçamento
  items: QuotationItem[];
  
  // Valores calculados
  subtotal: number;
  total_discount: number;
  shipping_cost: number;
  final_total: number;
  
  // Condições comerciais
  production_lead_time?: string;  // Prazo de produção
  payment_methods?: PaymentMethod[];
  payment_conditions?: string;    // Ex: "50% entrada + 50% na entrega"
  
  // Observações
  observations?: string;          // Observações visíveis ao cliente
  internal_notes?: string;        // Notas internas (não vão no PDF)
  
  // Arquivo 3D anexado (se houver)
  file_3d_url?: string;
  file_3d_name?: string;
  
  // Metadados
  origin: 'manual' | 'site' | 'whatsapp' | 'email';
  sent_to_client?: boolean;
  sent_at?: string;
}

// Interface para criar novo orçamento
export interface CreateQuotationInput {
  client_name: string;
  company_name?: string;
  client_email: string;
  client_phone?: string;
  client_whatsapp?: string;
  client_cpf?: string;
  client_cnpj?: string;
  client_address?: string;
  client_city?: string;
  client_state?: string;
  client_zip?: string;
  service_type: Quotation['service_type'];
  items: QuotationItem[];
  shipping_cost?: number;
  production_lead_time?: string;
  payment_methods?: PaymentMethod[];
  payment_conditions?: string;
  validity_days?: number; // padrão 15
  observations?: string;
  internal_notes?: string;
  origin?: Quotation['origin'];
}

// Dados da empresa para PDF
export interface CompanyInfo {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  logo_url?: string;
  
  // Dados bancários
  bank_name: string;
  bank_code: string;
  bank_agency: string;
  bank_account: string;
  pix_key: string;
  pix_key_type: 'cnpj' | 'cpf' | 'email' | 'telefone' | 'aleatoria';
  account_holder: string;
}

// Configuração padrão da empresa 3DKPRINT
export const COMPANY_INFO: CompanyInfo = {
  name: '3DKPRINT',
  cnpj: '62.440.010/0001-03',
  address: 'Rua Santo Antonio, Vila Santana',
  city: 'Jacarezinho',
  state: 'PR',
  zip: '86400-000',
  phone: '(43) 9174-1518',
  email: '3dk.print.br@gmail.com',
  website: 'www.3dkprint.com.br',
  logo_url: '/logo.png',
  
  // Dados bancários C6 Bank
  bank_name: 'Banco C6 S.A.',
  bank_code: '336',
  bank_agency: '0001',
  bank_account: '40017048-5',
  pix_key: '62440010000103',
  pix_key_type: 'cnpj',
  account_holder: '62.440.010 JOSE MARCIO KUSTER DE AZEVEDO',
};

// Helper para gerar número de orçamento
export function generateQuotationNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
  return `ORC-${year}-${random}`;
}

// Helper para calcular data de validade
export function calculateValidityDate(days: number = 15): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// Labels para status
export const STATUS_LABELS: Record<QuotationStatus, string> = {
  rascunho: 'Rascunho',
  pendente: 'Pendente',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  convertido: 'Venda Fechada',
  recusado: 'Recusado',
  cancelado: 'Cancelado',
};

// Labels para tipo de serviço
export const SERVICE_TYPE_LABELS: Record<Quotation['service_type'], string> = {
  impressao: 'Impressão 3D',
  modelagem: 'Modelagem 3D',
  pintura: 'Pintura',
  manutencao: 'Manutenção',
  outro: 'Outro',
};

// Labels para métodos de pagamento
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  transferencia: 'Transferência Bancária',
  dinheiro: 'Dinheiro',
};
