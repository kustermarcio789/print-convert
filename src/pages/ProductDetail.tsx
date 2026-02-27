import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { produtosAPI } from '@/lib/apiClient';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [show3D, setShow3D] = useState(false);
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const foundProduct = await produtosAPI.getById(id as string);
        if (foundProduct) {
          setProduct(foundProduct);
          // Carregar model-viewer dinamicamente se houver modelo 3D
          if (foundProduct.modelo_3d || foundProduct.modelo3D) {
            import('@google/model-viewer');
          }
        } else {
          // navigate('/produtos');
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando produto...</p>
        </div>
      </Layout>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-product.svg'];
  const modelo3D = product.modelo_3d || product.modelo3D;

  return (
    <Layout>
      <div className="container-custom py-8">
        <nav className="mb-8">
          <ol className="flex items-center text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-accent transition-colors">Início</Link></li>
            <li className="mx-2">/</li>
            <li><Link to="/produtos" className="hover:text-accent transition-colors">Produtos</Link></li>
            <li className="mx-2">/</li>
            <li className="text-foreground font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-border shadow-sm">
              {show3D && modelo3D ? (
                <model-viewer
                  ref={modelViewerRef}
                  src={modelo3D}
                  alt="Modelo 3D do produto"
                  auto-rotate
                  camera-controls
                  shadow-intensity="1"
                  style={{ width: '100%', height: '100%', background: '#ffffff' }}
                  loading="eager"
                  reveal="auto"
                ></model-viewer>
              ) : (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              )}
              
              {images.length > 1 && !show3D && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md border border-border"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md border border-border"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {modelo3D && (
                <button
                  onClick={() => setShow3D(!show3D)}
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg ${
                    show3D 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-white text-foreground hover:bg-gray-50 border border-border'
                  }`}
                >
                  {show3D ? '📷 Ver Fotos' : '🎮 Ver em 3D'}
                </button>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => { setSelectedImage(index); setShow3D(false); }}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index && !show3D ? 'border-accent shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
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
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span className="text-accent uppercase tracking-wider">{product.category_name || product.category}</span>
              {product.brand && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{product.brand}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < (product.rating || 5) ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-lg">{Number(product.rating || 5).toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviews || 0} avaliações)</span>
            </div>

            <div className="flex items-baseline gap-4 py-4 border-y border-border">
              <span className="text-4xl font-bold text-foreground">
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </span>
              {product.original_price > 0 && (
                <span className="text-xl text-muted-foreground line-through">
                  R$ {Number(product.original_price).toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed text-lg">
              {product.description || 'Nenhuma descrição disponível para este produto.'}
            </p>

            <div className="space-y-4 pt-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex items-center justify-between border border-border rounded-lg bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground h-14 text-lg font-bold shadow-lg shadow-accent/20">
                  <ShoppingCart className="w-6 h-6 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
              
              <Button variant="outline" className="w-full h-14 border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold text-lg" onClick={() => window.open('https://wa.me/5527999999999', '_blank')}>
                <MessageCircle className="w-6 h-6 mr-2" />
                Dúvidas? Fale no WhatsApp
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
                <Truck className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-blue-900">Frete Seguro</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-green-50 border border-green-100">
                <Shield className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-xs font-bold text-green-900">Garantia 3DK</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-purple-50 border border-purple-100">
                <RotateCcw className="w-6 h-6 text-purple-600 mb-2" />
                <span className="text-xs font-bold text-purple-900">7 dias Troca</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-auto p-0 space-x-8">
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-4 font-bold text-lg">Especificações</TabsTrigger>
              <TabsTrigger value="tags" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-4 font-bold text-lg">Tags</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="py-8 animate-in fade-in duration-500">
              <div className="max-w-2xl bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {product.specifications && Object.entries(product.specifications).length > 0 ? (
                      Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                        <tr key={key} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-bold text-gray-900 w-1/3 bg-gray-50/50">{key}</td>
                          <td className="py-4 px-6 text-gray-600">{value}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-8 px-6 text-center text-muted-foreground italic">Nenhuma especificação técnica detalhada disponível.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="tags" className="py-8 animate-in fade-in duration-500">
              <div className="flex flex-wrap gap-3">
                {product.tags && product.tags.length > 0 ? (
                  product.tags.map((tag: string) => (
                    <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Nenhuma tag associada a este produto.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
