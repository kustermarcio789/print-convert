# Instruções para Centralização do Banco de Dados

Olá! Realizei a limpeza de todos os produtos do site e preparei o sistema para a centralização do banco de dados.

## O que foi feito:
1. **Limpeza de Produtos**: Removi todos os produtos estáticos dos arquivos `src/data/products.ts`, `src/components/home/ProductsSection.tsx`, `src/pages/Products.tsx` e `src/pages/ProductDetail.tsx`.
2. **Preservação de Categorias**: As categorias foram mantidas na interface para que você possa vincular novos produtos a elas.
3. **Preparação para API**: O arquivo `.env` foi limpo e está pronto para receber a URL da sua API centralizada.
4. **Sistema Dinâmico**: O site agora carrega os produtos dinamicamente. Se o banco de dados estiver vazio, ele mostrará que nenhum produto foi encontrado, permitindo que você suba os novos produtos pelo painel.

## Como centralizar o Banco de Dados:

Para que os produtos fiquem online e sejam gerenciados em um único local, siga estes passos:

1. **Configure sua API**:
   - No arquivo `.env`, insira a URL da sua API na variável `VITE_API_URL`.
   - Exemplo: `VITE_API_URL=https://sua-api-central.com/api`

2. **Banco de Dados Real**:
   - O sistema está configurado para usar o `apiClient.ts` como ponte. 
   - Se `VITE_API_URL` estiver preenchido, ele fará chamadas `GET`, `POST`, `PUT` e `DELETE` para os endpoints `/produtos`.
   - Certifique-se de que seu backend aceite estas rotas e esteja conectado a um banco de dados (MySQL, PostgreSQL, etc).

3. **Subindo Produtos pelo Painel**:
   - Acesse o painel administrativo em `/admin/produtos-site`.
   - Agora, ao salvar um produto, ele será enviado para a sua API (se configurada) ou salvo localmente para teste.
   - Uma vez salvo na API centralizada, o produto aparecerá automaticamente na página de produtos do site.

## Estrutura de Dados Recomendada:
Seu banco de dados deve seguir a estrutura definida em `MIGRACAO_BACKEND.md` para total compatibilidade.

---
**3DKPRINT - Tecnologia de ponta em impressão 3D**
