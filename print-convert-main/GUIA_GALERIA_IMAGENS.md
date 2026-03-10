# Guia de Integração - Galeria de Imagens Múltiplas

**Data:** 04 de Março de 2026
**Versão:** 3.7.0

## 1. Visão Geral

Implementamos um componente `ImageGallery` que permite adicionar múltiplas imagens por produto no painel administrativo. Este guia descreve como integrar o componente ao arquivo `AdminProdutos.tsx`.

## 2. Componente ImageGallery

### Funcionalidades
- **Upload Múltiplo:** Adicione várias imagens de uma vez (drag & drop ou clique).
- **Reordenação:** Arraste as imagens para reordenar (o primeiro é a principal).
- **Definir Principal:** Clique na estrela para definir qual imagem é a principal.
- **Visualização:** Clique no ícone de olho para visualizar a imagem em tamanho grande.
- **Download:** Baixe qualquer imagem diretamente.
- **Remover:** Delete imagens que não deseja mais.
- **Validação:** Valida tipo de arquivo (apenas imagens) e tamanho (máximo 5MB).

### Localização
- Arquivo: `src/components/ImageGallery.tsx`
- Exporta: `ImageGallery` (componente padrão) e `GalleryImage` (interface)

## 3. Como Integrar

### Passo 1: Importar o Componente

Adicione esta linha no topo do arquivo `AdminProdutos.tsx`:

```typescript
import ImageGallery, { GalleryImage } from '@/components/ImageGallery';
```

### Passo 2: Atualizar a Interface

Modifique a interface `ProdutoCustom` para incluir um campo de imagens:

```typescript
interface ProdutoCustom {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  descricao: string;
  imagemBase64?: string;
  imagens?: GalleryImage[]; // ADICIONAR ESTA LINHA
}
```

### Passo 3: Atualizar o Estado

Adicione o campo `imagens` ao estado `newProduct`:

```typescript
const [newProduct, setNewProduct] = useState({
  nome: '',
  marca: '',
  categoria: 'FDM',
  preco: '',
  estoque: '',
  descricao: '',
  imagemBase64: '',
  imagens: [] as GalleryImage[], // ADICIONAR ESTA LINHA
});
```

### Passo 4: Atualizar handleAddProduct

Modifique a função `handleAddProduct` para incluir as imagens:

```typescript
const handleAddProduct = () => {
  if (!newProduct.nome || !newProduct.marca || !newProduct.preco) return;
  const produto: ProdutoCustom = {
    id: `custom-${Date.now()}`,
    nome: newProduct.nome,
    marca: newProduct.marca,
    categoria: newProduct.categoria,
    preco: parseFloat(newProduct.preco),
    estoque: parseInt(newProduct.estoque) || 0,
    ativo: true,
    descricao: newProduct.descricao,
    imagemBase64: newProduct.imagemBase64,
    imagens: newProduct.imagens, // ADICIONAR ESTA LINHA
  };
  // ... resto da função
};
```

### Passo 5: Substituir o Upload de Imagem Única

Localize a seção "Image Upload for new product" (por volta da linha 633) e substitua por:

```typescript
{/* Image Gallery for new product */}
<div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4">
  <ImageGallery
    imagens={newProduct.imagens}
    onImagesChange={(imagens) => setNewProduct({ ...newProduct, imagens })}
    maxImages={10}
    titulo="Galeria de Imagens do Produto"
  />
</div>
```

### Passo 6: Atualizar getProductImage

Modifique a função `getProductImage` para usar a galeria:

```typescript
const getProductImage = (produto: any) => {
  // Prioridade: primeira imagem da galeria > imagem base64 > imagem padrão
  if (produto.imagens && produto.imagens.length > 0) {
    const principal = produto.imagens.find((img: GalleryImage) => img.principal);
    return principal?.url || produto.imagens[0]?.url;
  }
  if (imageOverrides[produto.id]) return imageOverrides[produto.id];
  if (produto.imagemBase64) return produto.imagemBase64;
  return produto.imagem;
};
```

### Passo 7: Adicionar Estado para Visualizar Galeria

Adicione um novo estado para controlar a visualização da galeria:

```typescript
const [viewingGallery, setViewingGallery] = useState<GalleryImage[] | null>(null);
```

### Passo 8: Adicionar Modal de Visualização

Adicione este modal antes do `return` final do componente:

```typescript
{viewingGallery && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
    <div className="bg-[#1a1d2e] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1d2e]">
        <h3 className="text-lg font-bold text-white">Galeria de Imagens</h3>
        <button
          onClick={() => setViewingGallery(null)}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {viewingGallery.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={img.url}
              alt={img.nome}
              className="w-full h-40 object-cover rounded-lg"
            />
            {img.principal && (
              <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                <Star className="w-4 h-4 text-white fill-white" size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
)}
```

### Passo 9: Adicionar Botão para Ver Galeria

Localize a seção onde os botões de ação dos produtos são exibidos e adicione:

```typescript
{produto.imagens && produto.imagens.length > 1 && (
  <button
    onClick={() => setViewingGallery(produto.imagens)}
    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
    title="Ver galeria de imagens"
  >
    <Eye size={14} />
    Galeria ({produto.imagens.length})
  </button>
)}
```

## 4. Exemplo de Uso

Após integrar, o usuário poderá:

1. Clicar em "Novo Produto"
2. Preencher os dados do produto
3. Na seção "Galeria de Imagens do Produto", arrastar múltiplas imagens ou clicar para selecionar
4. Reordenar as imagens arrastando-as
5. Clicar na estrela para definir a imagem principal
6. Clicar em "Salvar Produto"

## 5. Estrutura de Dados

As imagens são armazenadas como um array de objetos `GalleryImage`:

```typescript
interface GalleryImage {
  id: string;           // ID único gerado automaticamente
  url: string;          // URL ou base64 da imagem
  nome: string;         // Nome do arquivo
  principal?: boolean;  // Se é a imagem principal
  tamanho?: number;     // Tamanho do arquivo em bytes
}
```

## 6. Armazenamento

As imagens são salvas em `localStorage` junto com os outros dados do produto, em formato base64. Isso permite que as imagens sejam persistidas mesmo após recarregar a página.

## 7. Próximos Passos (Recomendado)

- **Backend:** Mover o armazenamento de imagens para o Supabase Storage.
- **Otimização:** Implementar compressão de imagens antes de salvar.
- **Visualização:** Exibir a galeria de imagens no site público.
- **Edição:** Permitir editar imagens já adicionadas.

## 8. Troubleshooting

### As imagens não aparecem após salvar
- Verifique se o `localStorage` tem espaço suficiente (limite de ~5-10MB por domínio).
- Considere mover para o backend (Supabase Storage).

### O drag & drop não funciona
- Certifique-se de que o componente está dentro de um formulário ou div com `onDragOver` e `onDrop`.

### Imagens muito grandes
- O componente valida imagens maiores que 5MB. Comprima as imagens antes de fazer upload.

## 9. Conclusão

Com esta integração, você terá um sistema robusto de gerenciamento de múltiplas imagens por produto, melhorando significativamente a experiência do usuário no painel administrativo.

Obrigado por usar esta solução!
