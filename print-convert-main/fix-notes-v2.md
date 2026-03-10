# Problemas a Corrigir

## 1. Páginas de Marcas (/marcas/sovol e /marcas/elegoo)
- BrandDetail.tsx busca produtos via produtosAPI.getByBrand() do Supabase
- Como não há produtos cadastrados no Supabase, mostra "0 produtos encontrados"
- SOLUÇÃO: Adicionar fallback com os produtos do catálogo local quando API retorna vazio
- Sovol não está no actualBrandsData, precisa adicionar

## 2. Fotos Erradas
- Sovol SV08: deve usar pasted_file_kUlAJq (foto com Mickey) - atualmente usa sovol-sv08.png que é a foto errada
- Sovol SV08 MAX: deve usar pasted_file_0DANTi (foto grande aberta) - atualmente usa sovol-sv08-max.png que é a foto errada
- VERIFICAÇÃO: As fotos foram trocadas! SV08 está com a foto da MAX e vice-versa
- SOLUÇÃO: Trocar os arquivos

## 3. Botão Comprar
- Atualmente aponta para /orcamento
- Precisa criar página de checkout /checkout/:productId
- Checkout deve ter: resumo do produto, dados do comprador, forma de pagamento, endereço de entrega
