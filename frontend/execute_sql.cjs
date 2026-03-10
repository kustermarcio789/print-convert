const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
-- Tabela de Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de leads" ON leads;
CREATE POLICY "Leitura pública de leads" ON leads FOR SELECT USING (true);
DROP POLICY IF EXISTS "Escrita para autenticados em leads" ON leads;
CREATE POLICY "Escrita para autenticados em leads" ON leads FOR ALL USING (true);

-- Tabela de Traffic
CREATE TABLE IF NOT EXISTS traffic (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  online_now INTEGER DEFAULT 0,
  today INTEGER DEFAULT 0,
  last_seven_days INTEGER DEFAULT 0,
  this_month INTEGER DEFAULT 0,
  traffic_sources JSONB DEFAULT '[{"source": "Direto", "visits": 0}, {"source": "Google", "visits": 0}, {"source": "Instagram", "visits": 0}]',
  top_pages JSONB DEFAULT '[{"page": "Início", "visits": 0}, {"page": "Catálogo", "visits": 0}]',
  geo_states JSONB DEFAULT '[{"state": "São Paulo", "visits": 0}, {"state": "Rio de Janeiro", "visits": 0}]',
  geo_cities JSONB DEFAULT '[{"city": "São Paulo", "visits": 0}, {"city": "Rio de Janeiro", "visits": 0}]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE traffic ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de traffic" ON traffic;
CREATE POLICY "Leitura pública de traffic" ON traffic FOR SELECT USING (true);
DROP POLICY IF EXISTS "Escrita para autenticados em traffic" ON traffic;
CREATE POLICY "Escrita para autenticados em traffic" ON traffic FOR ALL USING (true);
`;

async function run() {
  console.log("Tentando executar SQL no Supabase...");
  // Nota: RPC 'exec_sql' é uma função personalizada que geralmente não existe por padrão.
  // Vamos tentar via query direta se possível ou informar o usuário.
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error("Erro ao executar SQL via RPC:", error.message);
    console.log("\n--- INSTRUÇÕES PARA EXECUÇÃO MANUAL ---");
    console.log("A chave 'anon' não tem permissão para criar tabelas diretamente.");
    console.log("Por favor, copie o SQL acima e cole no SQL Editor do seu painel Supabase.");
    console.log("----------------------------------------\n");
  } else {
    console.log("SQL executado com sucesso!");
  }
}

run();
