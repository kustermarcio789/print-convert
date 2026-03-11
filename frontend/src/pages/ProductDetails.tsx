import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Zap,
  Shield,
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  CreditCard,
  Truck,
  Package,
  Star,
  Box,
  Image as ImageIcon,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getProductById, getRelatedProducts, Product } from '@/lib/productsData';
import { useCart } from '@/contexts/CartContext';

const ProductViewer3D = lazy(() => import('@/components/ProductViewer3D'));

export function ProductDetails() {
  const { productId: id } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem, totalItems } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState<'images' | '3d'>('images');

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const fetchedProduct = await getProductById(id);
          if (fetchedProduct) {
            setProduct(fetchedProduct);
            const fetchedRelatedProducts = await getRelatedProducts(fetchedProduct.id, 3);
            setRelatedProducts(fetchedRelatedProducts);

            document.title = `${fetchedProduct.name} | 3DKPRINT - Impressoras 3D`;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
              metaDescription.setAttribute('content', fetchedProduct.description);
            }
          } else {
            setError('Produto não encontrado.');
          }
        } else {
          setError('ID do produto não fornecido.');
        }
      } catch (err) {
        console.error("Erro ao buscar dados do produto:", err);
        setError('Erro ao carregar o produto.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando produto...</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-foreground mb-4">{error || 'Produto não encontrado'}</h1>
              <p className="text-muted-foreground mb-6">O produto que você está procurando não existe ou houve um erro ao carregá-lo.</p>
              <Button onClick={() => navigate('/produtos')}>Voltar aos Produtos</Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0] || '/placeholder-product.svg',
      brand: product.brand,
    });
    toast({
      title: 'Adicionado ao carrinho!',
      description: `${quantity}x ${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0] || '/placeholder-product.svg',
      brand: product.brand,
    });
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copiado',
        description: 'O link do produto foi copiado para a área de transferência.',
      });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const inStock = product.active !== false;

  return (
    <Layout>
      {/* Breadcrumb */}
      <section className="bg-muted/30 border-b border-border py-4">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Início</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/produtos" className="text-muted-foreground hover:text-foreground transition-colors">Produtos</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-background py-8">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/produtos')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <span className="text-sm text-muted-foreground">{product.brand}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna 1 - Imagens / 3D */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2 flex flex-col gap-4"
            >
              {/* Abas Fotos / 3D */}
              {product.modelo_3d && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('images')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'images' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    <ImageIcon size={16} /> Fotos
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === '3d' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    <Box size={16} /> Visualizar 3D
                  </button>
                </div>
              )}

              {viewMode === '3d' && product.modelo_3d ? (
                <div className="bg-muted rounded-2xl overflow-hidden aspect-[4/3]">
                  <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Carregando visualizador 3D...</div>}>
                    <ProductViewer3D fileUrl={product.modelo_3d} />
                  </Suspense>
                </div>
              ) : (
              <div className="bg-muted rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center relative">
                <img
                  src={product.images[currentImageIndex] || '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.featured && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> Destaque
                    </span>
                  )}
                  {!inStock && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                      Esgotado
                    </span>
                  )}
                </div>
              </div>
              )}
              
              {/* Miniaturas */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        currentImageIndex === idx
                          ? 'border-blue-500 ring-2 ring-blue-500/30'
                          : 'border-border hover:border-blue-500/50'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Especificações Detalhadas */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-muted/30 rounded-2xl p-6 mt-4">
                  <h3 className="text-lg font-bold text-foreground mb-4">Especificações Técnicas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{key}</p>
                        <p className="text-sm font-semibold text-foreground">{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Coluna 2 - Informações e Compra (Sidebar) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              {/* Card Principal de Compra */}
              <div className="bg-background border border-border rounded-2xl p-6 shadow-lg sticky top-20">
                {/* Nome e Marca */}
                <div className="mb-4">
                  <p className="text-sm text-blue-500 font-semibold mb-1">{product.brand}</p>
                  <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                </div>

                {/* Preço */}
                <div className="mb-6 pb-4 border-b border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou 12x de {formatPrice(product.price / 12)} sem juros
                  </p>
                </div>

                {/* Quantidade */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-foreground mb-2 block">Quantidade</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                      disabled={quantity >= (product.stock || 99)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    {product.stock != null && product.stock > 0 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({product.stock} disponíveis)
                      </span>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3">
                  <Button
                    onClick={handleBuyNow}
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-lg py-6"
                    disabled={!inStock}
                  >
                    <CreditCard className="w-5 h-5" />
                    Comprar Agora
                  </Button>
                  
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 py-6"
                    disabled={!inStock}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Adicionar ao Carrinho
                    {totalItems > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </div>

                {/* Ações Secundárias */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`flex-1 ${isFavorite ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    Favorito
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>

                {/* Info de Entrega */}
                <div className="mt-6 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-foreground">Frete Grátis</p>
                      <p className="text-muted-foreground text-xs">Para compras acima de R$ 500</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-foreground">Garantia de 12 meses</p>
                      <p className="text-muted-foreground text-xs">Contra defeitos de fabricação</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-foreground">Embalagem Segura</p>
                      <p className="text-muted-foreground text-xs">Entrega com total proteção</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Produtos Relacionados */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Produtos Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/produto/${relatedProduct.id}`}
                    className="group bg-background border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img
                        src={relatedProduct.images[0] || '/placeholder-product.svg'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">{relatedProduct.brand}</p>
                      <h3 className="font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        {formatPrice(relatedProduct.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
}
