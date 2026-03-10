/**
 * INSTRUÇÕES PARA ATUALIZAR AdminProdutos.tsx
 * 
 * Este arquivo contém as mudanças necessárias para integrar o componente ImageGallery
 * ao formulário de produtos do painel administrativo.
 */

// 1. ADICIONAR IMPORT NO TOPO DO ARQUIVO:
import ImageGallery, { GalleryImage } from '@/components/ImageGallery';

// 2. ATUALIZAR A INTERFACE ProdutoCustom:
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

// 3. ATUALIZAR O ESTADO newProduct:
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

// 4. ATUALIZAR handleAddProduct:
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
  const updated = [...customProdutos, produto];
  setCustomProdutos(updated);
  localStorage.setItem('admin_custom_produtos', JSON.stringify(updated));
  setNewProduct({
    nome: '',
    marca: '',
    categoria: 'FDM',
    preco: '',
    estoque: '',
    descricao: '',
    imagemBase64: '',
    imagens: [], // ADICIONAR ESTA LINHA
  });
  setShowAddForm(false);
};

// 5. SUBSTITUIR A SEÇÃO DE UPLOAD DE IMAGEM NO FORMULÁRIO:
// REMOVER ESTA PARTE (linhas 633-650 aproximadamente):
/*
{/* Image Upload for new product */}
<div className="mt-4">
  <label className="text-sm font-medium text-gray-300 mb-2 block">Foto do Produto</label>
  <div className="flex items-center gap-4">
    {newProduct.imagemBase64 ? (
      <div className="relative w-24 h-24 bg-white/5 rounded-lg overflow-hidden">
        <img src={newProduct.imagemBase64} alt="Preview" className="w-full h-full object-contain" />
        <button
          onClick={() => setNewProduct({ ...newProduct, imagemBase64: '' })}
          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
        >
          <X size={12} className="text-white" />
        </button>
      </div>
    ) : null}
    <label className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm cursor-pointer transition-colors">
      <Upload size={16} />
      {newProduct.imagemBase64 ? 'Trocar Foto' : 'Adicionar Foto'}
*/

// ADICIONAR ESTA PARTE:
{/* Image Gallery for new product */}
<div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4">
  <ImageGallery
    imagens={newProduct.imagens}
    onImagesChange={(imagens) => setNewProduct({ ...newProduct, imagens })}
    maxImages={10}
    titulo="Galeria de Imagens do Produto"
  />
</div>

// 6. ATUALIZAR getProductImage PARA USAR A GALERIA:
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

// 7. CRIAR FUNÇÃO PARA EXIBIR GALERIA DE IMAGENS:
const [viewingGallery, setViewingGallery] = useState<GalleryImage[] | null>(null);

// Adicionar este modal antes do return final:
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

// 8. ADICIONAR BOTÃO PARA VER GALERIA NA LISTA DE PRODUTOS:
// Adicionar este botão junto com os outros botões de ação:
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

/**
 * RESUMO DAS MUDANÇAS:
 * 
 * 1. Importar o componente ImageGallery
 * 2. Adicionar campo 'imagens' à interface ProdutoCustom
 * 3. Adicionar 'imagens' ao estado newProduct
 * 4. Atualizar handleAddProduct para incluir imagens
 * 5. Substituir o upload de imagem única pela galeria
 * 6. Atualizar getProductImage para usar a galeria
 * 7. Criar modal para visualizar galeria completa
 * 8. Adicionar botão para ver galeria na lista de produtos
 * 
 * BENEFÍCIOS:
 * - Múltiplas imagens por produto
 * - Reordenação de imagens (drag & drop)
 * - Definir imagem principal
 * - Visualizar galeria completa
 * - Upload com validação de tamanho e tipo
 */
