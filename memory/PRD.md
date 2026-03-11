# 3DKPRINT - PRD (Product Requirements Document)

## Problema Original
Auditoria do arquivo zip do site 3DKPRINT para encontrar falhas e erros. O painel admin precisava estar 100% funcional com dados reais.

## Tecnologias
- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + shadcn/ui
- Database: Supabase
- Autenticação: JWT local (sessionStorage/localStorage)
- Pagamento: Mercado Pago SDK
- Email: Resend API
- Analytics: Google Analytics GA4 (G-YFB2V50SNS)
- Deploy: Vercel (frontend)

## Credenciais
- Admin: 3dk.print.br@gmail.com / 1@9b8z5X
- Mercado Pago Test: TEST-4f42b5c0-4e27-4874-ab6e-5b00bede0c6e
- Resend API Key: configurada no backend/.env
- GA4: G-YFB2V50SNS

## Status das Funcionalidades

### Implementado e Testado
| Funcionalidade | Status | Data |
|---|---|---|
| Auditoria e correção de bugs | Done | 10/03 |
| Painel Admin completo | Done | 10/03 |
| Sistema de Carrinho + Checkout MP | Done | 11/03 |
| Páginas públicas (Consultor 3D, Conhecimento, Comunidade) | Done | 11/03 |
| Menu superior com dropdowns | Done | 11/03 |
| Analytics Admin (estáticos) | Done | 11/03 |
| Persistência do carrinho (localStorage) | Done | 11/03 |
| Envio de e-mail de orçamento (Resend) | Done | 11/03 |
| Google Analytics GA4 | Done | 11/03 |
| CSP removida para compatibilidade MP | Done | 11/03 |
| Título/Meta tags corrigidos | Done | 11/03 |
| Deploy Vercel (overrides fix) | Done | 11/03 |
| Sincronização Admin → Site Público | Done | 11/03 |
| Campo estoque com +/- | Done | 11/03 |
| Upload 3D opcional no formulário | Done | 11/03 |
| Visualizador 3D na página de produto | Done | 11/03 |
| Todos produtos compráveis (inStock fix) | Done | 11/03 |

## Backlog (P1)
- Conectar Analytics do Admin ao Google Analytics Data API (precisa Service Account)
- Criar tabelas no Supabase (producao, materiais, orcamentos)
- Verificar domínio no Resend

## Backlog (P2)
- Refatorar productsData.ts para Supabase como única fonte
- Code splitting para reduzir bundle size
- Envio de orçamento por WhatsApp API

## Arquivos Principais
- /app/frontend/src/lib/productsData.ts - Dados + applyAdminOverrides
- /app/frontend/src/pages/admin/AdminProdutos.tsx - Admin produtos
- /app/frontend/src/pages/ProductDetails.tsx - Detalhes produto + 3D viewer
- /app/frontend/src/contexts/CartContext.tsx - Carrinho
- /app/backend/server.py - API de e-mail (Resend)
