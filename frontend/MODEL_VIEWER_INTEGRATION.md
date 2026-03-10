# 🎮 Integração do Visualizador 3D (Model-Viewer) - 3DKPRINT

## 📍 Localização

**Página:** Detalhes do Produto  
**URL:** https://www.3dkprint.com.br/produtos/:id  
**Arquivo:** `src/pages/ProductDetail.tsx`

---

## ✨ Funcionalidades Implementadas

### 1. **Visualizador 3D Interativo**

O Google Model-Viewer foi integrado na página de detalhes do produto, permitindo que os clientes visualizem modelos 3D (GLB/GLTF) de forma interativa diretamente no navegador.

#### Recursos:
- 🔄 **Auto-rotação** - Modelo gira automaticamente
- 🖱️ **Controles de câmera** - Arraste para rotacionar
- 🔍 **Zoom** - Scroll para aproximar/afastar
- 💡 **Iluminação** - Shadow e lighting configurados
- 📱 **Responsivo** - Funciona em mobile, tablet e desktop
- 🎨 **Alternância** - Botão para alternar entre fotos e 3D

---

## 🎯 Como Funciona

### Alternância entre Fotos e 3D

1. **Botão "🎮 Ver em 3D"**
   - Localizado no canto superior direito da galeria
   - Ao clicar, substitui a imagem pelo visualizador 3D
   - Muda para "📷 Fotos" quando em modo 3D

2. **Estado `show3D`**
   ```typescript
   const [show3D, setShow3D] = useState(false);
   ```
   - Controla qual conteúdo exibir
   - `false` = Mostra fotos
   - `true` = Mostra visualizador 3D

### Renderização Condicional

```tsx
{show3D && productData.has3DModel ? (
  <model-viewer
    src="modelo.glb"
    auto-rotate
    camera-controls
    shadow-intensity="1"
    ...
  ></model-viewer>
) : (
  <img src={foto} alt="Produto" />
)}
```

---

## 🛠️ Configuração do Model-Viewer

### Atributos Utilizados:

| Atributo | Valor | Descrição |
|----------|-------|-----------|
| `src` | URL do arquivo GLB | Caminho do modelo 3D |
| `alt` | "Modelo 3D do produto" | Texto alternativo |
| `auto-rotate` | true | Rotação automática ativada |
| `camera-controls` | true | Permite controle manual da câmera |
| `shadow-intensity` | "1" | Intensidade da sombra |
| `loading` | "eager" | Carrega imediatamente |
| `reveal` | "auto" | Revela automaticamente |
| `style` | CSS inline | Largura, altura e background |

### Exemplo de Uso:

```tsx
<model-viewer
  ref={modelViewerRef}
  src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
  alt="Modelo 3D do produto"
  auto-rotate
  camera-controls
  shadow-intensity="1"
  style={{ width: '100%', height: '100%', background: '#f5f5f5' }}
  loading="eager"
  reveal="auto"
></model-viewer>
```

---

## 📦 Tipos TypeScript

### Arquivo: `src/types/model-viewer.d.ts`

Criado para fornecer tipagem completa do model-viewer no TypeScript:

```typescript
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<...>;
  }
}

interface ModelViewerJSX {
  src: string;
  alt?: string;
  'auto-rotate'?: boolean;
  'camera-controls'?: boolean;
  'shadow-intensity'?: string;
  // ... outros atributos
}
```

**Benefícios:**
- ✅ Autocomplete no VS Code
- ✅ Validação de tipos
- ✅ Documentação inline
- ✅ Detecção de erros

---

## 🎨 Interface do Usuário

### 1. Botão de Alternância

**Localização:** Canto superior direito da galeria  
**Estilos:**
- Fundo branco semi-transparente quando em fotos
- Fundo accent (azul) quando em 3D
- Shadow para destaque
- Transição suave

```tsx
<button
  onClick={() => setShow3D(!show3D)}
  className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg ${
    show3D 
      ? 'bg-accent text-accent-foreground' 
      : 'bg-background/80 text-foreground hover:bg-background'
  }`}
>
  {show3D ? '📷 Fotos' : '🎮 Ver em 3D'}
