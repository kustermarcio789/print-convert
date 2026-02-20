import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock product data
const productData = {
  id: '1',
  name: 'Suporte de Headset Premium',
  description: 'Suporte elegante e funcional para seu headset, impresso em 3D com acabamento de alta qualidade. Design moderno que combina com qualquer setup gamer ou profissional.',
  price: 89.90,
  originalPrice: 119.90,
  rating: 4.9,
  reviews: 47,
  sku: '3DK-HST-001',
  category: 'Acessórios',
  images: [
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
  ],
  has3DModel: true,
  variants: {
    colors: [
      { id: 'black', name: 'Preto', hex: '#1a1a1a' },
      { id: 'white', name: 'Branco', hex: '#f5f5f5' },
      { id: 'blue', name: 'Azul', hex: '#3b82f6' },
    ],
    materials: [
      { id: 'pla', name: 'PLA', price: 0 },
      { id: 'petg', name: 'PETG (+R$15)', price: 15 },
      { id: 'abs', name: 'ABS (+R$20)', price: 20 },
    ],
    finishes: [
      { id: 'raw', name: 'Bruto', price: 0 },
      { id: 'sanded', name: 'Lixado (+R$20)', price: 20 },
      { id: 'painted', name: 'Pintado (+R$50)', price: 50 },
    ],
  },
  specifications: [
    { label: 'Dimensões', value: '15 x 10 x 20 cm' },
    { label: 'Peso', value: '150g' },
    { label: 'Material padrão', value: 'PLA' },
    { label: 'Suporta até', value: '500g' },
    { label: 'Prazo de produção', value: '2-3 dias úteis' },
  ],
  features: [
    'Design ergonômico e moderno',
    'Base antiderrapante',
    'Compatível com todos os headsets',
    'Fácil montagem (encaixe)',
    'Disponível em diversas cores',
  ],
};

const reviews = [
  {
    id: 1,
    author: 'João Silva',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    date: '15/01/2024',
    title: 'Excelente qualidade!',
    text: 'Superou minhas expectativas. O acabamento é perfeito e combinou muito bem com meu setup. Recomendo!',
  },
  {
    id: 2,
    author: 'Maria Oliveira',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    date: '10/01/2024',
    title: 'Perfeito para meu headset',
    text: 'Chegou super bem embalado e no prazo. A qualidade de impressão é excelente.',
  },
  {
    id: 3,
    author: 'Carlos Eduardo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    rating: 4,
    date: '05/01/2024',
    title: 'Muito bom',
    text: 'Produto de boa qualidade. Só achei que poderia ser um pouco maior, mas no geral estou satisfeito.',
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(productData.variants.colors[0].id);
  const [selectedMaterial, setSelectedMaterial] = useState(productData.variants.materials[0].id);
  const [selectedFinish, setSelectedFinish] = useState(productData.variants.finishes[0].id);
  const [quantity, setQuantity] = useState(1);
  const [show3D, setShow3D] = useState(false);
  const modelViewerRef = useRef<any>(null);

  // Carregar model-viewer
  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  const calculatePrice = () => {
    let price = productData.price;
    const material = productData.variants.materials.find((m) => m.id === selectedMaterial);
    const finish = productData.variants.finishes.find((f) => f.id === selectedFinish);
    if (material) price += material.price;
    if (finish) price += finish.price;
    return price * quantity;
  };

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-accent">Início</Link></li>
            <li className="mx-2">/</li>
            <li><Link to="/produtos" className="hover:text-accent">Produtos</Link></li>
            <li className="mx-2">/</li>
            <li className="text-foreground">{productData.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image / 3D Viewer */}
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
                <img
                  src={productData.images[selectedImage]}
                  alt={productData.name}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Image navigation */}
              <button
                onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : productData.images.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedImage((prev) => (prev < productData.images.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* 3D toggle */}
              {productData.has3DModel && (
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

              {/* 3D Controls Info */}
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
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => { setSelectedImage(index); setShow3D(false); }}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index && !show3D ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category & SKU */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="uppercase tracking-wider">{productData.category}</span>
              <span>•</span>
              <span>SKU: {productData.sku}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {productData.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(productData.rating) ? 'text-amber-500 fill-current' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="font-medium">{productData.rating}</span>
              <span className="text-muted-foreground">({productData.reviews} avaliações)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-foreground">
                R$ {calculatePrice().toFixed(2).replace('.', ',')}
              </span>
              {productData.originalPrice && quantity === 1 && selectedMaterial === 'pla' && selectedFinish === 'raw' && (
                <span className="text-lg text-muted-foreground line-through">
                  R$ {productData.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground">
              {productData.description}
            </p>

            {/* Variants */}
            <div className="space-y-6 pt-4 border-t border-border">
              {/* Color */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Cor: {productData.variants.colors.find((c) => c.id === selectedColor)?.name}
                </label>
                <div className="flex gap-3">
                  {productData.variants.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color.id ? 'border-accent scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Material */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Material
                </label>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productData.variants.materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Finish */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Acabamento
                </label>
                <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productData.variants.finishes.map((finish) => (
                      <SelectItem key={finish.id} value={finish.id}>
                        {finish.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Quantidade
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/5543991741518?text=Olá! Tenho interesse no produto: ${productData.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full">
                <MessageCircle className="w-5 h-5 mr-2" />
                Tirar dúvida no WhatsApp
              </Button>
            </a>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-accent mb-2" />
                <p className="text-sm text-muted-foreground">Frete para todo Brasil</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-accent mb-2" />
                <p className="text-sm text-muted-foreground">Compra segura</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-accent mb-2" />
                <p className="text-sm text-muted-foreground">7 dias de garantia</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs: Specs, Features, Reviews */}
        <div className="mt-16">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0">
              <TabsTrigger value="specs" className="data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none">
                Especificações
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none">
                Características
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none">
                Avaliações ({productData.reviews})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="py-8">
              <div className="max-w-2xl">
                <dl className="space-y-4">
                  {productData.specifications.map((spec, index) => (
                    <div key={index} className="flex border-b border-border pb-4">
                      <dt className="w-1/3 font-medium text-foreground">{spec.label}</dt>
                      <dd className="w-2/3 text-muted-foreground">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </TabsContent>

            <TabsContent value="features" className="py-8">
              <ul className="max-w-2xl space-y-3">
                {productData.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="reviews" className="py-8">
              <div className="max-w-3xl space-y-8">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-8">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-foreground">{review.author}</p>
                            <p className="text-sm text-muted-foreground">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-current' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">{review.title}</h4>
                        <p className="text-muted-foreground">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
