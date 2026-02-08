import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, PenTool, Paintbrush, Wrench, ArrowRight, Check, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const services = [
  {
    id: 'impressao',
    icon: Printer,
    title: 'Impressão 3D',
    description: 'Transformamos seus arquivos 3D em peças reais com alta precisão e qualidade profissional. Tecnologia FDM e SLA disponíveis.',
    features: [
      'Tecnologia FDM e SLA',
      'Diversos materiais disponíveis',
      'Alta precisão dimensional',
      'Produção em pequena e grande escala',
      'Prazo a partir de 24h',
    ],
    tags: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon', 'TPU', 'Resina'],
    image: '/images/impressao-3d-servico.jpg',
    ctaText: 'Solicitar Orçamento de Impressão',
    ctaLink: '/orcamento',
  },
  {
    id: 'modelagem',
    icon: PenTool,
    title: 'Modelagem 3D',
    description: 'Criamos o modelo 3D do seu projeto a partir de desenhos, fotos, ou descrições. Modelagem paramétrica, orgânica ou mista — arquivos otimizados para impressão.',
    features: [
      'Modelagem paramétrica (peças técnicas)',
      'Modelagem orgânica (figuras, esculturas)',
      'Digitalização de objetos',
      'Otimização para impressão',
      'Entrega do arquivo final (STL, OBJ, STEP)',
    ],
    tags: ['Fusion 360', 'Blender', 'ZBrush', 'SolidWorks'],
    image: '/images/modelagem-3d-servico.jpg',
    ctaText: 'Solicitar Orçamento de Modelagem',
    ctaLink: '/orcamento-modelagem',
  },
  {
    id: 'pintura',
    icon: Paintbrush,
    title: 'Pintura Premium',
    description: 'Acabamento profissional com técnicas de pintura automotiva e aerografia. Transforme sua peça bruta em produto final. Envie fotos da sua peça e receba propostas.',
    features: [
      'Pintura automotiva',
      'Aerografia artística',
      'Verniz de proteção',
      'Cores personalizadas',
      'Acabamento premium',
    ],
    tags: ['Fosco', 'Brilhante', 'Metálico', 'Texturizado'],
    image: '/images/pintura-premium-servico.jpg',
    ctaText: 'Solicitar Orçamento de Pintura',
    ctaLink: '/orcamento-pintura',
  },
  {
    id: 'manutencao',
    icon: Wrench,
    title: 'Manutenção de Impressoras',
    description: 'Conserto, calibração e upgrades para impressoras 3D. Suporte técnico especializado para todas as marcas. Serviço exclusivo realizado pela equipe técnica da 3DKPRINT.',
    features: [
      'Diagnóstico gratuito',
      'Calibração profissional',
      'Troca de peças',
      'Upgrades e melhorias',
      'Garantia no serviço',
    ],
    tags: ['Ender', 'Prusa', 'Anycubic', 'Creality', 'Bambu Lab'],
    image: '/images/manutencao-servico.jpg',
    ctaText: 'Solicitar Manutenção (WhatsApp)',
    ctaLink: 'https://wa.me/554391741518?text=Olá! Gostaria de solicitar manutenção para minha impressora 3D.',
    isExternal: true,
    isExclusive: true,
  },
];

export default function Services() {
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
              Nossos Serviços
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Soluções completas em impressão 3D
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Da modelagem ao acabamento final, oferecemos tudo que você precisa para 
              transformar suas ideias em produtos de alta qualidade.
            </p>
            <Link to="/orcamento">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Solicitar Orçamento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-background">
        <div className="container-custom space-y-24">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              id={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {service.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {service.description}
                </p>

                {/* Exclusive badge for maintenance */}
                {service.isExclusive && (
                  <div className="flex items-center gap-2 mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-blue-800 font-medium">
                      Serviço exclusivo realizado pela equipe técnica da 3DKPRINT
                    </span>
                  </div>
                )}

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {service.isExternal ? (
                  <a href={service.ctaLink} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      {service.ctaText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                ) : (
                  <Link to={service.ctaLink}>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      {service.ctaText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* Image */}
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
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
              Tem um projeto em mente?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Conte para nós! Analisamos seu projeto e enviamos um orçamento 
              personalizado em até 24 horas.
            </p>
            <Link to="/orcamento">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Fazer Orçamento Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