</button>
```

### 2. Painel de Instruções

**Localização:** Parte inferior do visualizador 3D  
**Conteúdo:**
- 💡 Título "Controles do Visualizador 3D"
- 🖱️ Arrastar para rotacionar
- 🔍 Scroll para zoom
- 🔄 Auto-rotação ativada

**Estilos:**
- Fundo preto semi-transparente (70%)
- Texto branco
- Backdrop blur para efeito glassmorphism
- Rounded corners

```tsx
{show3D && productData.has3DModel && (
  <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white px-4 py-3 rounded-lg text-xs backdrop-blur-sm">
    <p className="font-medium mb-1">💡 Controles do Visualizador 3D:</p>
    <ul className="space-y-0.5 text-white/90">
      <li>🖱️ <strong>Arrastar:</strong> Rotacionar modelo</li>
      <li>🔍 <strong>Scroll:</strong> Zoom in/out</li>
      <li>🔄 <strong>Auto-rotação:</strong> Ativada</li>
    </ul>
  </div>
)}
```

---

## 🔗 Integração com Produtos

### Condição para Exibir Visualizador

O botão "Ver em 3D" só aparece se:
```typescript
productData.has3DModel === true
```

### Fluxo de Dados:

1. **Produto cadastrado** com modelo 3D (GLB/GLTF)
2. **Campo `modelo3d`** salvo no localStorage
3. **Página de detalhes** verifica se existe modelo
4. **Botão "Ver em 3D"** é exibido
5. **Ao clicar**, carrega o model-viewer com o arquivo

### Exemplo de Produto com Modelo 3D:

```typescript
const produto = {
  id: '1',
  nome: 'Suporte de Headset',
  imagens: ['foto1.jpg', 'foto2.jpg'],
  has3DModel: true,
  modelo3d: 'https://exemplo.com/suporte.glb', // URL do modelo
  // ... outros campos
};
```

---

## 🧪 Como Testar

### 1. Acessar Página de Produto
```
https://www.3dkprint.com.br/produtos/1
```

### 2. Verificar Botão "Ver em 3D"
- Deve aparecer no canto superior direito
- Deve ter ícone 🎮

### 3. Clicar no Botão
- Imagem deve ser substituída por visualizador 3D
- Modelo Astronaut deve aparecer
- Auto-rotação deve estar ativa

### 4. Testar Controles
- **Arrastar:** Modelo rotaciona
- **Scroll:** Zoom in/out funciona
- **Painel de instruções:** Aparece na parte inferior

### 5. Voltar para Fotos
- Clicar em "📷 Fotos"
- Deve voltar para galeria de imagens
- Thumbnails devem funcionar normalmente

---

## 📱 Responsividade

### Mobile (< 768px):
- Visualizador ocupa largura total
- Controles touch-friendly
- Painel de instruções compacto
- Botão de alternância visível

### Tablet (768px - 1024px):
- Layout intermediário
- Controles otimizados para touch
- Painel de instruções legível

### Desktop (> 1024px):
- Visualizador em tamanho completo
- Controles de mouse precisos
- Painel de instruções detalhado

---

## 🚀 Próximos Passos

### Curto Prazo:
1. **Conectar com produtos reais**
   - Substituir URL de exemplo pela URL do produto
   - Carregar modelo do localStorage/API

2. **Adicionar mais controles**
   - Botão de fullscreen
   - Botão de reset de câmera
   - Seletor de variantes (cores)

3. **Melhorar loading**
   - Skeleton loader enquanto carrega
   - Progress bar
   - Mensagem de erro se falhar

### Médio Prazo:
1. **AR (Realidade Aumentada)**
   - Ativar atributo `ar`
   - Permitir visualizar produto no ambiente real
   - Botão "Ver em AR"

2. **Anotações no modelo**
   - Hotspots com informações
   - Medidas e dimensões
   - Detalhes técnicos

3. **Variantes 3D**
   - Trocar cor do modelo dinamicamente
   - Aplicar texturas diferentes
   - Mostrar opções de acabamento

### Longo Prazo:
1. **Editor 3D**
   - Permitir customização online
   - Adicionar texto/gravações
   - Exportar modelo personalizado

2. **Galeria 3D**
   - Múltiplos modelos por produto
   - Comparação lado a lado
   - Animações e explosões

3. **Integração com Configurador**
   - Montar produto peça por peça
   - Calcular preço em tempo real
   - Gerar arquivo para impressão

---

## 🔍 Detalhes Técnicos

### Biblioteca:
- **Nome:** @google/model-viewer
- **Versão:** 4.1.0
- **Licença:** Apache 2.0
- **Documentação:** https://modelviewer.dev/

### Formatos Suportados:
- **GLB** (recomendado) - Binário, mais rápido
- **GLTF** - JSON, mais flexível
- **USDZ** (iOS AR) - Para realidade aumentada

### Performance:
- **Lazy loading:** Carrega apenas quando necessário
- **Caching:** Browser cache automático
- **Otimização:** Modelos devem ser < 10MB
- **Compressão:** Usar Draco para GLB

### Browser Support:
- ✅ Chrome 67+
- ✅ Firefox 65+
- ✅ Safari 12.1+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## 📊 Código Completo

### Imports:
```typescript
import { useState, useEffect, useRef } from 'react';
import '@google/model-viewer';
```

### Estado:
```typescript
const [show3D, setShow3D] = useState(false);
const modelViewerRef = useRef<any>(null);
```

### useEffect:
```typescript
useEffect(() => {
  import('@google/model-viewer');
}, []);
```

### JSX:
```tsx
<div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
  {show3D && productData.has3DModel ? (
    <model-viewer
      ref={modelViewerRef}
      src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
      alt="Modelo 3D do produto"
      auto-rotate
      camera-controls
      shadow-intensity="1"
      style={{ width: '100%', height: '100%', background: '#f5f5f5' }}
      loading="eager"
      reveal="auto"
    ></model-viewer>
  ) : (
    <img src={productData.images[selectedImage]} alt={productData.name} />
  )}
  
  {/* Botão de alternância */}
  {productData.has3DModel && (
    <button onClick={() => setShow3D(!show3D)}>
      {show3D ? '📷 Fotos' : '🎮 Ver em 3D'}
    </button>
  )}
  
  {/* Painel de instruções */}
  {show3D && productData.has3DModel && (
    <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white px-4 py-3 rounded-lg text-xs backdrop-blur-sm">
      <p>💡 Controles do Visualizador 3D:</p>
      <ul>
        <li>🖱️ <strong>Arrastar:</strong> Rotacionar modelo</li>
        <li>🔍 <strong>Scroll:</strong> Zoom in/out</li>
        <li>🔄 <strong>Auto-rotação:</strong> Ativada</li>
      </ul>
    </div>
  )}
