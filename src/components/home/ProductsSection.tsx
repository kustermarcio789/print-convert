import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock products data
const products = [
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
  },
];

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
          {products.map((product, index) => (
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
