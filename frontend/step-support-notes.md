# Suporte STEP via occt-import-js

## Biblioteca: occt-import-js
- npm: `npm install occt-import-js`
- Usa OpenCascade via Emscripten/WASM
- Suporta: STEP, IGES, BREP
- Roda 100% no navegador
- Resultado é JSON compatível com Three.js

## Como usar:
1. Importar occt-import-js
2. Ler arquivo como Uint8Array
3. Chamar occt.ReadStepFile(fileBuffer, params)
4. Resultado tem meshes com position, normal e index arrays
5. Criar Three.js BufferGeometry com esses dados

## Arquivos necessários:
- occt-import-js.js
- occt-import-js.wasm (carregado em runtime)

## Resultado JSON:
- success: boolean
- root: { name, meshes[], children[] }
- meshes[]: { name, color, attributes.position.array, attributes.normal.array, index.array }
