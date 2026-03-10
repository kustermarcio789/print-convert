-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category_id UUID REFERENCES categories(id),
  category_name TEXT, -- Denormalizado para facilidade
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  modelo_3d TEXT,
  specifications JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir Categorias Iniciais
INSERT INTO categories (name, slug) VALUES 
('Peças de Impressora 3D', 'pecas-impressora'),
('Protótipos', 'prototipos'),
('Decoração', 'decoracao'),
('Acessórios', 'acessorios'),
('Colecionáveis', 'colecionaveis'),
('Organização', 'organizacao')
ON CONFLICT (slug) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (Leitura pública)
CREATE POLICY "Leitura pública de categorias" ON categories FOR SELECT USING (true);
CREATE POLICY "Leitura pública de produtos" ON products FOR SELECT USING (true);

-- Políticas de Escrita (Apenas autenticados - para o painel)
-- Nota: Para simplificar, estamos permitindo escrita para quem tem a anon key, 
-- mas em produção o ideal é usar autenticação real.
CREATE POLICY "Escrita para autenticados em categorias" ON categories FOR ALL USING (true);
CREATE POLICY "Escrita para autenticados em produtos" ON products FOR ALL USING (true);
