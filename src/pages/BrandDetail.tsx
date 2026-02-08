import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Package, Star, ShoppingCart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const brandsData: Record<string, {
  name: string;
  description: string;
  longDescription: string;
  categories: string[];
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: string;
    oldPrice?: string;
    rating: number;
    reviews: number;
    badge?: string;
    image?: string;
  }>;
}> = {
  creality: {
    name: 'Creality',
    description: 'Líder mundial em impressoras 3D acessíveis',
    longDescription: 'A Creality é uma das maiores fabricantes de impressoras 3D do mundo, conhecida por modelos como Ender 3, CR-10 e a nova série K1. Oferecemos peças de reposição, upgrades e acessórios originais e compatíveis.',
    categories: ['Todos', 'PEI', 'Hotends', 'Motores', 'Correias', 'Bicos', 'Extrusoras'],
    products: [
      { id: '1', name: 'PEI Magnética Ender 3', category: 'PEI', price: 'R$ 89,90', oldPrice: 'R$ 119,90', rating: 4.8, reviews: 32, badge: 'Mais vendido', image: '/images/products/pei-magnetico.jpg' },
      { id: '2', name: 'Hotend All Metal CR-10', category: 'Hotends', price: 'R$ 149,90', rating: 4.9, reviews: 18, image: '/images/products/hotend-all-metal.png' },
      { id: '3', name: 'Kit Correias GT2 6mm', category: 'Correias', price: 'R$ 29,90', rating: 4.7, reviews: 45, image: '/images/products/correia-gt2.jpg' },
      { id: '4', name: 'Motor Nema 17 42-40', category: 'Motores', price: 'R$ 59,90', rating: 4.6, reviews: 22, image: '/images/products/motor-nema17.jpg' },
      { id: '5', name: 'Bico Hardened Steel 0.4mm', category: 'Bicos', price: 'R$ 39,90', rating: 4.9, reviews: 56, badge: 'Premium', image: '/images/products/bico-brass.jpg' },
      { id: '6', name: 'Extrusora Dual Gear', category: 'Extrusoras', price: 'R$ 79,90', oldPrice: 'R$ 99,90', rating: 4.8, reviews: 28 },
    ],
  },
  'bambu-lab': {
    name: 'Bambu Lab',
    description: 'Impressoras 3D de alta velocidade',
    longDescription: 'A Bambu Lab revolucionou o mercado com impressoras CoreXY de alta velocidade. Oferecemos peças originais e compatíveis para as séries X1, P1 e A1.',
    categories: ['Todos', 'AMS', 'Hotends', 'Bicos', 'PEI', 'Peças'],
    products: [
      { id: '1', name: 'Hotend Completo X1C', category: 'Hotends', price: 'R$ 199,90', rating: 4.9, reviews: 15, badge: 'Original' },
      { id: '2', name: 'PEI Texturizada P1S', category: 'PEI', price: 'R$ 129,90', rating: 4.8, reviews: 22 },
      { id: '3', name: 'Bico Hardened 0.4mm', category: 'Bicos', price: 'R$ 49,90', rating: 4.7, reviews: 33 },
      { id: '4', name: 'AMS Lite', category: 'AMS', price: 'R$ 899,90', rating: 4.9, reviews: 8, badge: 'Novo' },
      { id: '5', name: 'Kit Manutenção X1', category: 'Peças', price: 'R$ 159,90', rating: 4.6, reviews: 12 },
      { id: '6', name: 'PEI Lisa A1 Mini', category: 'PEI', price: 'R$ 89,90', oldPrice: 'R$ 109,90', rating: 4.8, reviews: 19 },
    ],
  },
  prusa: {
    name: 'Prusa',
    description: 'Impressoras open-source de alta qualidade',
    longDescription: 'A Prusa Research é referência em qualidade e confiabilidade. Oferecemos peças originais e compatíveis para MK4, MK3S+, Mini e impressoras SLA.',
    categories: ['Todos', 'Hotends', 'PEI', 'Extrusoras', 'Peças', 'Eletrônica'],
    products: [
      { id: '1', name: 'Hotend E3D Revo Prusa', category: 'Hotends', price: 'R$ 249,90', rating: 4.9, reviews: 11, badge: 'Original' },
      { id: '2', name: 'PEI Dupla Face MK4', category: 'PEI', price: 'R$ 139,90', rating: 4.8, reviews: 25 },
      { id: '3', name: 'Nextruder MK4', category: 'Extrusoras', price: 'R$ 349,90', rating: 5.0, reviews: 7 },
      { id: '4', name: 'Placa Buddy MK4', category: 'Eletrônica', price: 'R$ 299,90', rating: 4.7, reviews: 5 },
    ],
  },
  anycubic: {
    name: 'Anycubic',
    description: 'Especialista em impressoras de resina e FDM',
    longDescription: 'A Anycubic é conhecida por suas impressoras de resina Photon e FDM Kobra. Oferecemos resinas, FEP e peças de reposição.',
    categories: ['Todos', 'Resinas', 'FEP', 'Peças', 'Acessórios'],
    products: [
      { id: '1', name: 'Resina Standard Cinza 1kg', category: 'Resinas', price: 'R$ 119,90', rating: 4.7, reviews: 42, badge: 'Mais vendido' },
      { id: '2', name: 'FEP Film Photon Mono', category: 'FEP', price: 'R$ 49,90', rating: 4.6, reviews: 38 },
      { id: '3', name: 'Resina Water Washable', category: 'Resinas', price: 'R$ 149,90', rating: 4.8, reviews: 19 },
      { id: '4', name: 'Tela LCD Photon Mono', category: 'Peças', price: 'R$ 199,90', rating: 4.5, reviews: 8 },
    ],
  },
  voron: {
    name: 'Voron',
    description: 'Projeto open-source CoreXY de alto desempenho',
    longDescription: 'O projeto Voron é referência em impressoras CoreXY de alto desempenho. Oferecemos kits completos e peças individuais para Voron 0, Trident e 2.4.',
    categories: ['Todos', 'Kits', 'Rails Lineares', 'Motores', 'Hotends', 'Eletrônica'],
    products: [
      { id: '1', name: 'Kit Rails MGN12H 350mm', category: 'Rails Lineares', price: 'R$ 189,90', rating: 4.9, reviews: 14, badge: 'Premium' },
      { id: '2', name: 'Motor Nema 17 High Torque', category: 'Motores', price: 'R$ 79,90', rating: 4.8, reviews: 21 },
      { id: '3', name: 'Hotend Dragon HF', category: 'Hotends', price: 'R$ 199,90', rating: 4.9, reviews: 16 },
      { id: '4', name: 'Placa Octopus v1.1', category: 'Eletrônica', price: 'R$ 349,90', rating: 4.8, reviews: 9 },
      { id: '5', name: 'Kit Voron 2.4 350mm', category: 'Kits', price: 'R$ 2.499,90', rating: 5.0, reviews: 4, badge: 'Kit Completo' },
    ],
  },
  elegoo: {
    name: 'Elegoo',
    description: 'Impressoras de resina com excelente custo-benefício',
    longDescription: 'A Elegoo é conhecida por impressoras de resina acessíveis como Mars e Saturn. Oferecemos resinas, FEP e acessórios.',
    categories: ['Todos', 'Resinas', 'FEP', 'Acessórios', 'Peças'],
    products: [
      { id: '1', name: 'Resina ABS-Like Cinza 1kg', category: 'Resinas', price: 'R$ 129,90', rating: 4.8, reviews: 35 },
      { id: '2', name: 'FEP Film Saturn 2', category: 'FEP', price: 'R$ 59,90', rating: 4.7, reviews: 22 },
      { id: '3', name: 'Mercury X Wash & Cure', category: 'Acessórios', price: 'R$ 599,90', rating: 4.9, reviews: 11, badge: 'Novo' },
    ],
  },
  sovol: {
    name: 'Sovol',
    description: 'Impressoras FDM com excelente custo-beneficio e inovacao',
    longDescription: 'A Sovol oferece impressoras FDM com excelente custo-beneficio como SV06, SV07 e SV08. Pecas de reposicao e upgrades disponiveis.',
    categories: ['Todos', 'Hotends', 'Motores', 'Correias', 'Pecas', 'PEI'],
    products: [
      { id: '1', name: 'Hotend All Metal SV06', category: 'Hotends', price: 'R$ 99,90', rating: 4.7, reviews: 18 },
      { id: '2', name: 'PEI Magnetica SV06 Plus', category: 'PEI', price: 'R$ 79,90', rating: 4.6, reviews: 12 },
      { id: '3', name: 'Motor Nema 17 SV07', category: 'Motores', price: 'R$ 59,90', rating: 4.5, reviews: 8 },
    ],
  },
  flashforge: {
    name: 'Flashforge',
    description: 'Impressoras profissionais e educacionais',
    longDescription: 'A Flashforge produz impressoras para uso profissional e educacional. Oferecemos filamentos e peças de reposição.',
    categories: ['Todos', 'Filamentos', 'Hotends', 'Peças', 'Acessórios'],
    products: [
      { id: '1', name: 'Filamento PLA Premium 1kg', category: 'Filamentos', price: 'R$ 89,90', rating: 4.7, reviews: 28 },
      { id: '2', name: 'Hotend Adventurer 4', category: 'Hotends', price: 'R$ 129,90', rating: 4.6, reviews: 9 },
    ],
  },
};

export default function BrandDetail() {
  const { brandId } = useParams<{ brandId: string }>();
  const brand = brandsData[brandId || ''];

  if (!brand) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Marca não encontrada</h1>
            <Link to="/marcas">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Marcas
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container-custom">
          <Link to="/marcas" className="inline-flex items-center text-primary-foreground/70 hover:text-primary-foreground mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Marcas
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {brand.name}
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-3xl">
              {brand.longDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {brand.categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 text-sm font-medium rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brand.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="card-elevated overflow-hidden group"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-16 h-16 text-muted-foreground/30" />
                  )}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs text-accent font-medium uppercase">{product.category}</span>
                  <h3 className="text-base font-semibold text-foreground mt-1 mb-2 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-foreground">{product.price}</span>
                      {product.oldPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">{product.oldPrice}</span>
                      )}
                    </div>
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
