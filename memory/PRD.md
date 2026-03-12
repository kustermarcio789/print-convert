# 3DKPRINT - PRD

## Tecnologias
- Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Database: Supabase (ÚNICA fonte de dados para produtos)
- Pagamento: Mercado Pago SDK
- Email: Resend API
- Analytics: Google Analytics GA4 (G-YFB2V50SNS)
- Deploy: Vercel

## Status

### Implementado e Testado
| Funcionalidade | Data |
|---|---|
| Admin lê/escreve do Supabase (fonte única) | 12/03 |
| Sync admin ↔ site público via Supabase | 12/03 |
| Sino de notificação removido | 12/03 |
| Imagens corrigidas em BrandDetail e Checkout | 12/03 |
| Deploy Vercel (overrides fix) | 11/03 |
| Envio de e-mail (Resend) | 11/03 |
| Google Analytics GA4 | 11/03 |
| Checkout Mercado Pago (CSP fix) | 11/03 |
| Carrinho persistente | 11/03 |
| Produtos sempre compráveis | 11/03 |
| Upload 3D opcional | 11/03 |
| Estoque +/- buttons | 11/03 |

## Backlog
- P1: Google Analytics Data API no painel admin
- P1: Criar tabelas Supabase (producao, materiais, orcamentos)
- P2: Verificar domínio Resend
- P2: Code splitting
