# Erro STEP v2

## Problema
Ainda mostra: "Falha ao processar arquivo STEP: null function or function signature mismatch"
O WASM carrega (7.6MB) mas o ReadStepFile falha.

## Análise
O erro "null function or function signature mismatch" acontece DENTRO do ReadStepFile.
Isso significa que o WASM carregou OK, mas a chamada ReadStepFile está passando parâmetros incompatíveis.

## Possíveis causas:
1. O segundo parâmetro `null` pode estar causando o crash
2. O arquivo complex_part.stp pode ter formato incompatível
3. A versão 0.0.23 pode ter bug com certos tipos de STEP

## Solução:
- Tentar chamar ReadStepFile apenas com fileBuffer (sem segundo argumento)
- Tentar com versão diferente do occt-import-js
- Verificar se o arquivo STEP gerado manualmente é válido
- Tentar com o test_cube.step que é um arquivo STEP real
