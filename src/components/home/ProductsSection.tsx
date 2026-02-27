import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { produtosAPI } from '@/lib/apiClient';

export function ProductsSection() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await produtosAPI.getAll();
        // Pegar apenas os produtos em destaque e ativos
        const featured = allProducts
          .filter(p => p.featured && p.active)
          .slice(0, 4);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  if (!loading && featuredProducts.length === 0) {
    return null; // Não mostra a seção se não houver produtos em destaque
  }

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-accent font-bold text-sm uppercase tracking-widest mb-4"
            >
              Exclusividade 3DK
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight"
            >
              Produtos em Destaque
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/produtos">
              <Button variant="outline" className="mt-6 md:mt-0 border-accent text-accent hover:bg-accent hover:text-white font-bold px-8 py-6 rounded-xl transition-all">
                Ver catálogo completo
              </Button>
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-border"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group card-elevated overflow-hidden bg-white rounded-2xl border border-border hover:shadow-2xl transition-all duration-500"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.svg'}
                    alt={product.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                      Destaque
                    </div>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Link to={`/produtos/${product.id}`}>
                      <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 shadow-xl hover:scale-110 transition-transform">
                        <Eye className="h-6 w-6" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2 block">
                    {product.category_name || product.category}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg mt-1 mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                    <Link to={`/produtos/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-bold">{Number(product.rating || 5).toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground text-xs font-medium">({product.reviews || 0} avaliações)</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-gray-900">
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                      </span>
                      {product.original_price > 0 && (
                        <span className="text-sm text-muted-foreground line-through font-medium">
                          R$ {Number(product.original_price).toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                    <Link to={`/produtos/${product.id}`} className="bg-accent text-accent-foreground p-3 rounded-xl hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all hover:-translate-y-1">
                      <ShoppingCart className="h-6 w-6" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
