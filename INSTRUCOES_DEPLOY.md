# 3DKPRINT - Instruções de Deploy

## Download do Projeto

O arquivo ZIP do projeto está disponível: `3dkprint-project.zip`

## Como Subir no GitHub

### Opção 1: Via Emergent (Recomendado)
1. No chat do Emergent, clique no ícone **"Save to Github"** (ícone do GitHub)
2. Conecte sua conta GitHub se ainda não estiver conectada
3. Escolha criar um novo repositório ou selecione um existente
4. Pronto! O código será enviado automaticamente

### Opção 2: Via Terminal Local
```bash
# 1. Extraia o ZIP
unzip 3dkprint-project.zip

# 2. Entre na pasta do projeto
cd frontend

# 3. Inicialize o Git (se necessário)
git init

# 4. Adicione o repositório remoto
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 5. Adicione os arquivos
git add .

# 6. Commit inicial
git commit -m "Initial commit - 3DKPRINT"

# 7. Envie para o GitHub
git push -u origin main
```

## Deploy na Vercel

### Passo a Passo:
1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New"** > **"Project"**
4. Importe o repositório do GitHub
5. Configure as opções:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (se o repo incluir a pasta frontend)
   - **Build Command**: `yarn build`
   - **Output Directory**: `dist`

### Variáveis de Ambiente (Environment Variables):
```
VITE_SUPABASE_URL=https://xoyhfkdvnibolhrturoc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveWhma2R2bmlob2xocnR1cm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2Nzg1MDYsImV4cCI6MjA1MzI1NDUwNn0.2TqS4k0OOVVp33b9t8tB0PQ0tFEZUGAC6zIAc8eH8tA
```

6. Clique em **"Deploy"**

## Integração Mercado Pago

As credenciais de teste já estão configuradas no código:
- **Public Key**: TEST-4f42b5c0-4e27-4874-ab6e-5b00bede0c6e
- **Access Token**: TEST-6480666910248677-031103-adea33b15ed2df02bd73893bd9cdec48-287681490

### Para produção:
1. Acesse https://www.mercadopago.com.br/developers
2. Crie uma aplicação
3. Obtenha as credenciais de PRODUÇÃO
4. Substitua no arquivo `/src/contexts/MercadoPagoContext.tsx`
5. Substitua no arquivo `/src/pages/CheckoutPage.tsx`

## Supabase - Configuração do Banco de Dados

Caso precise criar as tabelas, execute o SQL abaixo no **Supabase SQL Editor**:

```sql
-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category_name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  images TEXT[],
  specifications JSONB,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id TEXT PRIMARY KEY,
  cliente TEXT,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  tipo TEXT,
  status TEXT DEFAULT 'pendente',
  valor DECIMAL(10,2),
  descricao TEXT,
  material TEXT,
  quantidade INTEGER,
  prazo TEXT,
  observacoes TEXT,
  arquivo_3d TEXT,
  arquivo_3d_nome TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de produção
CREATE TABLE IF NOT EXISTS producao (
  id TEXT PRIMARY KEY,
  tipo TEXT,
  cliente TEXT,
  status TEXT DEFAULT 'pendente',
  valor DECIMAL(10,2),
  custo DECIMAL(10,2),
  lucro DECIMAL(10,2),
  detalhes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de materiais
CREATE TABLE IF NOT EXISTS materiais (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT,
  marca TEXT,
  cor TEXT,
  quantidade DECIMAL(10,2),
  unidade TEXT,
  preco_unitario DECIMAL(10,2),
  impressora_compativel TEXT,
  estoque_minimo DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id TEXT PRIMARY KEY,
  cliente TEXT,
  email TEXT,
  produtos JSONB,
  total DECIMAL(10,2),
  status TEXT DEFAULT 'pendente',
  payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Credenciais do Painel Admin

- **Email**: 3dk.print.br@gmail.com
- **Senha**: 1@9b8z5X

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/       # Componentes React
│   ├── contexts/         # Contextos (Cart, MercadoPago)
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitários e API
│   ├── pages/            # Páginas da aplicação
│   │   └── admin/        # Páginas do painel admin
│   └── App.tsx           # Componente principal
├── public/               # Assets públicos
├── index.html            # HTML principal
├── package.json          # Dependências
├── vite.config.ts        # Configuração do Vite
└── tailwind.config.js    # Configuração do Tailwind
```

## Suporte

Para dúvidas sobre o deploy, consulte:
- Documentação Vercel: https://vercel.com/docs
- Documentação Supabase: https://supabase.com/docs
- Documentação Mercado Pago: https://www.mercadopago.com.br/developers

---

*Gerado automaticamente pelo Emergent em 11/03/2026*
