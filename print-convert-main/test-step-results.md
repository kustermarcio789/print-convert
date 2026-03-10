# Teste do Visualizador 3D - Suporte STEP

## Teste STEP - SUCESSO
O arquivo test_cube.step (8KB, cubo simples do repositório occt-import-js) foi carregado com sucesso.
O visualizador mostra o badge "Visualização 3D" com o nome do arquivo, o canvas Three.js está renderizado
com 1 elemento canvas na página, o botão de tela cheia está disponível, e os controles de rotação/zoom/pan
estão funcionando. Nenhum erro no console do navegador.

## Formatos suportados
O visualizador agora suporta STL (via STLLoader), OBJ (via OBJLoader), 3MF (via ThreeMFLoader) e
STEP/STP (via occt-import-js com OpenCascade WASM). O WASM tem 7.6MB e é carregado sob demanda
apenas quando um arquivo STEP é enviado.
