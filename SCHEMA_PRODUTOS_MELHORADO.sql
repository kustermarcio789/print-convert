-- ============================================================================
-- SCHEMA MELHORADO PARA GESTÃO DE PRODUTOS COM HIERARQUIA
-- Marca -> Modelo -> Tipo -> Produto
-- ============================================================================

-- Tabela de Marcas
CREATE TABLE IF NOT EXISTS marcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  logo_url VARCHAR(512),
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de Modelos (ex: Ender 3, Prusa i3, etc)
CREATE TABLE IF NOT EXISTS modelos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marca_id UUID NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  especificacoes JSONB, -- {"tamanho_cama": "220x220", "altura_max": "250mm", ...}
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  UNIQUE(marca_id, nome)
);

-- Tabela de Tipos de Produtos (ex: Placa PEI, Motor, Bico, etc)
CREATE TABLE IF NOT EXISTS tipos_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  categoria VARCHAR(100), -- "peças", "consumíveis", "ferramentas", "acessórios"
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de Produtos (Estrutura melhorada)
CREATE TABLE IF NOT EXISTS produtos_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL,
  modelo_id UUID REFERENCES modelos(id) ON DELETE SET NULL,
  tipo_id UUID NOT NULL REFERENCES tipos_produtos(id) ON DELETE RESTRICT,
  
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  descricao_longa TEXT,
  
  preco DECIMAL(10, 2) NOT NULL,
  preco_custo DECIMAL(10, 2),
  margem_lucro DECIMAL(5, 2), -- Calculado automaticamente
  
  sku VARCHAR(100) UNIQUE,
  codigo_barras VARCHAR(50),
  
  estoque INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 10,
  estoque_maximo INTEGER DEFAULT 100,
  
  imagem_principal_url VARCHAR(512),
  imagens_adicionais TEXT[], -- Array de URLs
  
  rating DECIMAL(3, 2) DEFAULT 0,
  total_avaliacoes INTEGER DEFAULT 0,
  total_vendas INTEGER DEFAULT 0,
  
  destaque BOOLEAN DEFAULT false,
  badge VARCHAR(50), -- "novo", "promoção", "bestseller", etc
  
  especificacoes JSONB, -- Campos específicos do tipo de produto
  compatibilidades TEXT[], -- Modelos compatíveis
  
  ativo BOOLEAN DEFAULT true,
  visivel BOOLEAN DEFAULT true,
  
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(sku),
  UNIQUE(codigo_barras)
);

-- Tabela de Compatibilidades (Muitos-para-Muitos)
CREATE TABLE IF NOT EXISTS produto_compatibilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos_v2(id) ON DELETE CASCADE,
  modelo_id UUID NOT NULL REFERENCES modelos(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  UNIQUE(produto_id, modelo_id)
);

-- Tabela de Categorias de Produtos
CREATE TABLE IF NOT EXISTS categorias_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  icone VARCHAR(50),
  cor_hex VARCHAR(7),
  ordem INTEGER,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de Variações de Produtos (ex: cores, tamanhos)
CREATE TABLE IF NOT EXISTS produto_variacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos_v2(id) ON DELETE CASCADE,
  
  nome VARCHAR(100), -- "Cor", "Tamanho", etc
  valor VARCHAR(100), -- "Preto", "Grande", etc
  
  sku_variacao VARCHAR(100) UNIQUE,
  preco_adicional DECIMAL(10, 2) DEFAULT 0,
  estoque INTEGER DEFAULT 0,
  
  imagem_url VARCHAR(512),
  
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX idx_modelos_marca_id ON modelos(marca_id);
CREATE INDEX idx_produtos_v2_marca_id ON produtos_v2(marca_id);
CREATE INDEX idx_produtos_v2_modelo_id ON produtos_v2(modelo_id);
CREATE INDEX idx_produtos_v2_tipo_id ON produtos_v2(tipo_id);
CREATE INDEX idx_produtos_v2_ativo ON produtos_v2(ativo);
CREATE INDEX idx_produtos_v2_visivel ON produtos_v2(visivel);
CREATE INDEX idx_produtos_v2_destaque ON produtos_v2(destaque);
CREATE INDEX idx_produtos_v2_sku ON produtos_v2(sku);
CREATE INDEX idx_produto_compatibilidades_produto_id ON produto_compatibilidades(produto_id);
CREATE INDEX idx_produto_compatibilidades_modelo_id ON produto_compatibilidades(modelo_id);
CREATE INDEX idx_produto_variacoes_produto_id ON produto_variacoes(produto_id);

