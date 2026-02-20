import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, PenTool, Paintbrush, Wrench, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: Printer,
    title: 'Impressão 3D',
    description: 'Tecnologia FDM e SLA para prototipagem rápida e produção. Materiais diversos: PLA, PETG, ABS, Nylon, Resina.',
    href: '/servicos#impressao',
    features: ['Alta precisão', 'Diversos materiais', 'Grandes volumes'],
  },
  {
    icon: PenTool,
    title: 'Modelagem 3D',
    description: 'Criamos seu modelo 3D a partir de desenhos, fotos ou descrições. Arquivos otimizados para impressão.',
    href: '/servicos#modelagem',
    features: ['Do zero ao arquivo', 'Revisões inclusas', 'Entrega rápida'],
  },
  {
    icon: Paintbrush,
    title: 'Pintura Premium',
    description: 'Acabamento profissional com pintura automotiva, aerografia e detalhamento de alta qualidade.',
    href: '/servicos#pintura',
    features: ['Acabamento perfeito', 'Cores personalizadas', 'Durabilidade'],
  },
  {
    icon: Wrench,
    title: 'Manutenção',
    description: 'Conserto e manutenção de impressoras 3D. Calibração, upgrades e suporte técnico especializado.',
    href: '/servicos#manutencao',
    features: ['Diagnóstico grátis', 'Peças originais', 'Garantia'],
  },
];

export function ServicesSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4"
          >
            Nossos Serviços
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Soluções completas em impressão 3D
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Da ideia ao produto final, oferecemos tudo que você precisa para 
            transformar seus projetos em realidade.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group card-elevated p-6"
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <service.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {service.description}
              </p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to={service.href}>
                <Button variant="ghost" className="p-0 h-auto text-accent hover:text-accent/80 group/btn">
                  Saiba mais
                  <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/servicos">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver todos os serviços
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
