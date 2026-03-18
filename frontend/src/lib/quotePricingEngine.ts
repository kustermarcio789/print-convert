/**
 * Motor de Cálculos de Orçamento - 3DKPRINT
 * Funções utilitárias para cálculos de preços consistentes
 */

export interface QuotationItem {
  id: string;
  product_id?: string | null; // null para itens manuais
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number; // valor absoluto de desconto por linha
  total_price: number; // calculado: (quantity * unit_price) - discount_amount
}

export interface QuotationTotals {
  subtotal: number;        // soma de (quantity * unit_price) de todos os itens
  total_discount: number;  // soma de todos os discount_amount
  final_total: number;     // subtotal - total_discount
}

/**
 * Arredonda valor monetário para 2 casas decimais
 */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calcula o valor base da linha (quantity * unit_price)
 */
export function calculateLineBase(quantity: number, unit_price: number): number {
  const qty = Math.max(0, Number(quantity) || 0);
  const price = Math.max(0, Number(unit_price) || 0);
  return roundMoney(qty * price);
}

/**
 * Calcula o total da linha (line_base - discount_amount)
 */
export function calculateLineTotal(quantity: number, unit_price: number, discount_amount: number): number {
  const lineBase = calculateLineBase(quantity, unit_price);
  const discount = Math.max(0, Math.min(lineBase, Number(discount_amount) || 0));
  return roundMoney(lineBase - discount);
}

/**
 * Calcula todos os totais do orçamento a partir dos itens
 */
export function calculateQuotationTotals(items: QuotationItem[]): QuotationTotals {
  let subtotal = 0;
  let total_discount = 0;

  for (const item of items) {
    const lineBase = calculateLineBase(item.quantity, item.unit_price);
    const discount = Math.max(0, Math.min(lineBase, Number(item.discount_amount) || 0));
    
    subtotal += lineBase;
    total_discount += discount;
  }

  return {
    subtotal: roundMoney(subtotal),
    total_discount: roundMoney(total_discount),
    final_total: roundMoney(subtotal - total_discount),
  };
}

/**
 * Recalcula o total_price de um item baseado nos outros campos
 */
export function recalculateItemTotal(item: Partial<QuotationItem>): number {
  return calculateLineTotal(
    item.quantity ?? 0,
    item.unit_price ?? 0,
    item.discount_amount ?? 0
  );
}

/**
 * Cria um novo item de orçamento vazio
 */
export function createEmptyQuotationItem(): QuotationItem {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    product_id: null,
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    total_price: 0,
  };
}

/**
 * Valida se um item está completo o suficiente para ser salvo
 */
export function validateQuotationItem(item: QuotationItem): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.name || item.name.trim() === '') {
    errors.push('Nome do item é obrigatório');
  }

  if (item.quantity <= 0) {
    errors.push('Quantidade deve ser maior que zero');
  }

  if (item.unit_price < 0) {
    errors.push('Preço unitário não pode ser negativo');
  }

  if (item.discount_amount < 0) {
    errors.push('Desconto não pode ser negativo');
  }

  const lineBase = calculateLineBase(item.quantity, item.unit_price);
  if (item.discount_amount > lineBase) {
    errors.push('Desconto não pode ser maior que o valor da linha');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formata valor para exibição em BRL
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Parse de string para número, retornando 0 se inválido
 */
export function parseNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === '') return 0;
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  return isNaN(num) ? 0 : num;
}
