# Erro no Visualizador STEP

## Problema Encontrado
Ao carregar complex_part.stp, o visualizador mostra:
- "Erro ao carregar modelo"
- "null function or function signature mismatch"

## Causa Provável
O erro "null function or function signature mismatch" é um erro típico do WebAssembly quando:
1. O arquivo WASM não foi carregado corretamente
2. A versão do WASM não é compatível com o wrapper JS
3. O locateFile do occt-import-js não está apontando para o WASM correto

## Solução
Preciso verificar:
1. Se o WASM está sendo servido corretamente pela Vercel
2. Se o locateFile está configurado corretamente
3. Talvez usar CDN para o WASM em vez de servir localmente
