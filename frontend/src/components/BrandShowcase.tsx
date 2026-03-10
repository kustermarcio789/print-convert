import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getBrands, getProductCountByBrand, getProductsByBrand, Product } from '@/lib/productsData';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

const brandLogos: Record<string, string> = {
  'Sovol': 'https://via.placeholder.com/150x80?text=Sovol',
  'Elegoo': 'https://via.placeholder.com/150x80?text=Elegoo',
  'Creality': 'https://via.placeholder.com/150x80?text=Creality',
  'Anycubic': 'https://via.placeholder.com/150x80?text=Anycubic',
  'Prusa': 'https://via.placeholder.com/150x80?text=Prusa',
  'Flashforge': 'https://via.placeholder.com/150x80?text=Flashforge',
  'Formlabs': 'https://via.placeholder.com/150x80?text=Formlabs',
  'Phrozen': 'https://via.placeholder.com/150x80?text=Phrozen',
};

interface BrandData {
  name: string;
  productCount: number;
  products: Product[];
}

export function BrandShowcase() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandNames = await getBrands();
        const brandDataPromises = brandNames.map(async (brandName) => {
          const [productCount, products] = await Promise.all([
            getProductCountByBrand(brandName),
            getProductsByBrand(brandName)
          ]);
          return {
            name: brandName,
            productCount,
            products
          };
        });
        const brandData = await Promise.all(brandDataPromises);
        setBrands(brandData.filter(b => b.productCount > 0));
      } catch (error) {
        console.error('Erro ao buscar marcas:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
        <div className="container-custom flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-muted-foreground">Carregando marcas...</span>
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            <span className="text-blue-600 text-sm font-semibold">Marcas Confiáveis</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Marcas <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Premium</span> de Impressão 3D
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trabalhamos com as melhores marcas do mercado mundial de impressoras 3D, oferecendo {brands.length} marcas de ponta com qualidade garantida.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background border border-border rounded-lg p-6 hover:border-accent/50 transition-all hover:shadow-lg h-full flex flex-col">
                {/* Logo */}
                <div className="h-20 flex items-center justify-center mb-4 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={brandLogos[brand.name] || 'https://via.placeholder.com/150x80?text=' + brand.name}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Nome da Marca */}
                <h3 className="text-xl font-bold text-foreground mb-2">{brand.name}</h3>

                {/* Contagem de Produtos */}
                <div className="mb-4 flex-grow">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-2xl font-bold text-accent">{brand.productCount}</span>
                    <span className="ml-2">
                      {brand.productCount === 1 ? 'Produto' : 'Produtos'} disponível{brand.productCount !== 1 ? 's' : ''}
                    </span>
                  </p>
                </div>

                {/* Produtos Destaque */}
                <div className="mb-4 space-y-2">
                  {brand.products.slice(0, 2).map((product) => (
                    <p key={product.id} className="text-xs text-muted-foreground line-clamp-1">
                      • {product.name}
                    </p>
                  ))}
                  {brand.productCount > 2 && (
                    <p className="text-xs text-accent font-semibold">
                      + {brand.productCount - 2} mais
                    </p>
                  )}
                </div>

                {/* Botão */}
                <Button
                  variant="outline"
                  className="w-full hover:border-accent hover:bg-accent hover:text-white transition-all"
                  onClick={() => navigate(`/produtos?brand=${brand.name}`)}
                >
                  Ver Produtos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-8 border-t border-border"
        >
          <p className="text-gray-600 text-lg mb-6">Não encontrou a marca que procura?</p>
          <Link to="/orcamento">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all">
              Consultar Disponibilidade
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
