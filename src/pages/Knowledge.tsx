import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, ChevronDown, Zap, Clock, Cpu, Settings, Github, FileText } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const klipperVsMarlin = [
  {
    category: 'Arquitetura',
    klipper: 'Baseado em host (Raspberry Pi, Orange Pi, etc.). O firmware roda em um computador externo.',
    marlin: 'Firmware embarcado na placa de controle (Arduino, STM32, etc.). Tudo roda na impressora.',
  },
  {
    category: 'Velocidade de Processamento',
    klipper: 'Muito mais rápido. Pode processar 10.000+ passos por segundo. Ideal para ultra-velocidade.',
    marlin: 'Limitado pela placa. Geralmente 5.000-8.000 passos por segundo. Adequado para uso geral.',
  },
  {
    category: 'Configuração',
    klipper: 'Arquivo de texto simples (printer.cfg). Fácil de editar e entender. Sem recompilação necessária.',
    marlin: 'Requer recompilação do código. Mais complexo para iniciantes. Muitas opções de compilação.',
  },
  {
    category: 'Recursos Avançados',
    klipper: 'Suporta input shaping, pressure advance, resonance compensation. Perfeito para impressoras de alto desempenho.',
    marlin: 'Recursos básicos. Suporta linear advance, mas sem as otimizações avançadas do Klipper.',
  },
  {
    category: 'Comunidade',
    klipper: 'Comunidade ativa e em crescimento. Muitos desenvolvedores contribuindo. Atualizações frequentes.',
    marlin: 'Comunidade muito grande e estabelecida. Suporte para praticamente todas as impressoras antigas.',
  },
  {
    category: 'Compatibilidade',
    klipper: 'Funciona com quase todas as placas de controle. Requer um computador host.',
    marlin: 'Compatível com praticamente todas as impressoras 3D existentes. Não requer computador externo.',
  },
  {
    category: 'Curva de Aprendizado',
    klipper: 'Moderada. Requer conhecimento de Linux e configuração. Mas muito mais intuitivo que Marlin.',
    marlin: 'Íngreme. Requer conhecimento de C++ e compilação. Muitas opções confusas para iniciantes.',
  },
  {
    category: 'Custo',
    klipper: 'Gratuito. Mas requer um computador host (Raspberry Pi ~R$ 200-300).',
    marlin: 'Gratuito. Usa a eletrônica existente da impressora.',
  },
];

const history3D = [
  {
    year: '1984',
    title: 'Invenção da Estereolitografia (SLA)',
    description: 'Chuck Hull inventa a estereolitografia, a primeira tecnologia de impressão 3D. Funda a 3D Systems. Patente US 4,575,330.',
    type: 'milestone',
  },
  {
    year: '1989',
    title: 'Sinterização Seletiva a Laser (SLS)',
    description: 'Carl Deckard desenvolve a SLS no MIT. Permite impressão de peças em pó (nylon, metal). Revoluciona a manufatura.',
    type: 'milestone',
  },
  {
    year: '1991',
    title: 'Modelagem por Deposição Fundida (FDM)',
    description: 'Scott Crump inventa o FDM e funda a Stratasys. Tecnologia que dominaria o mercado consumer 20 anos depois.',
    type: 'milestone',
  },
  {
    year: '2005',
    title: 'Projeto RepRap Iniciado',
    description: 'Adrian Bowyer lança o projeto RepRap (Replicating Rapid-prototyper). Objetivo: criar uma impressora 3D que se replica a si mesma. Open-source.',
    type: 'milestone',
  },
  {
    year: '2009',
    title: 'Makerbot Fundada',
    description: 'Bre Pettis funda a MakerBot. Lança a Cupcake CNC, primeira impressora 3D consumer acessível. Preço: ~$1000. Revoluciona o mercado.',
    type: 'milestone',
  },
  {
    year: '2012',
    title: 'Prusa i3 Lançada',
    description: 'Josef Prusa lança a Prusa i3, baseada em RepRap. Torna-se a impressora mais clonada e popular do mundo. Ainda em produção hoje.',
    type: 'milestone',
  },
  {
    year: '2014',
    title: 'Creality Fundada',
    description: 'Creality é fundada na China. Lança a Ender 3 em 2018, que se torna a impressora mais vendida globalmente.',
    type: 'milestone',
  },
  {
    year: '2016',
    title: 'Impressoras de Resina Baratas',
    description: 'Anycubic e Elegoo lançam impressoras de resina SLA acessíveis. Preços caem de $5000+ para $200-500. Democratiza a impressão de alta resolução.',
    type: 'milestone',
  },
  {
    year: '2018',
    title: 'Ender 3 Lançada',
    description: 'Creality lança a Ender 3. Preço revolucionário de ~$200. Vende milhões de unidades. Torna-se sinônimo de impressão 3D consumer.',
    type: 'milestone',
  },
  {
    year: '2020',
    title: 'Klipper Ganha Popularidade',
    description: 'Klipper, desenvolvido por Kevin O\'Connor, ganha tração. Comunidade cresce exponencialmente. Permite ultra-velocidade em impressoras comuns.',
    type: 'milestone',
  },
  {
    year: '2022',
    title: 'Bambu Lab e Ultra-Velocidade',
    description: 'Bambu Lab revoluciona o mercado com impressoras de ultra-velocidade (até 250mm/s). Lança o sistema AMS (Automatic Material System) multi-cores.',
    type: 'milestone',
  },
  {
    year: '2024-2026',
    title: 'Era da Inteligência Artificial e Automação',
    description: 'Impressoras com câmeras AI, detecção de falhas automática, calibração inteligente. Impressão 3D se torna mainstream em indústrias.',
    type: 'milestone',
  },
];

