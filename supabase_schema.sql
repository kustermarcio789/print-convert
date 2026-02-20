-- ============================================================================
-- SCHEMA DO SUPABASE PARA 3DKPRINT
-- ============================================================================
-- Este arquivo contém todas as tabelas necessárias para migrar de localStorage
-- para um banco de dados PostgreSQL real no Supabase.
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE USUÁRIOS (CLIENTES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP,
  orcamentos_realizados INTEGER DEFAULT 0,
  compras_realizadas INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true
);

-- Índices para melhor performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_telefone ON usuarios(telefone);

-- ============================================================================
-- 2. TABELA DE PRESTADORES DE SERVIÇO
-- ============================================================================
CREATE TABLE IF NOT EXISTS prestadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  servicos TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio TEXT,
  portfolio_url VARCHAR(500),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'aguardando_aprovacao', -- aguardando_aprovacao, ativo, inativo
  rating DECIMAL(3,2) DEFAULT 0,
  total_servicos INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true
);

CREATE INDEX idx_prestadores_email ON prestadores(email);
CREATE INDEX idx_prestadores_status ON prestadores(status);

-- ============================================================================
-- 3. TABELA DE PRODUTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100),
  material VARCHAR(100),
  imagem_url VARCHAR(500),
  imagem_storage_path VARCHAR(500), -- Caminho no Supabase Storage
  rating DECIMAL(3,2) DEFAULT 0,
  avaliacoes INTEGER DEFAULT 0,
  estoque INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  badge VARCHAR(50), -- ex: 'premium', 'novo', etc
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_produtos_destaque ON produtos(destaque);

-- ============================================================================
-- 4. TABELA DE ORÇAMENTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo VARCHAR(100) NOT NULL, -- impressao, modelagem, pintura, manutencao
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_telefone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, aprovado, recusado, concluido
  valor DECIMAL(10,2),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  detalhes JSONB, -- Armazena dados flexíveis como material, cor, quantidade, etc
  arquivo_url VARCHAR(500),
  arquivo_storage_path VARCHAR(500), -- Caminho do arquivo 3D no Storage
  observacoes TEXT
);

CREATE INDEX idx_orcamentos_usuario ON orcamentos(usuario_id);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);
CREATE INDEX idx_orcamentos_email ON orcamentos(cliente_email);
CREATE INDEX idx_orcamentos_data ON orcamentos(data_criacao);

-- ============================================================================
-- 5. TABELA DE VENDAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  orcamento_id UUID REFERENCES orcamentos(id) ON DELETE SET NULL,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  preco_total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, pago, enviado, entregue
  data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_entrega TIMESTAMP,
  observacoes TEXT
);

CREATE INDEX idx_vendas_usuario ON vendas(usuario_id);
CREATE INDEX idx_vendas_orcamento ON vendas(orcamento_id);
CREATE INDEX idx_vendas_produto ON vendas(produto_id);
CREATE INDEX idx_vendas_status ON vendas(status);

-- ============================================================================
-- 6. TABELA DE PRODUÇÃO
-- ============================================================================
CREATE TABLE IF NOT EXISTS producao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID REFERENCES orcamentos(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'nao_iniciada', -- nao_iniciada, em_progresso, concluida, com_problema
  data_inicio TIMESTAMP,
  data_conclusao TIMESTAMP,
  tempo_impressao_horas DECIMAL(10,2),
  material_usado VARCHAR(100),
  quantidade_material_gramas DECIMAL(10,2),
  custo_material DECIMAL(10,2),
  observacoes TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_producao_orcamento ON producao(orcamento_id);
CREATE INDEX idx_producao_status ON producao(status);

-- ============================================================================
-- 7. TABELA DE INVENTÁRIO DE MATERIAIS
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventario_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material VARCHAR(100) NOT NULL,
  cor VARCHAR(100),
  quantidade_gramas DECIMAL(10,2) NOT NULL,
  quantidade_minima DECIMAL(10,2) DEFAULT 500, -- Alerta quando chegar nesse valor
  preco_por_grama DECIMAL(10,4) NOT NULL,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true
);

CREATE INDEX idx_inventario_material ON inventario_materiais(material);

-- ============================================================================
-- 8. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- ============================================================================
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  tipo VARCHAR(50), -- string, number, boolean, json
  descricao TEXT,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, tipo, descricao) VALUES
  ('telefone_whatsapp', '554391741518', 'string', 'Número do WhatsApp da empresa'),
  ('email_contato', 'contato@3dkprint.com.br', 'string', 'E-mail principal de contato'),
  ('taxa_urgencia_rapido', '1.3', 'number', 'Multiplicador de preço para urgência Rápido'),
  ('taxa_urgencia_urgente', '1.8', 'number', 'Multiplicador de preço para urgência Urgente'),
  ('preco_base_orcamento', '45', 'number', 'Preço base para qualquer orçamento'),
  ('margem_lucro_padrao', '0.3', 'number', 'Margem de lucro padrão (30%)');

-- ============================================================================
-- 9. TABELA DE LOGS DE ATIVIDADES
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  acao VARCHAR(255) NOT NULL,
  tabela_afetada VARCHAR(100),
  registro_id UUID,
  detalhes JSONB,
  ip_address VARCHAR(45),
  data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_usuario ON logs_atividades(usuario_id);
CREATE INDEX idx_logs_data ON logs_atividades(data_acao);

-- ============================================================================
-- 10. POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- ============================================================================
-- Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Usuários veem seus próprios dados"
  ON usuarios FOR SELECT
  USING (auth.uid()::text = id::text OR auth.role() = 'authenticated');

-- Política para orçamentos
CREATE POLICY "Usuários veem seus próprios orçamentos"
  ON orcamentos FOR SELECT
  USING (auth.uid()::text = usuario_id::text OR auth.role() = 'admin');

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
