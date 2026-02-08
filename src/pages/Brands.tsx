import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Package } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const brands = [
  {
    id: 'creality',
    name: 'Creality',
    description: 'Líder mundial em impressoras 3D acessíveis. Modelos como Ender 3, CR-10 e K1 são referência no mercado.',
    categories: ['Impressoras FDM', 'PEI', 'Hotends', 'Motores', 'Correias', 'Bicos'],
    productCount: 45,
    color: 'from-blue-500/20 to-blue-600/10',
  },
  {
    id: 'bambu-lab',
    name: 'Bambu Lab',
    description: 'Impressoras 3D de alta velocidade com tecnologia CoreXY. A série X1 e P1 revolucionaram o mercado.',
    categories: ['Impressoras CoreXY', 'AMS', 'Hotends', 'Bicos', 'PEI', 'Peças'],
    productCount: 32,
    color: 'from-green-500/20 to-green-600/10',
  },
  {
    id: 'prusa',
    name: 'Prusa',
    description: 'Impressoras open-source de alta qualidade. A Prusa MK4 e Mini são referência em confiabilidade.',
    categories: ['Impressoras FDM', 'Impressoras SLA', 'Hotends', 'PEI', 'Extrusoras'],
    productCount: 28,
    color: 'from-orange-500/20 to-orange-600/10',
  },
  {
    id: 'anycubic',
    name: 'Anycubic',
    description: 'Especialista em impressoras de resina e FDM. Photon e Kobra são modelos populares.',
    categories: ['Impressoras Resina', 'Impressoras FDM', 'Resinas', 'FEP', 'Peças'],
    productCount: 38,
    color: 'from-purple-500/20 to-purple-600/10',
  },
  {
    id: 'voron',
    name: 'Voron',
    description: 'Projeto open-source de impressoras CoreXY de alto desempenho. Voron 0, Trident e 2.4.',
    categories: ['Kits CoreXY', 'Rails Lineares', 'Motores', 'Hotends', 'Eletrônica'],
    productCount: 56,
    color: 'from-red-500/20 to-red-600/10',
  },
  {
    id: 'elegoo',
    name: 'Elegoo',
    description: 'Impressoras de resina com excelente custo-benefício. Mars e Saturn são best-sellers.',
    categories: ['Impressoras Resina', 'Resinas', 'FEP', 'Acessórios', 'Peças'],
    productCount: 24,
    color: 'from-cyan-500/20 to-cyan-600/10',
  },
  {
    id: 'artillery',
    name: 'Artillery',
    description: 'Impressoras FDM com boa relação custo-benefício. Sidewinder e Genius são destaques.',
    categories: ['Impressoras FDM', 'Hotends', 'Motores', 'Correias', 'Peças'],
    productCount: 18,
    color: 'from-yellow-500/20 to-yellow-600/10',
  },
  {
    id: 'flashforge',
    name: 'Flashforge',
    description: 'Impressoras profissionais e educacionais. Adventurer e Creator são linhas populares.',
    categories: ['Impressoras FDM', 'Filamentos', 'Hotends', 'Peças', 'Acessórios'],
    productCount: 22,
    color: 'from-indigo-500/20 to-indigo-600/10',
  },
];

export default function Brands() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Marcas
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Peças e acessórios por marca
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Encontre peças de reposição, upgrades e acessórios para sua impressora 3D. 
              Trabalhamos com as melhores marcas do mercado.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/marcas/${brand.id}`}
                  className="block card-elevated p-6 h-full group hover:border-accent/30 transition-all"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${brand.color} flex items-center justify-center mb-4`}>
                    <span className="text-xl font-bold text-foreground">{brand.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {brand.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {brand.categories.slice(0, 4).map((cat) => (
                      <span key={cat} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                        {cat}
                      </span>
                    ))}
                    {brand.categories.length > 4 && (
                      <span className="px-2 py-0.5 text-xs text-muted-foreground">
                        +{brand.categories.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      {brand.productCount} produtos
                    </span>
                    <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Categorias de produtos</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Navegue por categoria para encontrar exatamente o que precisa
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['PEI / Mesa', 'Hotends', 'Bicos / Nozzle', 'Motores', 'Correias', 'Extrusoras', 'Rails Lineares', 'Eletrônica', 'Filamentos', 'Resinas', 'FEP', 'Acessórios'].map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/produtos?categoria=${encodeURIComponent(cat)}`}
                  className="block text-center p-4 card-elevated hover:border-accent/30 transition-all group"
                >
                  <div className="text-sm font-medium text-muted-foreground group-hover:text-accent transition-colors">
                    {cat}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