-- ============================================================================
-- DADOS DE EXEMPLO
-- ============================================================================

-- Inserir Marcas
INSERT INTO marcas (nome, descricao) VALUES
  ('Creality', 'Fabricante de impressoras 3D acessíveis'),
  ('Prusa', 'Impressoras 3D de alta qualidade'),
  ('Anycubic', 'Impressoras 3D de resina e FDM'),
  ('Ender', 'Série de impressoras 3D populares')
ON CONFLICT DO NOTHING;

-- Inserir Tipos de Produtos
INSERT INTO tipos_produtos (nome, categoria, descricao) VALUES
  ('Placa PEI', 'peças', 'Placa de construção para impressoras 3D'),
  ('Motor NEMA', 'peças', 'Motor de passo para impressoras'),
  ('Bico de Impressão', 'consumíveis', 'Bico para extrusora'),
  ('Filamento', 'consumíveis', 'Filamento para impressão 3D'),
  ('Correia GT2', 'peças', 'Correia de transmissão'),
  ('Nozzle', 'consumíveis', 'Bico de impressão'),
  ('Hotend', 'peças', 'Bloco aquecido para impressora'),
  ('Ventilador', 'peças', 'Ventilador de refrigeração'),
  ('Cabo USB', 'acessórios', 'Cabo de conexão'),
  ('Ferramenta de Limpeza', 'ferramentas', 'Ferramentas para manutenção')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View: Produtos com informações completas
CREATE OR REPLACE VIEW produtos_completos AS
SELECT 
  p.id,
  p.nome,
  p.descricao,
  p.preco,
  p.estoque,
  m.nome as marca,
  mo.nome as modelo,
  tp.nome as tipo,
  p.rating,
  p.total_avaliacoes,
  p.total_vendas,
  p.ativo,
  p.visivel
FROM produtos_v2 p
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN modelos mo ON p.modelo_id = mo.id
LEFT JOIN tipos_produtos tp ON p.tipo_id = tp.id
WHERE p.ativo = true;

-- View: Produtos com baixo estoque
CREATE OR REPLACE VIEW produtos_baixo_estoque AS
SELECT 
  id,
  nome,
  estoque,
  estoque_minimo,
  (estoque_minimo - estoque) as quantidade_faltante
FROM produtos_v2
WHERE estoque < estoque_minimo AND ativo = true
ORDER BY quantidade_faltante DESC;

-- View: Produtos mais vendidos
CREATE OR REPLACE VIEW produtos_bestsellers AS
SELECT 
  id,
  nome,
  total_vendas,
  rating,
  total_avaliacoes,
  preco
FROM produtos_v2
WHERE ativo = true AND visivel = true
ORDER BY total_vendas DESC
LIMIT 20;

-- ============================================================================
-- TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- ============================================================================

-- Trigger: Atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION atualizar_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_produtos_v2_atualizacao
BEFORE UPDATE ON produtos_v2
FOR EACH ROW
EXECUTE FUNCTION atualizar_data_atualizacao();

-- Trigger: Calcular margem de lucro automaticamente
CREATE OR REPLACE FUNCTION calcular_margem_lucro()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preco_custo IS NOT NULL AND NEW.preco > 0 THEN
    NEW.margem_lucro = ((NEW.preco - NEW.preco_custo) / NEW.preco) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_produtos_v2_margem
BEFORE INSERT OR UPDATE ON produtos_v2
FOR EACH ROW
EXECUTE FUNCTION calcular_margem_lucro();

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_v2 ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura (todos podem ler produtos ativos)
CREATE POLICY "Ler produtos ativos" ON produtos_v2
  FOR SELECT
  USING (ativo = true AND visivel = true);

CREATE POLICY "Ler marcas ativas" ON marcas
  FOR SELECT
  USING (ativo = true);

CREATE POLICY "Ler modelos ativos" ON modelos
  FOR SELECT
  USING (ativo = true);

-- Políticas de escrita (apenas admin)
CREATE POLICY "Admin pode gerenciar produtos" ON produtos_v2
  FOR ALL
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE produtos_v2 IS 'Tabela principal de produtos com hierarquia Marca-Modelo-Tipo';
COMMENT ON COLUMN produtos_v2.especificacoes IS 'JSONB com especificações específicas do tipo de produto';
COMMENT ON COLUMN produtos_v2.compatibilidades IS 'Array de IDs de modelos compatíveis';
COMMENT ON COLUMN produtos_v2.margem_lucro IS 'Calculada automaticamente: ((preco - preco_custo) / preco) * 100';
