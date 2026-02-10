import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Star, ShoppingCart, Eye, ChevronDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getProducts } from '@/data/products';

const categories = [
  { id: 'all', name: 'Todas', count: 48 },
  { id: 'pecas-impressora', name: 'Peças de Impressora 3D', count: 24 },
  { id: 'prototipos', name: 'Protótipos', count: 12 },
  { id: 'decoracao', name: 'Decoração', count: 15 },
  { id: 'acessorios', name: 'Acessórios', count: 8 },
  { id: 'colecionaveis', name: 'Colecionáveis', count: 6 },
  { id: 'organizacao', name: 'Organização', count: 7 },
];

const materials = [
  { id: 'pla', name: 'PLA' },
  { id: 'petg', name: 'PETG' },
  { id: 'abs', name: 'ABS' },
  { id: 'nylon', name: 'Nylon' },
  { id: 'resina', name: 'Resina' },
];

// Produtos agora vêm do products.ts

const oldProducts = [
  {
    id: '1',
    name: 'Suporte de Headset Premium',
    price: 89.90,
    originalPrice: 119.90,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 47,
    badge: 'bestseller',
    category: 'Acessórios',
    material: 'PETG',
  },
  {
    id: '2',
    name: 'Vaso Geométrico Moderno',
    price: 59.90,
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 32,
    badge: 'fast',
    category: 'Decoração',
    material: 'PLA',
  },
  {
    id: '3',
    name: 'Action Figure Personalizado',
    price: 249.90,
    image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 18,
    badge: 'premium',
    category: 'Colecionáveis',
    material: 'Resina',
  },
  {
    id: '4',
    name: 'Organizador de Mesa',
    price: 79.90,
    originalPrice: 99.90,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 56,
    category: 'Organização',
    material: 'PLA',
  },
  {
    id: '5',
    name: 'Luminária Low Poly',
    price: 149.90,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 23,
    badge: 'bestseller',
    category: 'Decoração',
    material: 'PLA',
  },
  {
    id: '6',
    name: 'Protótipo Industrial',
    price: 399.90,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 8,
    category: 'Protótipos',
    material: 'ABS',
  },
  {
    id: '7',
    name: 'Porta-Celular Articulado',
    price: 39.90,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 89,
    badge: 'fast',
    category: 'Acessórios',
    material: 'PETG',
  },
  {
    id: '8',
    name: 'Estatueta Dragão',
    price: 189.90,
    image: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 12,
    badge: 'premium',
    category: 'Colecionáveis',
    material: 'Resina',
  },
  // Peças de Impressora 3D
  {
    id: '9',
    name: 'PEI Magnética Ender 3',
    price: 89.90,
    originalPrice: 119.90,
    image: '/images/products/pei-magnetico.jpg',
    rating: 4.8,
    reviews: 32,
    badge: 'bestseller',
    category: 'Peças de Impressora 3D',
    material: 'PEI',
  },
  {
    id: '10',
    name: 'Hotend All Metal CR-10',
    price: 149.90,
    image: '/images/products/hotend-all-metal.png',
    rating: 4.9,
    reviews: 18,
    category: 'Peças de Impressora 3D',
    material: 'Metal',
  },
  {
    id: '11',
    name: 'Kit Correias GT2 6mm',
    price: 29.90,
    image: '/images/products/correia-gt2.jpg',
    rating: 4.7,
    reviews: 45,
    category: 'Peças de Impressora 3D',
    material: 'Borracha',
  },
  {
    id: '12',
    name: 'Motor Nema 17 42-40',
    price: 59.90,
    image: '/images/products/motor-nema17.jpg',
    rating: 4.6,
    reviews: 22,
    category: 'Peças de Impressora 3D',
    material: 'Metal',
  },
  {
    id: '13',
    name: 'Bico Hardened Steel 0.4mm',
    price: 39.90,
    image: '/images/products/bico-brass.jpg',
    rating: 4.9,
    reviews: 56,
    badge: 'premium',
    category: 'Peças de Impressora 3D',
    material: 'Metal',
  },
];

const badgeStyles: Record<string, string> = {
  bestseller: 'badge-bestseller',
  fast: 'badge-fast',
  premium: 'badge-premium',
};

const badgeLabels: Record<string, string> = {
  bestseller: 'Mais vendido',
  fast: 'Entrega rápida',
  premium: 'Premium',
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const allProducts = getProducts();
    // Converter produtos para o formato esperado pela página
    const formattedProducts = allProducts.filter(p => p.active).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.images && p.images.length > 0 ? p.images[0] : '/placeholder-product.jpg',
      rating: p.rating || 4.5,
      reviews: p.reviews || 0,
      badge: p.featured ? 'bestseller' : undefined,
      category: p.category,
      material: p.brand, // Usando brand como material temporariamente
    }));
    setProducts(formattedProducts);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'pecas-impressora' && product.category === 'Peças de Impressora 3D') ||
      (selectedCategory !== 'pecas-impressora' && product.category.toLowerCase() === selectedCategory);
    const matchesMaterial = selectedMaterials.length === 0 || selectedMaterials.includes(product.material.toLowerCase());
    return matchesSearch && matchesCategory && matchesMaterial;
  });

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="container-custom">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4"
          >
            Catálogo de Produtos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary-foreground/80 text-lg"
          >
            Explore nossa coleção de produtos impressos em 3D com qualidade premium
          </motion.p>
        </div>
      </section>

      {/* Search and Filters Bar */}
      <section className="bg-background border-b border-border sticky top-16 z-40">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="rating">Melhor avaliados</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              className="md:hidden w-full"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="filter-sidebar sticky top-40">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Categorias</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-xs opacity-70">{category.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-4">Materiais</h3>
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <label
                        key={material.id}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedMaterials.includes(material.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMaterials([...selectedMaterials, material.id]);
                            } else {
                              setSelectedMaterials(selectedMaterials.filter((m) => m !== material.id));
                            }
                          }}
                        />
                        <span className="text-sm text-muted-foreground">{material.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="ghost"
                  className="w-full mt-6"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedMaterials([]);
                    setSearchQuery('');
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {filteredProducts.length} produtos encontrados
                </p>
              </div>

              <div className="product-grid">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group card-elevated overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.badge && (
                        <div className={`absolute top-3 left-3 ${badgeStyles[product.badge]}`}>
                          {badgeLabels[product.badge]}
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Link to={`/produtos/${product.id}`}>
                          <Button size="icon" variant="secondary" className="rounded-full">
                            <Eye className="h-5 w-5" />
                          </Button>
                        </Link>
                        <Button size="icon" className="rounded-full bg-accent hover:bg-accent/90">
                          <ShoppingCart className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          {product.category}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {product.material}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                        <Link to={`/produtos/${product.id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 text-sm font-medium">{product.rating}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">({product.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">
                    Nenhum produto encontrado com os filtros selecionados.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedMaterials([]);
                      setSearchQuery('');
                    }}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
