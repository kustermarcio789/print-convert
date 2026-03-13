import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Gauge, Layers, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductsByBrand } from '../lib/productsData';

const actualBrandsData: Record<string, {
  name: string;
  description: string;
  longDescription: string;
  categories: string[];
}> = {
  creality: {
    name: 'Creality',
    description: 'Líder mundial em impressoras 3D acessíveis',
    longDescription: 'A Creality é uma das maiores fabricantes de impressoras 3D do mundo, conhecida por modelos como Ender 3, CR-10 e a nova série K1. Oferecemos peças de reposição, upgrades e acessórios originais e compatíveis.',
    categories: ['Todos', 'PEI', 'Hotends', 'Motores', 'Correias', 'Bicos', 'Extrusoras'],
  },
  'bambu-lab': {
    name: 'Bambu Lab',
    description: 'Inovação em 3D com alta velocidade',
    longDescription: 'A Bambu Lab revolucionou o mercado com impressoras CoreXY de alta velocidade. Oferecemos peças originais e compatíveis para as séries X1, P1 e A1.',
    categories: ['Todos', 'AMS', 'Hotends', 'Bicos', 'PEI', 'Peças'],
  },
  prusa: {
    name: 'Prusa',
    description: 'Referência em qualidade open-source',
    longDescription: 'A Prusa Research é referência em qualidade e confiabilidade. Oferecemos peças originais e compatíveis para MK4, MK3S+, Mini e impressoras SLA.',
    categories: ['Todos', 'Hotends', 'PEI', 'Extrusoras', 'Peças', 'Eletrônica'],
  },
  anycubic: {
    name: 'Anycubic',
    description: 'Especialista em 3D de resina e FDM',
    longDescription: 'A Anycubic é conhecida por suas impressoras de resina Photon e FDM Kobra. Oferecemos resinas, FEP e peças de reposição.',
    categories: ['Todos', 'Resinas', 'FEP', 'Peças', 'Acessórios'],
  },
  voron: {
    name: 'Voron',
    description: 'Alta performance em DIY 3D printing',
    longDescription: 'O projeto Voron é referência em impressoras CoreXY de alto desempenho. Oferecemos kits completos e peças individuais para Voron 0, Trident e 2.4.',
    categories: ['Todos', 'Kits', 'Rails Lineares', 'Motores', 'Hotends', 'Eletrônica'],
  },
  elegoo: {
    name: 'Elegoo',
    description: 'Impressoras 3D de resina e FDM de alta qualidade',
    longDescription: 'A Elegoo é conhecida por suas impressoras de resina da série Saturn e Mars, além da nova linha FDM Centauri. Oferecemos impressoras completas, resinas, FEP e acessórios.',
    categories: ['Todos', 'Impressoras FDM', 'Impressoras Resina', 'Resinas', 'FEP', 'Acessórios'],
  },
  sovol: {
    name: 'Sovol',
    description: 'Impressoras CoreXY de alta velocidade baseadas em Voron',
    longDescription: 'A Sovol é especialista em impressoras CoreXY de alta velocidade baseadas no projeto Voron 2.4. Oferecemos impressoras completas das séries SV08, SV08 MAX e Zero, com velocidades de até 1200mm/s.',
    categories: ['Todos', 'Impressoras CoreXY', 'Impressoras Profissionais', 'Peças', 'Acessórios'],
  },
  flashforge: {
    name: 'Flashforge',
    description: 'Soluções profissionais e educacionais',
    longDescription: 'A Flashforge oferece impressoras 3D confiáveis para uso profissional e educacional. Oferecemos peças e acessórios para as linhas Adventurer e Guider.',
    categories: ['Todos', 'Peças', 'Bicos', 'Acessórios'],
  },
};

export default function BrandDetail() {
  const { brandId } = useParams<{ brandId: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    if (!brandId) return;
    setLoading(true);
    
    // Mapeamento de IDs da URL para nomes de marcas no productsData
    const brandMap: Record<string, string> = {
      'creality': 'Creality',
      'bambu-lab': 'Bambu Lab',
      'prusa': 'Prusa',
      'anycubic': 'Anycubic',
      'voron': 'Voron',
      'elegoo': 'Elegoo',
      'sovol': 'Sovol',
      'flashforge': 'Flashforge'
    };

    const brandName = brandMap[brandId] || brandId;
    
    const fetchProducts = async () => {
      try {
        const data = await getProductsByBrand(brandName);
        setProducts(data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [brandId]);

  const internalBrand = brandId ? actualBrandsData[brandId] : null;

  // Filtro client-side por categoria
  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter((p) => {
        const haystack = [
          p.category,
          p.subcategory,
          ...(p.tags ?? []),
        ].join(' ').toLowerCase();
        return haystack.includes(selectedCategory.toLowerCase());
      });

  if (!internalBrand) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Marca não encontrada</h1>
          <Link to="/marcas" className="text-accent hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar para Marcas
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4">
          <Link to="/marcas" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para Marcas
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{internalBrand.name}</h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              {internalBrand.longDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Produtos {internalBrand.name}</h2>
              <p className="text-muted-foreground">Confira nossa seleção de impressoras e peças originais.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {internalBrand.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                    selectedCategory === cat
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border hover:border-accent hover:text-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {product.badge}
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-square overflow-hidden bg-gray-50 relative">
                    <img
                      src={product.images?.[0] || '/placeholder-product.svg'}
                      alt={product.name}
                      className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Premium Quality</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">A partir de</span>
                        <span className="text-xl font-bold text-foreground">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <Link to={`/produto/${product.id}`}>
                        <button className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-lg shadow-primary/10">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Specs Preview on Hover */}
                  <div className="px-6 pb-6 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {product.specifications && Object.entries(product.specifications).slice(0, 2).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="font-bold">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
              <p className="text-muted-foreground text-lg">Nenhum produto encontrado para esta marca no momento.</p>
              <Link to="/produtos" className="text-accent hover:underline mt-4 inline-block">Ver todos os produtos</Link>
            </div>
          )}
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Precisa de ajuda técnica?</h2>
            <p className="text-muted-foreground mb-8">
              Somos especialistas em todas as marcas que representamos. Oferecemos suporte, manutenção e consultoria para sua impressora 3D.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contato">
                <button className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all">
                  Falar com Especialista
                </button>
              </Link>
              <Link to="/orcamento-manutencao">
                <button className="px-8 py-3 bg-white text-primary border border-border rounded-xl font-bold hover:bg-gray-50 transition-all">
                  Solicitar Manutenção
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
