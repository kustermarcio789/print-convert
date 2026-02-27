import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, ChevronDown, Zap, Clock, Cpu, Settings, Github, FileText, History, Layers, Maximize } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const klipperVsMarlin = [
  {
    category: 'Arquitetura',
    klipper: 'Baseado em host (Raspberry Pi). O firmware roda em um computador externo potente.',
    marlin: 'Firmware embarcado na placa de controle. Tudo roda diretamente na impressora.',
  },
  {
    category: 'Velocidade',
    klipper: 'Muito mais rápido. Pode processar 10.000+ passos por segundo. Ideal para ultra-velocidade.',
    marlin: 'Limitado pela placa. Geralmente 5.000-8.000 passos por segundo. Adequado para uso geral.',
  },
  {
    category: 'Configuração',
    klipper: 'Arquivo de texto simples (printer.cfg). Fácil de editar sem recompilação.',
    marlin: 'Requer recompilação do código C++. Mais complexo para fazer mudanças rápidas.',
  },
];

const technicalGuides = [
  {
    id: 'fdm-resina',
    title: 'FDM vs Resina: Qual escolher?',
    description: 'Entenda as diferenças fundamentais entre as duas tecnologias mais populares.',
    icon: <Layers className="w-6 h-6" />,
    content: 'FDM (Filamento) é ideal para peças grandes e funcionais. Resina (SLA) é imbatível em detalhes finos e miniaturas.'
  },
  {
    id: 'mecanica',
    title: 'Movimentação: Rodinhas vs Guias',
    description: 'Análise técnica sobre sistemas de movimentação e precisão mecânica.',
    icon: <Settings className="w-6 h-6" />,
    content: 'Rodinhas V-Slot são silenciosas e baratas. Guias Lineares (MGN) oferecem rigidez máxima para altas velocidades.'
  },
  {
    id: 'eletronica',
    title: 'Eletrônica e Placas-mãe',
    description: 'Como os drivers TMC e os processadores 32-bits mudaram o jogo.',
    icon: <Cpu className="w-6 h-6" />,
    content: 'Drivers modernos como TMC2209 permitem movimentos silenciosos e recursos como Sensorless Homing.'
  }
];

const history3D = [
  { year: '1984', title: 'SLA Inventada', description: 'Chuck Hull cria a primeira impressora 3D.' },
  { year: '1991', title: 'FDM Patenteada', description: 'Stratasys lança a tecnologia de filamento.' },
  { year: '2022', title: 'Era Ultra-Fast', description: 'Bambu Lab e Klipper popularizam a alta velocidade.' },
];

export default function Knowledge() {
  const [expandedComparison, setExpandedComparison] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              📚 Base de Conhecimento
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Conhecimento Técnico Especializado
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Documentação detalhada sobre manutenção, calibração, eletrônica e a história da impressão 3D.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => scrollToSection('tech-guides')} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Guias Técnicos
              </Button>
              <Button onClick={() => scrollToSection('history')} variant="outline" className="text-primary-foreground border-primary-foreground">
                Linha do Tempo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Guias Técnicos - Design Anterior */}
      <section id="tech-guides" className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Guias Técnicos</h2>
            <p className="text-muted-foreground">Informações ricas sobre FDM, Resina e Mecânica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {technicalGuides.map((guide) => (
              <motion.div key={guide.id} className="card-elevated p-8 rounded-2xl bg-white border border-border group hover:border-accent transition-all">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                  {guide.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{guide.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{guide.description}</p>
                <div className="p-4 bg-muted/30 rounded-lg text-xs leading-relaxed italic">
                  "{guide.content}"
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Klipper vs Marlin */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Klipper vs Marlin</h2>
            <p className="text-muted-foreground">Diferenças fundamentais entre os firmwares.</p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {klipperVsMarlin.map((item) => (
              <div key={item.category} className="border border-border rounded-xl bg-white overflow-hidden">
                <button 
                  onClick={() => setExpandedComparison(expandedComparison === item.category ? null : item.category)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold"
                >
                  {item.category}
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedComparison === item.category ? 'rotate-180' : ''}`} />
                </button>
                {expandedComparison === item.category && (
                  <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border bg-muted/10">
                    <div>
                      <h4 className="text-accent font-bold text-xs uppercase mb-2">Klipper</h4>
                      <p className="text-sm">{item.klipper}</p>
                    </div>
                    <div>
                      <h4 className="text-primary font-bold text-xs uppercase mb-2">Marlin</h4>
                      <p className="text-sm">{item.marlin}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section id="history" className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Evolução da Impressão 3D</h2>
            <p className="text-muted-foreground">Do primeiro projeto até a alta velocidade atual.</p>
          </div>

          <div className="relative border-l-2 border-accent/20 ml-4 md:ml-0 md:left-1/2 md:-translate-x-1/2 space-y-12 pb-8">
            {history3D.map((event, index) => (
              <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="absolute left-[-9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-accent rounded-full border-4 border-white" />
                <div className={`ml-8 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <span className="text-accent font-bold text-xl">{event.year}</span>
                    <h3 className="font-bold text-lg mt-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
