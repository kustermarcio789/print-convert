import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Download, Users, ExternalLink, Globe, Zap, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const groups = [
  {
    name: '3DKPRINT - Comunidade Geral',
    description: 'Espaço para trocar experiências, tirar dúvidas e compartilhar impressões com outros entusiastas.',
    members: '1.2k+',
    link: 'https://chat.whatsapp.com/G5Z5oO6V3lI6Kz7m8n9p0q', // Link de exemplo corrigido para formato real
    icon: <Users className="w-6 h-6" />,
  },
  {
    name: 'Suporte Técnico Klipper',
    description: 'Grupo focado em configurações, macros e otimização de impressoras rodando firmware Klipper.',
    members: '450+',
    link: 'https://chat.whatsapp.com/H6A6pP7W4mJ7Lz8o9n0r1s',
    icon: <Zap className="w-6 h-6" />,
  },
  {
    name: 'Marketplace 3D - Vendas e Trocas',
    description: 'Anuncie suas impressoras usadas, filamentos e peças. Exclusivo para membros da comunidade.',
    members: '800+',
    link: 'https://chat.whatsapp.com/I7B7qQ8X5nK8Mz9p0o1s2t',
    icon: <ExternalLink className="w-6 h-6" />,
  },
];

const slicers = [
  {
    name: 'PrusaSlicer',
    brand: 'Prusa Research',
    type: 'FDM',
    description: 'Desenvolvido pela Prusa Research. Referência em qualidade e suporte a múltiplas marcas.',
    download: 'https://www.prusa3d.com/page/prusaslicer_424/',
    logo: 'https://www.prusa3d.com/content/images/prusaslicer/logo_prusaslicer.png',
  },
  {
    name: 'OrcaSlicer',
    brand: 'SoftFever',
    type: 'FDM',
    description: 'Fork moderno do PrusaSlicer com otimizações para ultra-velocidade e calibrações integradas.',
    download: 'https://github.com/SoftFever/OrcaSlicer/releases',
    logo: 'https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/icons/orca_slicer_logo.png',
  },
  {
    name: 'UltiMaker Cura',
    brand: 'UltiMaker',
    type: 'FDM',
    description: 'O fatiador mais popular do mundo. Gratuito, código aberto e com centenas de plugins.',
    download: 'https://ultimaker.com/software/ultimaker-cura',
    logo: 'https://ultimaker.com/assets/images/software/ultimaker-cura-logo.png',
  },
  {
    name: 'Bambu Studio',
    brand: 'Bambu Lab',
    type: 'FDM',
    description: 'Fatiador oficial da Bambu Lab. Otimizado para ultra-velocidade e multi-cores.',
    download: 'https://bambulab.com/en/download/studio',
    logo: 'https://bambulab.com/assets/images/logo/bambu-studio-logo.png',
  },
  {
    name: 'Lychee Slicer',
    brand: 'Mango 3D',
    type: 'Resina & FDM',
    description: 'Versátil e poderoso. O melhor para resina e agora com suporte avançado para FDM.',
    download: 'https://mango3d.io/lychee-slicer-for-sla-3d-printers/',
    logo: 'https://mango3d.io/wp-content/uploads/2021/04/lychee-slicer-logo.png',
  },
  {
    name: 'ChituBox',
    brand: 'CBD-Tech',
    type: 'Resina',
    description: 'Padrão da indústria para impressoras de resina. Compatível com as principais marcas.',
    download: 'https://www.chitubox.com/en/download/chitubox-free',
    logo: 'https://www.chitubox.com/assets/images/logo.png',
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

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Layout>
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
              Junte-se aos nossos grupos de WhatsApp, baixe as melhores ferramentas e compartilhe conhecimento com milhares de makers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => scrollToSection('whatsapp-groups')} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Ver Grupos <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" onClick={() => scrollToSection('slicers-section')} variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Baixar Fatiadores <Download className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="whatsapp-groups" className="section-padding bg-background scroll-mt-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Grupos de WhatsApp</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nossos grupos são moderados e focados em ajudar a comunidade a crescer. Escolha o que mais se adequa ao seu perfil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {groups.map((group, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated p-8 flex flex-col h-full bg-white border border-border"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6">
                  {group.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{group.name}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">{group.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" /> {group.members} membros
                  </span>
                  <Button asChild variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10">
                    <a href={group.link} target="_blank" rel="noopener noreferrer">
                      Entrar <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                  <div className="w-20 h-20 bg-muted/30 rounded-2xl p-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={slicer.logo} 
                      alt={slicer.name} 
                      className="w-full h-full object-contain filter drop-shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/3d-printer.png';
                      }}
                    />
                  </div>
                  <div className="text-right">
                    <span className={`block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-1 ${
                      slicer.type.includes('FDM') ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                    }`}>
                      {slicer.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">{slicer.brand}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{slicer.name}</h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  {slicer.description}
                </p>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 font-semibold py-6">
                  <a href={slicer.download} target="_blank" rel="noopener noreferrer">
                    Download Software <Download className="ml-2 h-4 w-4" />
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
          <Button asChild size="lg" variant="outline" className="bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent">
            <a href="https://wa.me/5543991741518" target="_blank" rel="noopener noreferrer">
              Enviar Conteúdo <Globe className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
