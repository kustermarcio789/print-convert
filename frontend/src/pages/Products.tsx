
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Filter, ImageOff } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { fmtBRL } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getActiveProducts, getBrands, Product } from '@/lib/productsData';

export function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || "all");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('categoria') || "all");
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allProducts = await getActiveProducts();
      setProducts(allProducts);

      const brands = await getBrands();
      setAvailableBrands(brands);

      const categories = Array.from(new Set(allProducts.map(p => p.category_name))).filter(cat => cat && cat.trim() !== '');
      setAvailableCategories(categories);

    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
    const categoryParam = searchParams.get('categoria');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let currentFilteredProducts = [...products];

    if (selectedBrand !== 'all') {
      currentFilteredProducts = currentFilteredProducts.filter((p) => p.brand === selectedBrand);
    }

    if (selectedCategory !== 'all') {
      currentFilteredProducts = currentFilteredProducts.filter((p) => p.category_name?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Ordenar produtos
    if (sortBy === 'price-asc') {
      currentFilteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      currentFilteredProducts.sort((a, b) => b.price - a.price);
    } else {
      currentFilteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFilteredProducts(currentFilteredProducts);
  }, [products, selectedBrand, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSelectedBrand("all");
    setSelectedCategory("all");
    navigate('/produtos');
  };

  const handleImageError = (productId: string) => {
    setFailedImages(prev => new Set(prev).add(productId));
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    const params = new URLSearchParams(searchParams);
    if (brand !== "all") {
      params.set('brand', brand);
    } else {
      params.delete('brand');
    }
    navigate(`/produtos?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category !== "all") {
      params.set('categoria', category);
    } else {
      params.delete('categoria');
    }
    navigate(`/produtos?${params.toString()}`);
  };

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-foreground mb-4">Carregando produtos...</h1>
              <p className="text-muted-foreground mb-6">Por favor, aguarde.</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-foreground mb-4">Erro ao carregar produtos</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={fetchProducts}>Tentar novamente</Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Impressoras 3D Premium
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Catálogo completo das melhores impressoras 3D do mercado. Filtro por marca, tipo e preço.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtros e Produtos */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filtros */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-muted/50 rounded-lg p-6 sticky top-20">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </h3>

                <div className="space-y-6">
                  {/* Marca */}
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Marca
                    </label>
                    <Select value={selectedBrand} onValueChange={handleBrandChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as marcas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as marcas</SelectItem>
                        {availableBrands.map((brand) => {
                          const brandValue = brand.trim();
                          if (!brandValue) return null;
                          return (
                            <SelectItem key={brand} value={brandValue}>
                              {brand}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Tipo
                    </label>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        {availableCategories.map((cat) => {
                          const catValue = cat.trim();
                          if (!catValue) return null;
                          return (
                            <SelectItem key={cat} value={catValue.toLowerCase()}>
                              {cat}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ordenação */}
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Ordenar por
                    </label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nome (A-Z)</SelectItem>
                        <SelectItem value="price-asc">Preço (Menor)</SelectItem>
                        <SelectItem value="price-desc">Preço (Maior)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Limpar Filtros */}
                  {(selectedBrand !== "all" || selectedCategory !== "all") && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Limpar Filtros
                    </Button>
                  )}
                  
                </div>
              </div>
            </motion.div>

            {/* Grade de Produtos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-3"
            >
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Nenhum produto encontrado com esses filtros.
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    Mostrando <span className="font-bold">{filteredProducts.length}</span> produto
                    {filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <div
                          onClick={() => navigate(`/produto/${product.id}`)}
                          className="bg-background border border-border rounded-lg overflow-hidden hover:border-accent transition-all duration-300 cursor-pointer flex flex-col h-full"
                        >
                          <div className="relative aspect-square overflow-hidden bg-gray-50">
                            {failedImages.has(product.id) ? (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <ImageOff className="w-12 h-12 text-muted-foreground" />
                              </div>
                            ) : (
                              <img
                                src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.svg'}
                                alt={product.name}
                                onError={() => handleImageError(product.id)}
                                className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                              />
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-grow">
                            <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2 block">
                              {product.category_name || product.category}
                            </span>
                            <h3 className="font-bold text-foreground text-base mt-1 mb-2 line-clamp-2 flex-grow group-hover:text-accent transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                              <div className="flex flex-col">
                                <span className="text-xl font-black text-foreground">
                                  {fmtBRL(product.price)}
                                </span>
                                {product.original_price > 0 && (
                                  <span className="text-sm text-muted-foreground line-through font-medium">
                                    {fmtBRL(product.original_price)}
                                  </span>
                                )}
                              </div>
                              <div className="bg-accent text-accent-foreground p-3 rounded-xl hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all hover:-translate-y-1">
                                <ShoppingCart className="h-5 w-5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
