import { supabase } from './supabase';

export const vendasAPI = {
  converterOrcamento: async (orcamentoId: string) => {
    // 1. Busca os itens do orçamento
    const { data: itens, error: itensError } = await supabase
      .from('quote_items')
      .select('*, products(stock, name)')
      .eq('quote_id', orcamentoId);

    if (itensError || !itens) throw new Error('Orçamento não encontrado ou sem itens.');

    // 2. Verifica se há estoque suficiente para todos os itens
    for (const item of itens) {
      if (item.product_id && item.products) {
        if (item.products.stock < item.quantity) {
          throw new Error(`Estoque insuficiente para o produto: ${item.products.name}`);
        }
      }
    }

    // 3. Dá baixa no estoque
    for (const item of itens) {
      if (item.product_id && item.products) {
        await supabase
          .from('products')
          .update({ stock: item.products.stock - item.quantity })
          .eq('id', item.product_id);
      }
    }

    // 4. Atualiza o status do orçamento para 'convertido'
    await supabase
      .from('quotes')
      .update({ status: 'convertido' })
      .eq('id', orcamentoId);

    // 5. Cria a venda (Puxando o total do orçamento)
    const { data: quote } = await supabase.from('quotes').select('total, payment_method').eq('id', orcamentoId).single();
    
    if (quote) {
      await supabase.from('sales').insert({
        quote_id: orcamentoId,
        total: quote.total,
        payment_method: quote.payment_method || 'A definir',
        status: 'pago'
      });
    }

    return true;
  }
};
