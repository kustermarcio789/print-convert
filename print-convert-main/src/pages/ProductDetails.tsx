
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Zap,
  Layers,
  Thermometer,
  Shield,
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getProductById, getRelatedProducts, Product } from '@/lib/productsData';

export function ProductDetails() {
  const { productId: id } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

            // Atualizar meta tags
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
              <h1 className="text-3xl font-bold text-foreground mb-4">Carregando produto...</h1>
              <p className="text-muted-foreground mb-6">Por favor, aguarde.</p>
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

  const handleAddToQuote = () => {
    toast({
      title: 'Produto adicionado',
      description: `${product.name} foi adicionado ao seu orçamento.`,
    });
    navigate('/orcamento');
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

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4"
            >
              <div className="bg-muted rounded-lg overflow-hidden aspect-square flex items-center justify-center relative">
                <img
                  src={product.images[currentImageIndex] || '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        currentImageIndex === idx
                          ? 'border-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Detalhes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-6"
            >
              {/* Título e Preço */}
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{product.description}</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-accent">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {product.original_price && (
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {product.original_price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
              </div>

              {/* Especificações Técnicas */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{key}</p>
                      <p className="text-sm font-semibold text-foreground">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Informações Adicionais (garantia, envio, suporte) */}
              <div className="space-y-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                {product.min_stock && (
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Estoque Mínimo: {product.min_stock}</p>
                    </div>
                  </div>
                )}
                {product.unit && (
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Unidade: {product.unit}</p>
                    </div>
                  </div>
                )}
                {product.cost_price && (
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Preço de Custo: R$ {product.cost_price.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleAddToQuote}
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Solicitar Orçamento
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={isFavorite ? 'text-accent' : ''}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Produtos Relacionados */}
      {relatedProducts.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-foreground mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/produto/${relatedProduct.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="bg-background rounded-lg overflow-hidden border border-border hover:border-accent/50 transition-all">
                    <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center">
                      <img
                        src={relatedProduct.images[0] || '/placeholder-product.svg'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{relatedProduct.brand}</p>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-2xl font-bold text-accent">
                        R$ {relatedProduct.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
