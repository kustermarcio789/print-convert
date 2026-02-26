import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProducts } from '@/data/products';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [show3D, setShow3D] = useState(false);
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    const allProducts = getProducts();
    const foundProduct = allProducts.find(p => p.id === id);
    
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Redirecionar se o produto não for encontrado
      // navigate('/produtos');
    }

    // Carregar model-viewer
    import('@google/model-viewer');
  }, [id]);

  if (!product) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-muted-foreground">Carregando produto...</p>
        </div>
      </Layout>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-product.svg'];

  return (
    <Layout>
      <div className="container-custom py-8">
        <nav className="mb-8">
          <ol className="flex items-center text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-accent">Início</Link></li>
            <li className="mx-2">/</li>
            <li><Link to="/produtos" className="hover:text-accent">Produtos</Link></li>
            <li className="mx-2">/</li>
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              {show3D && product.modelo3D ? (
                <model-viewer
                  ref={modelViewerRef}
                  src={product.modelo3D}
                  alt="Modelo 3D do produto"
                  auto-rotate
                  camera-controls
                  shadow-intensity="1"
                  style={{ width: '100%', height: '100%', background: '#f5f5f5' }}
                  loading="eager"
                  reveal="auto"
                ></model-viewer>
              ) : (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
              
              {images.length > 1 && !show3D && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {product.modelo3D && (
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
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => { setSelectedImage(index); setShow3D(false); }}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index && !show3D ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="uppercase tracking-wider">{product.category}</span>
              {product.brand && (
                <>
                  <span>•</span>
                  <span>{product.brand}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < 5 ? 'text-amber-500 fill-current' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="font-medium">5.0</span>
              <span className="text-muted-foreground">(Novidade)</span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-foreground">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description || 'Nenhuma descrição disponível para este produto.'}
            </p>

            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground h-12">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
              
              <Button variant="outline" className="w-full h-12 border-accent text-accent hover:bg-accent/10">
                <MessageCircle className="w-5 h-5 mr-2" />
                Dúvidas? Fale no WhatsApp
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/30">
                <Truck className="w-6 h-6 text-accent mb-2" />
                <span className="text-xs font-medium">Frete Seguro</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/30">
                <Shield className="w-6 h-6 text-accent mb-2" />
                <span className="text-xs font-medium">Garantia 3DK</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/30">
                <RotateCcw className="w-6 h-6 text-accent mb-2" />
                <span className="text-xs font-medium">7 dias Troca</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16">
          <Tabs defaultValue="specs">
            <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-auto p-0 space-x-8">
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-4">Especificações</TabsTrigger>
              <TabsTrigger value="tags" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-4">Tags</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="py-8">
              <div className="max-w-2xl">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {product.specifications && Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                      <tr key={key}>
                        <td className="py-3 font-medium text-foreground w-1/3">{key}</td>
                        <td className="py-3 text-muted-foreground">{value}</td>
                      </tr>
                    ))}
                    {!product.specifications && (
                      <tr>
                        <td className="py-3 text-muted-foreground">Nenhuma especificação disponível.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="tags" className="py-8">
              <div className="flex flex-wrap gap-2">
                {product.tags && product.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                    {tag}
                  </span>
                ))}
                {!product.tags && <p className="text-muted-foreground">Nenhuma tag disponível.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
