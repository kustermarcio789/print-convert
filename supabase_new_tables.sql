-- Tabela de Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'enviado', 'entregue', 'cancelado'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Escrita para autenticados em leads" ON leads FOR ALL USING (true);

-- Tabela de Traffic (para simular dados de tráfego)
CREATE TABLE IF NOT EXISTS traffic (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  online_now INTEGER DEFAULT 0,
  today INTEGER DEFAULT 0,
  last_seven_days INTEGER DEFAULT 0,
  this_month INTEGER DEFAULT 0,
  traffic_sources JSONB DEFAULT 
    '[{"source": "Direto", "visits": 0}, {"source": "Google", "visits": 0}, {"source": "Instagram", "visits": 0}]',
  top_pages JSONB DEFAULT 
    '[{"page": "Início", "visits": 0}, {"page": "Catálogo", "visits": 0}]',
  geo_states JSONB DEFAULT 
    '[{"state": "São Paulo", "visits": 0}, {"state": "Rio de Janeiro", "visits": 0}]',
  geo_cities JSONB DEFAULT 
    '[{"city": "São Paulo", "visits": 0}, {"city": "Rio de Janeiro", "visits": 0}]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE traffic ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de traffic" ON traffic FOR SELECT USING (true);
CREATE POLICY "Escrita para autenticados em traffic" ON traffic FOR ALL USING (true);
