# Setup — Tabelas Clientes + Fornecedores

Rode no Supabase SQL Editor:
👉 https://supabase.com/dashboard/project/eobysswnimpwehclcwmo/sql/new

```sql
-- ========================================
-- TABELA CLIENTES
-- ========================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo              TEXT NOT NULL DEFAULT 'PF',      -- 'PF' | 'PJ'
  nome              TEXT NOT NULL,                   -- nome completo (PF) ou razão social (PJ)
  nome_fantasia     TEXT,                            -- opcional (PJ)
  cpf_cnpj          TEXT,
  rg_ie             TEXT,                            -- RG (PF) ou Inscrição Estadual (PJ)
  email             TEXT,
  whatsapp          TEXT,
  telefone          TEXT,
  endereco          JSONB DEFAULT '{}'::jsonb,
  tags              TEXT[] DEFAULT ARRAY[]::TEXT[],
  observacoes       TEXT,
  origem            TEXT DEFAULT 'manual',           -- 'manual' | 'site' | 'importado'
  ativo             BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_nome      ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj  ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_email     ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo     ON clientes(ativo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj_unico
  ON clientes(cpf_cnpj) WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj <> '';

-- updated_at
DROP TRIGGER IF EXISTS trg_clientes_updated ON clientes;
CREATE TRIGGER trg_clientes_updated
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clientes_select" ON clientes;
CREATE POLICY "clientes_select" ON clientes FOR SELECT USING (true);

DROP POLICY IF EXISTS "clientes_all" ON clientes;
CREATE POLICY "clientes_all" ON clientes FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- TABELA FORNECEDORES
-- ========================================
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo                       TEXT NOT NULL DEFAULT 'PJ',
  razao_social               TEXT NOT NULL,
  nome_fantasia              TEXT,
  cpf_cnpj                   TEXT,
  inscricao_estadual         TEXT,
  contato_nome               TEXT,                   -- pessoa responsável pelo contato
  contato_cargo              TEXT,
  email                      TEXT,
  whatsapp                   TEXT,
  telefone                   TEXT,
  endereco                   JSONB DEFAULT '{}'::jsonb,
  categoria                  TEXT NOT NULL DEFAULT 'outro',
  condicao_pagamento         TEXT,                    -- 'avista' | '7d' | '15d' | '30d' | '30_60' etc
  prazo_entrega_padrao_dias  INTEGER,
  site                       TEXT,
  observacoes                TEXT,
  ativo                      BOOLEAN DEFAULT true,
  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fornecedores_razao      ON fornecedores(razao_social);
CREATE INDEX IF NOT EXISTS idx_fornecedores_categoria  ON fornecedores(categoria);
CREATE INDEX IF NOT EXISTS idx_fornecedores_cpf_cnpj   ON fornecedores(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo      ON fornecedores(ativo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fornecedores_cnpj_unico
  ON fornecedores(cpf_cnpj) WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj <> '';

-- updated_at
DROP TRIGGER IF EXISTS trg_fornecedores_updated ON fornecedores;
CREATE TRIGGER trg_fornecedores_updated
  BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fornecedores_select" ON fornecedores;
CREATE POLICY "fornecedores_select" ON fornecedores FOR SELECT USING (true);

DROP POLICY IF EXISTS "fornecedores_all" ON fornecedores;
CREATE POLICY "fornecedores_all" ON fornecedores FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- LIGAR ORCAMENTOS A CLIENTES (FK opcional)
-- ========================================
ALTER TABLE orcamentos
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON orcamentos(cliente_id);

-- ========================================
-- VERIFICAÇÃO
-- ========================================
SELECT table_name, count(*) AS colunas
  FROM information_schema.columns
 WHERE table_name IN ('clientes','fornecedores')
 GROUP BY table_name
 ORDER BY table_name;
```

Esperado: **2 linhas** retornando `clientes | ~15` e `fornecedores | ~19`.
