import { supabase } from './supabase';

export interface QuoteInsert {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  service_type: string;
  subtotal?: number;
  shipping_cost?: number;
  total?: number;
  status?: string;
  notes?: string;
}

export interface QuoteItemInsert {
  quote_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const quoteService = {
  async createQuote(quoteData: QuoteInsert, items: QuoteItemInsert[]) {
    // 1. Cria o orçamento
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert(quoteData)
      .select()
      .single();

    if (quoteError) throw new Error(`Erro ao criar orçamento: ${quoteError.message}`);

    // 2. Vincula e insere os itens
    const itemsWithQuoteId = items.map(item => ({
      ...item,
      quote_id: quote.id
    }));

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(itemsWithQuoteId);

    if (itemsError) throw new Error(`Erro ao inserir itens: ${itemsError.message}`);

    return quote;
  },

  // ✨ A Função "Estrela": Converte e dá baixa no estoque automaticamente
  async convertToSaleAndReduceStock(quoteId: string) {
    const { data: items, error: fetchError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId);

    if (fetchError) throw new Error(`Erro ao buscar itens do orçamento: ${fetchError.message}`);
    if (!items || items.length === 0) return false;

    for (const item of items) {
      if (item.product_id) {
        // Busca o estoque atual garantindo consistência
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (!productError && product && product.stock >= item.quantity) {
          const newStock = product.stock - item.quantity;
          
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id);
        }
      }
    }

    // Atualiza o status do orçamento para convertido
    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update({ status: 'convertido' })
      .eq('id', quoteId)
      .select()
      .single();

    if (updateError) throw new Error(`Erro ao converter orçamento: ${updateError.message}`);

    return updatedQuote;
  }
};
