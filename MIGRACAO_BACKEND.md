# Guia de Migração para Backend Real

## Visão Geral

Atualmente, o sistema 3DKPRINT utiliza **localStorage** para armazenamento de dados. Esta é uma solução temporária adequada para desenvolvimento e demonstração, mas para produção é necessário migrar para um backend real com banco de dados.

Este documento descreve como realizar essa migração de forma simples e organizada.

---

## Arquitetura Atual

```
Frontend (React + Vite)
    ↓
apiClient.ts (Camada de Abstração)
    ↓
localStorage (Armazenamento Temporário)
```

---

## Arquitetura Futura

```
Frontend (React + Vite)
    ↓
apiClient.ts (Camada de Abstração)
    ↓
Backend API (Node.js/Python/PHP)
    ↓
Banco de Dados (MySQL/PostgreSQL/MongoDB)
```

---

## Opções de Backend

### 1. **Node.js + Express + MySQL** (Recomendado)

**Vantagens:**
- Mesma linguagem do frontend (JavaScript/TypeScript)
- Grande ecossistema de bibliotecas
- Fácil integração com Vercel
- Boa performance

**Stack:**
- Express.js (Framework web)
- MySQL ou PostgreSQL (Banco de dados)
- Prisma ou TypeORM (ORM)
- JWT (Autenticação)

### 2. **Python + FastAPI + PostgreSQL**

**Vantagens:**
- Código limpo e fácil de manter
- Documentação automática (Swagger)
- Ótimo para APIs REST
- Bom para processamento de dados

**Stack:**
- FastAPI (Framework web)
- PostgreSQL (Banco de dados)
- SQLAlchemy (ORM)
- JWT (Autenticação)

### 3. **PHP + Laravel + MySQL**

**Vantagens:**
- Hospedagem mais barata
- Grande comunidade
- Framework maduro e completo
- Fácil deploy em servidores compartilhados

**Stack:**
- Laravel (Framework web)
- MySQL (Banco de dados)
- Eloquent ORM (incluso)
- Laravel Passport (Autenticação)

---

## Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **usuarios**
```sql
CREATE TABLE usuarios (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  role ENUM('admin', 'cliente', 'prestador') DEFAULT 'cliente',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. **orcamentos**
```sql
CREATE TABLE orcamentos (
  id VARCHAR(36) PRIMARY KEY,
  usuario_id VARCHAR(36),
  tipo ENUM('impressao', 'modelagem', 'pintura', 'manutencao') NOT NULL,
  status ENUM('pendente', 'aprovado', 'recusado', 'em_producao', 'concluido', 'cancelado') DEFAULT 'pendente',
  descricao TEXT,
  valor_servico DECIMAL(10, 2),
  valor_frete DECIMAL(10, 2),
  valor_total DECIMAL(10, 2),
  prazo_entrega VARCHAR(100),
  observacoes TEXT,
  dados_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

#### 3. **prestadores**
```sql
CREATE TABLE prestadores (
  id VARCHAR(36) PRIMARY KEY,
  usuario_id VARCHAR(36),
  nome_empresa VARCHAR(255),
  cnpj VARCHAR(18),
  especialidades JSON,
  portfolio_url VARCHAR(500),
  aprovado BOOLEAN DEFAULT FALSE,
  avaliacao DECIMAL(3, 2),
  total_avaliacoes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

#### 4. **produtos**
```sql
CREATE TABLE produtos (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  preco DECIMAL(10, 2),
  preco_promocional DECIMAL(10, 2),
  estoque INT DEFAULT 0,
  imagens JSON,
  modelo_3d_url VARCHAR(500),
  especificacoes JSON,
  ativo BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 5. **pedidos**
```sql
CREATE TABLE pedidos (
  id VARCHAR(36) PRIMARY KEY,
  orcamento_id VARCHAR(36),
  usuario_id VARCHAR(36),
  status ENUM('pendente', 'aprovado', 'em_producao', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente',
  pagamento_id VARCHAR(100),
  pagamento_status ENUM('pendente', 'aprovado', 'recusado', 'estornado') DEFAULT 'pendente',
  rastreio_codigo VARCHAR(100),
  rastreio_transportadora VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

#### 6. **arquivos**
```sql
CREATE TABLE arquivos (
  id VARCHAR(36) PRIMARY KEY,
  orcamento_id VARCHAR(36),
  nome_original VARCHAR(255),
  nome_arquivo VARCHAR(255),
  tipo VARCHAR(50),
  tamanho INT,
  url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id)
);
```

---

## Passo a Passo da Migração

### Etapa 1: Configurar Backend

1. **Criar projeto backend:**
```bash
mkdir 3dkprint-api
cd 3dkprint-api
npm init -y
npm install express cors dotenv mysql2 jsonwebtoken bcryptjs
npm install -D typescript @types/node @types/express
```

2. **Criar estrutura de pastas:**
```
3dkprint-api/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json
```

### Etapa 2: Configurar Banco de Dados

1. **Criar banco de dados:**
```sql
CREATE DATABASE 3dkprint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Executar scripts de criação de tabelas** (usar os scripts SQL acima)

3. **Configurar conexão no backend:**
```typescript
// src/config/database.ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
```

### Etapa 3: Criar Endpoints da API

Exemplo de controller para orçamentos:

```typescript
// src/controllers/orcamentosController.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getOrcamentos = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orcamentos ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar orçamentos' });
  }
};

export const getOrcamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM orcamentos WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar orçamento' });
  }
};

export const createOrcamento = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const id = `ORC-${Date.now()}`;
    
    await pool.query(
      'INSERT INTO orcamentos (id, tipo, descricao, dados_json) VALUES (?, ?, ?, ?)',
      [id, data.tipo, data.descricao, JSON.stringify(data)]
    );
    
    res.status(201).json({ id, ...data });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
};
```

### Etapa 4: Atualizar Frontend

1. **Configurar variável de ambiente:**
```env
# .env
VITE_API_URL=https://api.3dkprint.com.br
```

2. **O arquivo `apiClient.ts` já está preparado!**
   - Quando `VITE_API_URL` estiver configurado, ele automaticamente usará a API real
   - Não é necessário alterar nenhum código dos componentes

### Etapa 5: Deploy

1. **Backend:**
   - Vercel: `vercel --prod`
   - Heroku: `git push heroku main`
   - Railway: `railway up`
   - AWS/DigitalOcean: Configurar servidor Node.js

2. **Banco de Dados:**
   - PlanetScale (MySQL grátis)
   - Supabase (PostgreSQL grátis)
   - AWS RDS
   - DigitalOcean Managed Database

---

## Migração de Dados

Para migrar dados existentes do localStorage para o banco de dados:

```javascript
// Script de migração (executar no console do navegador)
const migrateData = async () => {
  const orcamentos = JSON.parse(localStorage.getItem('orcamentos') || '[]');
  
  for (const orcamento of orcamentos) {
    await fetch('https://api.3dkprint.com.br/orcamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orcamento)
    });
  }
  
  console.log('Migração concluída!');
};

migrateData();
```

---

## Recursos Adicionais

### Hospedagem Recomendada

**Backend:**
- Vercel (Node.js) - Grátis
- Railway - Grátis com limites
- Heroku - Grátis com limites
- DigitalOcean - $5/mês

**Banco de Dados:**
- PlanetScale - Grátis até 5GB
- Supabase - Grátis até 500MB
- AWS RDS Free Tier - 12 meses grátis

### Segurança

1. **Sempre usar HTTPS**
2. **Implementar rate limiting**
3. **Validar todos os inputs**
4. **Usar prepared statements**
5. **Hash de senhas com bcrypt**
6. **JWT para autenticação**
7. **CORS configurado corretamente**

---

## Suporte

Para dúvidas sobre a migração, consulte:
- Documentação do Express.js
- Documentação do MySQL
- Documentação do Vercel

---

**Última atualização:** 08/02/2026