export default function Knowledge() {
  const [expandedComparison, setExpandedComparison] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
              📚 Base de Conhecimento
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Aprenda tudo sobre impressão 3D
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Desde a história da tecnologia até os firmwares mais avançados. Tudo que você precisa saber 
              para dominar a impressão 3D FDM e Resina.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => scrollToSection('tech-guides')} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Ver Guias Técnicos
              </Button>
              <Button onClick={() => scrollToSection('tech-comparison')} variant="outline" className="text-primary-foreground border-primary-foreground">
                Klipper vs Marlin
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Klipper vs Marlin */}
      <section id="tech-comparison" className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Klipper vs Marlin: Comparativo Técnico
            </motion.h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Entenda as diferenças entre os dois firmwares mais populares para impressoras 3D.
            </p>
          </div>

          <div className="space-y-4">
            {klipperVsMarlin.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedComparison(expandedComparison === item.category ? null : item.category)}
                  className="w-full flex items-center justify-between p-5 text-left bg-card hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground text-lg">{item.category}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedComparison === item.category ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedComparison === item.category && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30">
                        <div>
                          <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-accent" />
                            Klipper
                          </h4>
                          <p className="text-muted-foreground">{item.klipper}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-accent" />
                            Marlin
                          </h4>
                          <p className="text-muted-foreground">{item.marlin}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Links Externos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <a
              href="https://www.klipper3d.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="card-elevated p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <Zap className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-foreground mb-2">Documentação Klipper</h3>
              <p className="text-sm text-muted-foreground mb-4">Guia completo e oficial do Klipper.</p>
              <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                Acessar <ExternalLink className="w-4 h-4" />
              </div>
            </a>

            <a
              href="https://github.com/Klipper3d/klipper"
              target="_blank"
              rel="noopener noreferrer"
              className="card-elevated p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <Github className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-foreground mb-2">Repositório Klipper</h3>
              <p className="text-sm text-muted-foreground mb-4">Código-fonte no GitHub. Contribua!</p>
              <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                GitHub <ExternalLink className="w-4 h-4" />
              </div>
            </a>

            <a
              href="https://marlinfw.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="card-elevated p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <Cpu className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-foreground mb-2">Documentação Marlin</h3>
              <p className="text-sm text-muted-foreground mb-4">Guia oficial e referência do Marlin.</p>
              <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                Acessar <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* História da Impressão 3D */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              A História da Impressão 3D
            </motion.h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              De 1984 até hoje: como a impressão 3D evoluiu de um conceito futurista para uma tecnologia mainstream.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-accent to-accent/20" />

            {/* Timeline items */}
            <div className="space-y-12">
              {history3D.map((event, index) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className="flex-1">
                    <div className="card-elevated p-6 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-accent">{event.year}</span>
                        <span className="text-xs font-semibold bg-accent/10 text-accent px-2 py-1 rounded-full">
                          {event.type === 'milestone' ? '🎯 Marco' : '📌 Evento'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{event.title}</h3>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Documentação FDM & Resina */}
      <section id="tech-guides" className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Guias Técnicos Completos
            </motion.h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Documentação detalhada sobre impressão 3D FDM e Resina. Do básico ao avançado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FDM Guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-elevated p-8 rounded-2xl"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                <span className="text-2xl">🖨️</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Impressão 3D FDM</h3>
              <p className="text-muted-foreground mb-6">
                Tudo sobre Fused Deposition Modeling. Materiais, calibração, troubleshooting e otimizações.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Como funciona a tecnologia FDM</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Materiais: PLA, PETG, ABS, Nylon, TPU</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Calibração de cama, nozzle e extrusora</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Resolução de problemas comuns</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Upgrades e modificações</span>
                </div>
              </div>
              <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="https://all3dp.com/1/fdm-3d-printing-guide-how-it-works/" target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  Ler Guia Completo
                </a>
              </Button>
            </motion.div>

            {/* Resina Guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card-elevated p-8 rounded-2xl"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Impressão 3D Resina</h3>
              <p className="text-muted-foreground mb-6">
                Tudo sobre impressoras de resina (SLA/DLP). Técnicas, acabamento e segurança.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Como funciona a tecnologia SLA/DLP</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Tipos de resina e suas propriedades</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Pós-processamento e cura final</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Segurança e manuseio de resina</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-foreground">Troubleshooting de impressões</span>
                </div>
              </div>
              <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="https://all3dp.com/2/resin-3d-printing-guide-for-beginners/" target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  Ler Guia Completo
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ainda tem dúvidas?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Junte-se à nossa comunidade no WhatsApp e converse com especialistas em impressão 3D.
            </p>
            <Link to="/comunidade">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Ir para Comunidade
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
