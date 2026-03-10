import { supabase } from './supabase';

export const quoteService = {
  // Cria o orçamento junto com os itens
  async createQuote(quoteData: any, items: any[]) {
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert(quoteData)
      .select()
      .single();
      
    if (quoteError) throw quoteError;
    
    const itemsWithQuoteId = items.map(item => ({ 
      ...item, 
      quote_id: quote.id 
    }));
    
    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(itemsWithQuoteId);

    if (itemsError) throw itemsError;
    
    return quote;
  },

  // A função estrela do projeto antigo: Conversão e Baixa de Estoque
  async convertToSaleAndReduceStock(quoteId: string) {
    // 1. Busca os itens do orçamento
    const { data: items } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId);

    if (!items) return false;

    // 2. Dá baixa no estoque automaticamente para cada produto
    for (const item of items) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();
          
        if (product && product.stock >= item.quantity) {
          await supabase
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    // 3. Muda o status do orçamento
    const { data, error } = await supabase
      .from('quotes')
      .update({ status: 'convertido' })
      .eq('id', quoteId)
      .select();

    if (error) throw error;
    return data;
  }
};
