import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { produtosAPI } from '@/lib/apiClient';

const badgeStyles = {
  bestseller: 'badge-bestseller',
  fast: 'badge-fast',
  premium: 'badge-premium',
};

const badgeLabels = {
  bestseller: 'Mais vendido',
  fast: 'Entrega rápida',
  premium: 'Premium',
};

export function ProductsSection() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

    useEffect(() => {
    const fetchFeaturedProducts = async () => {
    const allProducts = await produtosAPI.getAll();
    // Pegar apenas os produtos em destaque e ativos
    const featured = allProducts
      .filter(p => p.featured && p.active)
      .slice(0, 4)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.images && p.images.length > 0 ? p.images[0] : '/placeholder-product.svg',
        rating: p.rating || 5.0,
        reviews: p.reviews || 0,
        badge: p.featured ? 'bestseller' : undefined,
        category: p.category,
      }));
      setFeaturedProducts(featured);
    };
    fetchFeaturedProducts();
  }, []);

  if (featuredProducts.length === 0) {
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
              className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4"
            >
              Produtos em Destaque
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              Os mais vendidos
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/produtos">
              <Button variant="outline" className="mt-4 md:mt-0">
                Ver catálogo completo
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
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
                  <div className={`absolute top-3 left-3 ${badgeStyles[product.badge as keyof typeof badgeStyles]}`}>
                    {badgeLabels[product.badge as keyof typeof badgeLabels]}
                  </div>
                )}
                {/* Hover overlay */}
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

              {/* Content */}
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
      </div>
    </section>
  );
}
