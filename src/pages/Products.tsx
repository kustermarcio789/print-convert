import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, ShoppingCart, Eye, ChevronDown, Package } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { produtosAPI, categoriasAPI } from '@/lib/apiClient';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allProducts, allCategories] = await Promise.all([
          produtosAPI.getAll(),
          categoriasAPI.getAll()
        ]);
        setProducts(allProducts || []);
        setCategories(allCategories || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = (products || []).filter((product) => {
    if (!product) return false;
    const productName = product.name || '';
    const productBrand = product.brand || '';
    
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         productBrand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           product.category_id === selectedCategory ||
                           product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
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
                placeholder="Buscar produtos por nome ou marca..."
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
              <div className="filter-sidebar sticky top-40 bg-white p-6 rounded-xl border border-border shadow-sm">
                <div>
                  <h3 className="font-bold text-foreground mb-4">Categorias</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-accent text-accent-foreground font-bold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      Todas as Categorias
                    </button>
                    {(categories || []).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-accent text-accent-foreground font-bold'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground font-medium">
                  {loading ? 'Carregando...' : `${sortedProducts.length} produtos encontrados`}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-border h-80 animate-pulse"></div>
                  ))}
                </div>
              ) : sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group card-elevated overflow-hidden bg-white border border-border rounded-xl hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.svg'}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.featured && (
                          <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                            Destaque
                          </div>
                        )}
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <Link to={`/produtos/${product.id}`}>
                            <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
                              <Eye className="h-5 w-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="p-5">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                          {product.category_name || product.category}
                        </span>
                        <h3 className="font-bold text-gray-900 mt-1 mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                          <Link to={`/produtos/${product.id}`}>
                            {product.name}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1 text-xs font-bold">{Number(product.rating || 5).toFixed(1)}</span>
                          </div>
                          <span className="text-muted-foreground text-xs">({product.reviews || 0})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900">
                              R$ {Number(product.price || 0).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                          <Link to={`/produtos/${product.id}`} className="bg-accent text-accent-foreground p-2 rounded-lg hover:bg-accent/90 transition-colors">
                            <ShoppingCart className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-border">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">Ainda não há produtos cadastrados.</p>
                  <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-2 text-accent">
                    Limpar todos os filtros
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
