import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Printer, Box, Zap, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useEffect, useState } from 'react';
import { produtosAPI } from '@/lib/apiClient';

const theBrands = [
  {
    id: 'creality',
    name: 'Creality',        
    logo: '/images/brands/creality.jpg',
    description: 'Líder mundial em impressoras 3D acessíveis. Modelos como Ender 3, CR-10 e a nova série K1 são referência de mercado.',
    categories: ['Mesa PEI', 'Hotends', 'Bicos', 'Motores', 'Extrusoras'],
    color: 'from-[#00AEEF]/20 to-[#00AEEF]/5',
    accentColor: '#00AEEF'
  },
  {
    id: 'bambu-lab',
    name: 'Bambu Lab',
    logo: '/images/brands/bambulab.jpeg',
    description: 'Revolucionando a indústria com impressoras de ultra velocidade, sistema AMS multi-cores e calibração totalmente automática.',
    categories: ['A1 Series', 'P1 Series', 'X1 Series', 'Acessórios'],
    color: 'from-[#2ECC71]/20 to-[#2ECC71]/5',
    accentColor: '#2ECC71'
  },
  {
    id: 'prusa',
    name: 'Prusa Research',
    logo: '/images/brands/prusa.png',
    description: 'A marca mais respeitada pela robustez e confiabilidade. Hardware open-source de alta precisão fabricado na Europa.',
    categories: ['MK4', 'XL', 'MINI+', 'Peças de reposição'],    
    color: 'from-[#F39C12]/20 to-[#F39C12]/5',
    accentColor: '#F39C12'
  },
  {
    id: 'anycubic',
    name: 'Anycubic',
    logo: '/images/brands/anycubic.png',
    description: 'Especialista em impressoras de resina (SLA) e filamento com excelente custo-benefício e alta resolução.',
    categories: ['Photon', 'Kobra', 'Resinas', 'Acessórios'],
    color: 'from-[#3498DB]/20 to-[#3498DB]/5',
    accentColor: '#3498DB'
  },
  {
    id: 'voron',
    name: 'Voron Design',
    logo: '/images/brands/voron.png',
    description: 'O ápice da performance DIY. Impressoras CoreXY de código aberto projetadas para velocidade extrema e qualidade industrial.',
    categories: ['V2.4', 'Trident', 'V0.2', 'Componentes'],
    color: 'from-[#E74C3C]/20 to-[#E74C3C]/5',
    accentColor: '#E74C3C'
  },
  {
    id: 'elegoo',
    name: 'Elegoo',
    logo: '/images/brands/elegoo.jpg',
    description: 'Dominando o mercado de resina com a linha Saturn e Mars. Tecnologia acessível para hobbistas e profissionais.',
    categories: ['Mars', 'Saturn', 'Neptune', 'Acessórios'],
    color: 'from-[#1ABC9C]/20 to-[#1ABC9C]/5',
    accentColor: '#1ABC9C'
  },
  {
    id: 'flashforge',
    name: 'Flashforge',
    logo: '/images/brands/flashforge.png',
    description: 'Soluções fechadas e seguras para educação e indústria. Confiabilidade alemã com facilidade de uso.',
    categories: ['Adventurer', 'Guider', 'Creator', 'Acessórios'],
    color: 'from-[#9B59B6]/20 to-[#9B59B6]/5',
    accentColor: '#9B59B6'
  },
  {
    id: 'sovol',
    name: 'Sovol 3D',
    logo: '/images/brands/sovol.png',
    description: 'Inovação acessível com foco em grandes volumes de impressão e sistemas de extrusão direta eficientes.',
    categories: ['SV06', 'SV07', 'Peças'],
    color: 'from-[#34495E]/20 to-[#34495E]/5',
    accentColor: '#34495E'
  }
];

export default function Brands() {             
  const [counts, setCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const activeProducts = await produtosAPI.getAll();
        const countsMap = theBrands.reduce((acc: { [key: string]: number }, brand) => {
          acc[brand.id] = activeProducts.filter(p => 
            p.brand?.toLowerCase() === brand.id.toLowerCase() || 
            p.brand?.toLowerCase() === brand.name.toLowerCase()
          ).length;
          return acc;
        }, {});
        setCounts(countsMap);
      } catch (error) {
        console.error('Erro ao buscar contagens de marcas:', error);
      }
    };
    fetchCounts();
  }, []);

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-foreground">
                Marcas <span className="text-accent">Premium</span> de Impressão 3D
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Trabalhamos apenas com as fabricantes líderes mundiais para garantir que cada peça, 
                acessório ou impressora entregue o máximo de performance e precisão.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {theBrands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/marcas/${brand.id}`}
                  className="group block relative h-full bg-white dark:bg-zinc-900 rounded-[2rem] border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  {/* Header with Logo */}
                  <div className={`h-48 bg-gradient-to-br ${brand.color} flex items-center justify-center p-10 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <Printer className="absolute -right-4 -bottom-4 w-32 h-32 rotate-12" />
                    </div>
                    
                    <div className="relative z-10 w-full h-full flex items-center justify-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src={brand.logo} 
                        alt={brand.name} 
                        className="max-h-full max-w-full object-contain filter brightness-110 contrast-110 drop-shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=' + brand.name;
                        }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.accentColor }}></span>
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                        {brand.name}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                      {brand.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {brand.categories.slice(0, 3).map(cat => (
                        <span key={cat} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-muted text-muted-foreground rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-foreground">{counts[brand.id] || 0}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Produtos Ativos</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-accent font-bold text-sm group-hover:gap-4 transition-all">
                        Explorar Marca
                        <ArrowRight size={18} className="animate-pulse" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 bg-accent/5 rounded-3xl border border-accent/10">
              <Zap className="w-10 h-10 text-accent mb-4" />
              <h4 className="font-bold text-lg mb-2">Suporte Oficial</h4>
              <p className="text-sm text-muted-foreground">Assistência técnica especializada para todas as marcas parceiras.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-accent/5 rounded-3xl border border-accent/10">
              <Box className="w-10 h-10 text-accent mb-4" />
              <h4 className="font-bold text-lg mb-2">Peças Originais</h4>
              <p className="text-sm text-muted-foreground">Garantia de procedência em cada componente e acessório.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-accent/5 rounded-3xl border border-accent/10">
              <ShieldCheck className="w-10 h-10 text-accent mb-4" />
              <h4 className="font-bold text-lg mb-2">Qualidade Testada</h4>
              <p className="text-sm text-muted-foreground">Nossa equipe valida pessoalmente cada modelo antes da venda.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