</div>
```

---

## ⚠️ Notas Importantes

### Modelo de Exemplo:
Atualmente usando modelo de exemplo (Astronaut.glb) da biblioteca model-viewer. Para produção, substituir por:
```typescript
src={produto.modelo3d || "https://modelviewer.dev/shared-assets/models/Astronaut.glb"}
```

### CORS:
Arquivos GLB/GLTF devem estar hospedados com CORS habilitado:
```
Access-Control-Allow-Origin: *
```

### Otimização:
Modelos grandes podem demorar para carregar. Recomendações:
- Comprimir com Draco
- Reduzir polígonos
- Otimizar texturas
- Usar LOD (Level of Detail)

### Fallback:
Se model-viewer não carregar, mostrar mensagem:
```tsx
<p>Seu navegador não suporta visualização 3D</p>
```

---

## 📞 Recursos Adicionais

### Documentação:
- **Model-Viewer:** https://modelviewer.dev/
- **Exemplos:** https://modelviewer.dev/examples/
- **Editor:** https://modelviewer.dev/editor/

### Ferramentas:
- **Blender:** Criar e exportar modelos GLB
- **Sketchfab:** Hospedar modelos 3D
- **gltf.report:** Validar e otimizar GLB
- **Draco:** Compressão de modelos

---

**Sistema:** 3DKPRINT  
**Versão:** 3.5.0  
**Data:** 08/02/2026  
**Status:** ✅ Visualizador 3D integrado e funcional na página de detalhes do produto
