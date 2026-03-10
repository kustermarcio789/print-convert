import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, Cog, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Envie seu arquivo',
    description: 'Faça upload do seu arquivo 3D (STL, OBJ, 3MF, STEP) ou nos envie sua ideia. Aceitamos também desenhos e fotos.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    icon: Cog,
    step: '02',
    title: 'Receba o orçamento',
    description: 'Em minutos você recebe o valor, prazo e opções de materiais e acabamentos. Sem compromisso.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
  {
    icon: Truck,
    step: '03',
    title: 'Entrega na sua porta',
    description: 'Após aprovação, imprimimos e enviamos para qualquer lugar do Brasil com rastreamento.',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6"
          >
            <span className="text-gray-600 text-sm font-semibold">Como Funciona</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight"
          >
            Seu projeto em{' '}
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              3 passos simples
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Do arquivo ao produto final em 24-48 horas. Sem burocracia, sem surpresas.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector arrow */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-16 -right-3 z-20 items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm">
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </div>
              )}
              
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 text-center h-full group hover:-translate-y-2">
                {/* Step number */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${item.bg} mb-6 relative group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-9 h-9 ${item.iconColor}`} />
                  <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r ${item.color} text-white text-xs font-bold flex items-center justify-center shadow-lg`}>
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 text-lg mb-6">Pronto para começar? Solicite seu orçamento agora mesmo!</p>
          <Link to="/orcamento">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all">
              Solicitar Orçamento Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
