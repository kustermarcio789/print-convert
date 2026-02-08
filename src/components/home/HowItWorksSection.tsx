import { motion } from 'framer-motion';
import { Upload, Cog, Truck } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Envie seu arquivo',
    description: 'Faça upload do seu arquivo 3D (STL, OBJ, 3MF) ou nos envie sua ideia. Aceitamos também desenhos e fotos.',
  },
  {
    icon: Cog,
    step: '02',
    title: 'Receba o orçamento',
    description: 'Em minutos você recebe o valor, prazo e opções de materiais e acabamentos. Sem compromisso.',
  },
  {
    icon: Truck,
    step: '03',
    title: 'Entrega na sua porta',
    description: 'Após aprovação, imprimimos e enviamos para qualquer lugar do Brasil com rastreamento.',
  },
];

export function HowItWorksSection() {
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
            Como Funciona
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Simples, rápido e sem complicação
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Em apenas 3 passos você transforma sua ideia em um produto real. 
            Todo o processo online, rápido e transparente.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent/50 to-accent/10" />
              )}
              
              {/* Icon */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-accent/10 mb-6">
                <item.icon className="w-10 h-10 text-accent" />
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                  {item.step}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
