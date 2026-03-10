import { motion } from 'framer-motion';
import { MessageSquare, Download, Users, ExternalLink, Globe, ArrowRight, Star, Shield, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const groups = [
  {
    name: 'Comunidade de Impressão 3D Brasil',
    image: '/images/groups/comunidade-3d-brasil.png',
    description: 'Grupo 100% voltado ao universo 3D, com troca real de experiências, negócios e evolução constante.',
    topics: ['Conhecimentos / Notícias / Dicas', 'Vendas / Serviços (com valores)', 'Projetos 3D / Desenhos / Scanner 3D', 'Impressão 3D FDM e Resina', 'Pintura e Acabamento', 'Manutenção de Impressoras 3D'],
    values: ['Mentalidade aberta e colaborativa', 'Venda livre de impressoras novas e usadas', 'Sem restrições para o mundo 3D', 'Livre mercado e acesso a ferramentas para todos', 'Conhecimento compartilhado sem exceções'],
    rules: 'Proibido divulgar links patrocinados/afiliados sem autorização (ex: AliExpress, Amazon, Shopee e similares)',
    members: '2.4K+',
    link: 'https://chat.whatsapp.com/IA6hGmUaRIwHqS4JXNp6xR',
    badge: 'Principal',
    badgeColor: 'bg-green-500/10 text-green-600',
  },
  {
    name: 'Vendas 3D Brasil',
    image: '/images/groups/vendas-3d-brasil.png',
    description: 'Grupo exclusivo para venda e divulgação de impressoras 3D usadas e serviços de impressão 3D.',
    topics: ['Venda de impressoras 3D usadas', 'Serviços de impressão 3D', 'Manutenção de impressoras 3D', 'Pintura e acabamento', 'Modelagem 3D'],
    values: ['Anúncios devem conter VALOR + FOTOS REAIS + DESCRIÇÃO COMPLETA', 'Grupo organizado, profissional e focado em boas vendas'],
    rules: 'Proibido links, spam, assuntos fora do tema, política, drogas, pornografia ou mensagens paralelas. Quem não cumprir as regras será removido sem aviso.',
    members: '1.8K+',
    link: 'https://chat.whatsapp.com/E6pvTgWBdYfBcFVQwbJ9LZ',
    badge: 'Vendas',
    badgeColor: 'bg-blue-500/10 text-blue-600',
  },
  {
    name: '3D Resina Brasil',
    image: '/images/groups/resina-3d-brasil.png',
    description: 'Comunidade dedicada exclusivamente à impressão 3D em resina (SLA/DLP/LCD). Troca de experiências, configurações, resinas, pós-processamento e muito mais.',
    topics: ['Impressão em resina SLA/DLP/LCD', 'Configurações e perfis de impressão', 'Tipos de resina e aplicações', 'Pós-processamento: cura UV, lixamento, pintura', 'Suportes e orientação de peças', 'Manutenção de impressoras de resina'],
    values: ['Foco total em impressão de resina', 'Comunidade colaborativa e técnica', 'Dicas de segurança no manuseio de resinas', 'Compartilhamento de resultados e settings'],
    rules: 'Grupo focado em resina. Mantenha o respeito e compartilhe conhecimento. Proibido spam e conteúdo fora do tema.',
    members: '950+',
    link: 'https://chat.whatsapp.com/Fn3dRV0VudAJqXL3LDRAbq',
    badge: 'Resina',
    badgeColor: 'bg-purple-500/10 text-purple-600',
  },
  {
    name: 'STL Compartilha',
    image: '/images/groups/stl-compartilha.png',
    description: 'Grupo para compartilhamento de arquivos STL entre membros da comunidade. Arquivos 100% gratuitos para membros.',
    topics: ['Compartilhamento de arquivos STL', 'Modelos 3D gratuitos', 'Miniaturas e figuras', 'Peças funcionais e utilitárias', 'Projetos da comunidade maker'],
    values: ['Arquivos 100% gratuitos para membros', 'Comunidade maker colaborativa', 'Compartilhamento livre de modelos 3D'],
    rules: 'O compartilhamento de STL é de total responsabilidade dos participantes. Respeite direitos autorais e licenças dos criadores.',
    members: '1.2K+',
    link: 'https://chat.whatsapp.com/F2SvswavVTFFhJupz9pZri',
    badge: 'STL Grátis',
    badgeColor: 'bg-orange-500/10 text-orange-600',
  },
];

const slicers = [
  {
    name: 'PrusaSlicer',
    brand: 'Prusa Research',
    type: 'FDM / SLA',
    description: 'Fatiador open-source da Prusa, excelente para iniciantes e avançados. Suporta FDM e resina com perfis pré-configurados para diversas impressoras.',
    download: 'https://www.prusa3d.com/page/prusaslicer_424/',
    color: '#FA6831',
    logo: '/logos/slicers/prusaslicer.png',
    rating: 4.8,
    features: ['Open Source', 'Multi-material', 'Suporte SLA', 'Perfis prontos'],
  },
  {
    name: 'OrcaSlicer',
    brand: 'SoftFever',
    type: 'FDM',
    description: 'Fork do BambuStudio/PrusaSlicer com recursos avançados de calibração automática, suporte a Klipper e otimizações de velocidade.',
    download: 'https://github.com/SoftFever/OrcaSlicer/releases',
    color: '#00B4D8',
    logo: '/logos/slicers/orcaslicer.png',
    rating: 4.9,
    features: ['Calibração Auto', 'Suporte Klipper', 'Alta Velocidade', 'Multi-cor'],
  },
  {
    name: 'UltiMaker Cura',
    brand: 'UltiMaker',
    type: 'FDM',
    description: 'Um dos fatiadores mais populares do mundo. Interface intuitiva, marketplace de plugins e compatibilidade com centenas de impressoras.',
    download: 'https://ultimaker.com/software/ultimaker-cura/',
    color: '#1A73E8',
    logo: '/logos/slicers/cura.png',
    rating: 4.6,
    features: ['Marketplace', '500+ impressoras', 'Plugins', 'Interface fácil'],
  },
  {
    name: 'Bambu Studio',
    brand: 'Bambu Lab',
    type: 'FDM',
    description: 'Fatiador oficial da Bambu Lab, otimizado para impressoras de alta velocidade. Suporte nativo a AMS (sistema multi-filamento) e monitoramento remoto.',
    download: 'https://bambulab.com/en/download/studio',
    color: '#00C853',
    logo: '/logos/slicers/bambustudio.png',
    rating: 4.7,
    features: ['AMS Nativo', 'Monitoramento', 'Alta Velocidade', 'Cloud Print'],
  },
  {
    name: 'Lychee Slicer',
    brand: 'Mango 3D',
    type: 'Resina (SLA/DLP)',
    description: 'O melhor fatiador para impressão em resina. Geração automática de suportes inteligentes, hollow automático e interface profissional.',
    download: 'https://mango3d.io/',
    color: '#FF6F00',
    logo: '/logos/slicers/lychee.png',
    rating: 4.8,
    features: ['Suportes IA', 'Hollow Auto', 'Anti-aliasing', 'Ilha Detection'],
  },
  {
    name: 'ChituBox',
    brand: 'CBD-Tech',
    type: 'Resina (SLA/DLP)',
    description: 'Fatiador gratuito para resina com interface simples e eficiente. Compatível com a maioria das impressoras de resina do mercado.',
    download: 'https://www.chitubox.com/en/download/chitubox-free',
    color: '#7C4DFF',
    logo: '/logos/slicers/chitubox.png',
    rating: 4.5,
    features: ['Gratuito', '100+ impressoras', 'Suportes auto', 'Rápido'],
  },
];

export default function Community() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

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
              Nossa Comunidade
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Conectando entusiastas da <span className="text-accent">impressão 3D</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Junte-se aos nossos grupos de WhatsApp, baixe as melhores ferramentas e compartilhe conhecimento com milhares de makers brasileiros.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => scrollToSection('whatsapp-groups')} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Ver Grupos <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" onClick={() => scrollToSection('slicers-section')} variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                Baixar Fatiadores <Download className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Groups */}
      <section id="whatsapp-groups" className="section-padding bg-background scroll-mt-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Grupos de WhatsApp</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nossos grupos são moderados e focados em ajudar a comunidade a crescer. Escolha o que mais se adequa ao seu perfil e entre agora!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {groups.map((group, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated overflow-hidden flex flex-col h-full bg-white border border-border rounded-2xl"
              >
                {/* Group Image */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={group.image} 
                    alt={group.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${group.badgeColor} backdrop-blur-sm bg-white/80`}>
                      {group.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-xl font-bold text-white">{group.name}</h3>
                    <span className="text-sm text-white/80 flex items-center gap-1">
                      <Users className="w-4 h-4" /> {group.members} membros
                    </span>
                  </div>
                </div>

                {/* Group Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-muted-foreground mb-4">{group.description}</p>
                  
                  {/* Topics */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-accent" /> Tópicos do grupo:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {group.topics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Values */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" /> Sobre o grupo:
                    </h4>
                    <ul className="space-y-1">
                      {group.values.slice(0, 3).map((value, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span> {value}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rules */}
                  <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Regra:</strong> {group.rules}</span>
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-6">
                      <a href={group.link} target="_blank" rel="noopener noreferrer">
                        Entrar no Grupo <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Slicers Section */}
      <section id="slicers-section" className="section-padding bg-white scroll-mt-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Fatiadores Recomendados</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O fatiador é a ferramenta mais importante para uma boa impressão. Aqui estão os softwares que recomendamos e utilizamos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {slicers.map((slicer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-border rounded-2xl p-8 hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 overflow-hidden bg-white p-1">
                    <img 
                      src={slicer.logo} 
                      alt={`Logo ${slicer.name}`} 
                      className="w-full h-full object-contain rounded-xl"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-right">
                    <span className={`block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-1 ${
                      slicer.type.includes('FDM') && !slicer.type.includes('SLA') && !slicer.type.includes('Resina') ? 'bg-blue-500/10 text-blue-600' : 
                      slicer.type.includes('Resina') || slicer.type.includes('SLA') ? 'bg-purple-500/10 text-purple-600' :
                      'bg-teal-500/10 text-teal-600'
                    }`}>
                      {slicer.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">{slicer.brand}</span>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold">{slicer.rating}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{slicer.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {slicer.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {slicer.features.map((feature, i) => (
                    <span key={i} className="px-2 py-0.5 bg-muted/50 text-muted-foreground text-[10px] font-medium rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
                <Button asChild className="w-full font-semibold py-6 transition-all duration-300" style={{ backgroundColor: slicer.color }}>
                  <a href={slicer.download} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white">
                    Download <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-accent text-accent-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-6">Tem algum conteúdo para compartilhar?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Se você criou um tutorial, perfil de fatiador ou macro de Klipper e quer compartilhar com a comunidade, entre em contato conosco!
          </p>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900">
            <a href="https://wa.me/5543991741518" target="_blank" rel="noopener noreferrer">
              Enviar Conteúdo <Globe className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
