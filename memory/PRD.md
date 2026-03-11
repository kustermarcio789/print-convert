# 3DKPRINT - PRD (Product Requirements Document)

## Problema Original
Auditoria do arquivo zip do site 3DKPRINT para encontrar falhas e erros. O painel admin precisava estar 100% funcional com dados reais. Páginas específicas a corrigir e melhorar.

## Tecnologias
- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + shadcn/ui
- Database: Supabase
- Autenticação: JWT local (sessionStorage/localStorage)
- Pagamento: Mercado Pago SDK
- Email: Resend API
- Deploy: Vercel (frontend) + FastAPI backend (Emergent)

## Credenciais
- Admin: 3dk.print.br@gmail.com / 1@9b8z5X
- Mercado Pago Test Public Key: TEST-4f42b5c0-4e27-4874-ab6e-5b00bede0c6e
- Mercado Pago Test Access Token: TEST-6480666910248677-031103-adea33b15ed2df02bd73893bd9cdec48-287681490
- Resend API Key: configurada no backend/.env

## Status das Funcionalidades

### Implementado e Testado
| Funcionalidade | Status | Data |
|---|---|---|
| Auditoria e correção de bugs | ✅ | 10/03/2026 |
| Sidebar do Admin completa | ✅ | 10/03/2026 |
| Página de Produtos Admin (CRUD) | ✅ | 10/03/2026 |
| Página de Detalhe do Produto | ✅ | 10/03/2026 |
| Menu Superior com Dropdowns | ✅ | 11/03/2026 |
| Sistema de Carrinho + Checkout | ✅ | 11/03/2026 |
| Integração Mercado Pago | ✅ | 11/03/2026 |
| Páginas públicas (Consultor 3D, Conhecimento, Comunidade) | ✅ | 11/03/2026 |
| Analytics no Dashboard Admin (dados estáticos) | ✅ | 11/03/2026 |
| Materiais/Insumos na Produção | ✅ | 11/03/2026 |
| Orçamentos (criação manual + gestão) | ✅ | 11/03/2026 |
| Portfolio limpo | ✅ | 11/03/2026 |
| Persistência do carrinho (localStorage) | ✅ | 11/03/2026 |
| Envio de e-mail de orçamento (Resend API) | ✅ | 11/03/2026 |

### Configuração Vercel
- Root Directory: frontend
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install --legacy-peer-deps --no-frozen-lockfile
- Variáveis de ambiente necessárias: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, RESEND_API_KEY, SENDER_EMAIL

## Backlog (P1)
- Criar tabelas no Supabase (producao, materiais, orcamentos) - scripts SQL no PRD.md antigo
- Conectar dados do Admin ao Supabase (Analytics usa dados estáticos)
- Verificar domínio no Resend para envio de emails para qualquer destinatário

## Backlog (P2)
- Refatorar productsData.ts para usar Supabase como única fonte
- Implementar envio de orçamentos por WhatsApp via API (atualmente abre WhatsApp Web)
- Code splitting para reduzir o bundle size principal (1.9MB)

## Arquivos Principais
- /app/frontend/src/App.tsx - Rotas
- /app/frontend/src/contexts/CartContext.tsx - Carrinho
- /app/frontend/src/pages/admin/AdminOrcamentos.tsx - Gestão de orçamentos
- /app/backend/server.py - API de e-mail (Resend)
- /app/frontend/api/send-email.js - Vercel serverless function para email
