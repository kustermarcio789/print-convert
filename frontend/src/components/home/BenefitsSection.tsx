import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Lightbulb, Truck, Wrench, Palette, Package, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  {
    icon: Users,
    title: 'Atendimento Consultivo',
    description: 'Especialistas que entendem seu projeto e indicam a melhor solução',
    color: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: Lightbulb,
    title: 'Soluções Personalizadas',
    description: 'Adaptamos materiais, acabamentos e prazos para suas necessidades',
    color: 'from-yellow-500 to-orange-500',
    bgGlow: 'bg-yellow-500/5',
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
  },
  {
    icon: Truck,
    title: 'Envio para Todo Brasil',
    description: 'Frete rápido e rastreado para qualquer localização',
    color: 'from-green-500 to-emerald-500',
    bgGlow: 'bg-green-500/5',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    icon: Wrench,
    title: 'Suporte Técnico Especializado',
    description: 'Ajudamos com calibração, manutenção e troubleshooting',
    color: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-500/5',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    icon: Palette,
    title: 'Acabamento Premium',
    description: 'Pintura automotiva, aerografia e detalhamento profissional',
    color: 'from-red-500 to-pink-500',
    bgGlow: 'bg-red-500/5',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
  },
  {
    icon: Package,
    title: 'Peças e Acessórios',
    description: 'Catálogo completo de peças para diversas marcas de impressoras',
    color: 'from-indigo-500 to-blue-500',
    bgGlow: 'bg-indigo-500/5',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
  },
];

export function BenefitsSection() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-blue-600 text-sm font-semibold">Por que escolher a 3DKPrint</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight"
          >
            Diferenciais que{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              fazem a diferença
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Mais que uma loja, somos parceiros no seu sucesso com impressão 3D.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-2xl hover:border-gray-200 transition-all duration-500"
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-2xl ${benefit.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${benefit.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${benefit.iconColor}`} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Bottom gradient bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link to="/orcamento">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
