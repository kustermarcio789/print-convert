import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, ShoppingCart, Eye, ChevronDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProducts } from '@/data/products';

const categories = [
  { id: 'all', name: 'Todas' },
  { id: 'pecas-impressora', name: 'Peças de Impressora 3D' },
  { id: 'prototipos', name: 'Protótipos' },
  { id: 'decoracao', name: 'Decoração' },
  { id: 'acessorios', name: 'Acessórios' },
  { id: 'colecionaveis', name: 'Colecionáveis' },
  { id: 'organizacao', name: 'Organização' },
];

const materials = [
  { id: 'pla', name: 'PLA' },
  { id: 'petg', name: 'PETG' },
  { id: 'abs', name: 'ABS' },
  { id: 'nylon', name: 'Nylon' },
  { id: 'resina', name: 'Resina' },
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
    const formattedProducts = allProducts.filter(p => p.active).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.images && p.images.length > 0 ? p.images[0] : '/placeholder-product.svg',
      rating: p.rating || 5.0,
      reviews: p.reviews || 0,
      badge: p.featured ? 'bestseller' : undefined,
      category: p.category,
      material: p.brand,
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

      <section className="bg-background border-b border-border sticky top-16 z-40">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
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

      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="filter-sidebar sticky top-40">
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
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold text-foreground mb-4">Materiais</h3>
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <div key={material.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={material.id}
                          checked={selectedMaterials.includes(material.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMaterials([...selectedMaterials, material.id]);
                            } else {
                              setSelectedMaterials(selectedMaterials.filter(m => m !== material.id));
                            }
                          }}
                          className="rounded border-gray-300 text-accent focus:ring-accent"
                        />
                        <label htmlFor={material.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                          {material.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} produtos encontrados
                </p>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group card-elevated overflow-hidden bg-background"
                    >
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
                        <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
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

                      <div className="p-4">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          {product.category}
                        </span>
                        <h3 className="font-semibold text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-accent transition-colors">
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
              ) : (
                <div className="text-center py-20 bg-background rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground">Nenhum produto encontrado com os filtros selecionados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
