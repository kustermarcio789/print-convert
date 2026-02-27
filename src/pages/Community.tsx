import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Download, Users, ExternalLink, Globe, Heart, Shield, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const groups = [
  {
    name: '3DKPRINT - Comunidade Geral',
    description: 'Espaço para trocar experiências, tirar dúvidas e compartilhar impressões com outros entusiastas.',
    members: '1.2k+',
    link: 'https://chat.whatsapp.com/L1nK7890abc',
    icon: <Users className="w-6 h-6" />,
  },
  {
    name: 'Suporte Técnico Klipper',
    description: 'Grupo focado em configurações, macros e otimização de impressoras rodando firmware Klipper.',
    members: '450+',
    link: 'https://chat.whatsapp.com/KlpR4567def',
    icon: <Zap className="w-6 h-6" />,
  },
  {
    name: 'Marketplace 3D - Vendas e Trocas',
    description: 'Anuncie suas impressoras usadas, filamentos e peças. Exclusivo para membros da comunidade.',
    members: '800+',
    link: 'https://chat.whatsapp.com/MktP1234ghi',
    icon: <ExternalLink className="w-6 h-6" />,
  },
];

const slicers = [
  {
    name: 'UltiMaker Cura',
    type: 'FDM',
    description: 'O fatiador mais popular do mundo. Gratuito, código aberto e com centenas de plugins disponíveis.',
    download: 'https://ultimaker.com/software/ultimaker-cura',
    logo: '🔵',
  },
  {
    name: 'PrusaSlicer',
    type: 'FDM',
    description: 'Desenvolvido pela Prusa Research. Excelente qualidade de impressão e suporte a múltiplas marcas de impressoras.',
    download: 'https://www.prusa3d.com/en/page/prusaslicer_3d_printing_software/',
    logo: '🟠',
  },
  {
    name: 'OrcaSlicer',
    type: 'FDM',
    description: 'Fork moderno do PrusaSlicer com otimizações para ultra-velocidade. Padrão para Bambu Lab e Voron.',
    download: 'https://github.com/SoftFever/OrcaSlicer/releases',
    logo: '🐋',
  },
  {
    name: 'Bambu Studio',
    type: 'FDM',
    description: 'Fatiador oficial da Bambu Lab. Otimizado para impressoras de ultra-velocidade com suporte a multi-cores.',
    download: 'https://bambulab.com/en/download/studio',
    logo: '🟢',
  },
  {
    name: 'Lychee Slicer',
    type: 'Resina',
    description: 'O melhor fatiador para impressoras de resina. Interface 3D intuitiva e suporte a todos os modelos populares.',
    download: 'https://www.lychee3d.com/en/',
    logo: '💜',
  },
  {
    name: 'ChituBox',
    type: 'Resina',
    description: 'Fatiador gratuito para impressoras de resina. Compatível com Anycubic, Elegoo, Creality e outras marcas.',
    download: 'https://www.chitubox.com/en/',
    logo: '🟣',
  },
];

export default function Community() {
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
              Junte-se aos nossos grupos de WhatsApp, baixe as melhores ferramentas e compartilhe conhecimento com milhares de makers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Ver Grupos <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Baixar Fatiadores <Download className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Groups */}
      <section className="section-padding bg-background">
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
                className="card-elevated p-8 flex flex-col h-full"
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

      {/* Slicers Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Fatiadores Recomendados</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O fatiador é a ferramenta mais importante para uma boa impressão. Aqui estão os softwares que recomendamos e utilizamos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slicers.map((slicer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-background border border-border rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{slicer.logo}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    slicer.type === 'FDM' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                  }`}>
                    {slicer.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{slicer.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                  {slicer.description}
                </p>
                <Button asChild className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <a href={slicer.download} target="_blank" rel="noopener noreferrer">
                    Download <Download className="ml-2 h-4 w-4" />
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
          <Button size="lg" variant="outline" className="bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent">
            Enviar Conteúdo <Globe className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </Layout>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
