# Análise do Painel Admin - Problemas Identificados

## 1. Prestadores - REMOVER
- Arquivo: src/pages/admin/AdminPrestadores.tsx
- Não há rota no App.tsx (já removida) mas o arquivo existe
- Não há item no Sidebar.tsx (já removido)
- Precisa remover referência prestadoresAPI se necessário

## 2. Produtos - NÃO APARECEM
- AdminProdutos.tsx busca de produtosAPI.getAll() (tabela 'products' no Supabase)
- Os produtos cadastrados no site (Elegoo, Sovol) são LOCAIS (hardcoded em Products.tsx e BrandDetail.tsx)
- Não estão no banco Supabase, por isso não aparecem no painel
- SOLUÇÃO: Criar catálogo local no AdminProdutos que mostra os produtos do site + permite adicionar via Supabase

## 3. AdminProdutosSite.tsx - ERRO
- Importa 'produtosSiteAPI' que NÃO EXISTE em apiClient.ts
- Isso causa erro ao acessar a página
- SOLUÇÃO: Remover ou reescrever para usar catálogo local

## 4. Orçamento Manual - CRIAR
- Precisa nova página/modal no painel para criar orçamento manualmente
- Campos: nome cliente, email, whatsapp, serviço, material, dimensões, quantidade, valor, observações

## 5. Sidebar - Menu
- Já está sem Prestadores (bom)
- Precisa adicionar item "Orçamento Manual" 

## 6. Dashboard - Inspiração das imagens
- Cards com gradientes coloridos
- Gráficos de barras e pizza
- Tabelas com status coloridos
- Layout moderno com sidebar escura
