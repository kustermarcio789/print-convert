require('dotenv').config({ path: '/home/ubuntu/print-convert/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDailyQuotes() {
  console.log('--- Verificação Diária de Orçamentos ---');
  console.log(`Data/Hora: ${new Date().toLocaleString('pt-BR')}`);

  // Calcular o timestamp de 24 horas atrás
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  try {
    const { data: orcamentos, error } = await supabase
      .from('orcamentos')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!orcamentos || orcamentos.length === 0) {
      console.log('Nenhum novo orçamento nas últimas 24 horas.');
      return;
    }

    console.log(`Total de novos orçamentos: ${orcamentos.length}`);
    console.log('---------------------------------------');

    let valorTotalEstimado = 0;

    orcamentos.forEach((orc, index) => {
      const detalhes = orc.detalhes || {};
      const valor = detalhes.estimativa || 0;
      valorTotalEstimado += valor;

      console.log(`${index + 1}. Cliente: ${orc.cliente}`);
      console.log(`   E-mail: ${orc.email}`);
      console.log(`   Tipo: ${orc.tipo}`);
      console.log(`   Valor Estimado: R$ ${valor.toFixed(2)}`);
      console.log(`   Data: ${new Date(orc.created_at || orc.data).toLocaleString('pt-BR')}`);
      console.log('---');
    });

    console.log(`VALOR TOTAL ESTIMADO NAS ÚLTIMAS 24H: R$ ${valorTotalEstimado.toFixed(2)}`);
    console.log('---------------------------------------');

  } catch (error) {
    console.error('Erro ao consultar o Supabase:', error.message);
  }
}

checkDailyQuotes();
