import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, PenTool, Paintbrush, Wrench, ArrowRight, Sparkles, Box, Puzzle, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: Printer,
    title: 'Impressão 3D',
    description: 'Tecnologia FDM e SLA para prototipagem rápida e produção. Materiais diversos: PLA, PETG, ABS, Nylon, Resina.',
    href: '/produtos',
    features: ['Alta precisão dimensional', 'Diversos materiais', 'Grandes volumes'],
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: Box,
    title: 'Protótipos',
    description: 'Transforme suas ideias em modelos físicos para validação e testes de design.',
    href: '/produtos?categoria=prototipos',
    features: ['Validação de design', 'Testes funcionais', 'Iteração rápida'],
    gradient: 'from-indigo-500 to-purple-500',
    bgGlow: 'bg-indigo-500/5',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
  },
  {
    icon: Puzzle,
    title: 'Peças Funcionais',
    description: 'Produção de componentes duráveis e precisos para uso em máquinas e equipamentos.',
    href: '/produtos?categoria=pecas-funcionais',
    features: ['Alta resistência', 'Precisão mecânica', 'Materiais avançados'],
    gradient: 'from-green-500 to-teal-500',
    bgGlow: 'bg-green-500/5',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    icon: Gem,
    title: 'Miniaturas',
    description: 'Crie miniaturas detalhadas para colecionáveis, jogos de tabuleiro ou maquetes arquitetônicas.',
    href: '/produtos?categoria=miniaturas',
    features: ['Detalhes finos', 'Pintura personalizada', 'Diversos tamanhos'],
    gradient: 'from-red-500 to-orange-500',
    bgGlow: 'bg-red-500/5',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
  },
  {
    icon: PenTool,
    title: 'Modelagem 3D',
    description: 'Criamos seu modelo 3D a partir de desenhos, fotos ou descrições. Arquivos otimizados para impressão.',
    href: '/orcamento?servico=modelagem-3d',
    features: ['Do zero ao arquivo', 'Revisões inclusas', 'Entrega rápida'],
    gradient: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-500/5',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    icon: Paintbrush,
    title: 'Pintura Premium',
    description: 'Acabamento profissional com pintura automotiva, aerografia e detalhamento de alta qualidade.',
    href: '/orcamento?servico=pintura-premium',
    features: ['Acabamento perfeito', 'Cores personalizadas', 'Durabilidade'],
    gradient: 'from-orange-500 to-red-500',
    bgGlow: 'bg-orange-500/5',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    icon: Wrench,
    title: 'Manutenção',
    description: 'Conserto e manutenção de impressoras 3D. Calibração, upgrades e suporte técnico especializado.',
    href: '/orcamento?servico=manutencao',
    features: ['Diagnóstico grátis', 'Peças originais', 'Garantia'],
    gradient: 'from-green-500 to-emerald-500',
    bgGlow: 'bg-green-500/5',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
];

export function ServicesSection() {
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
            <span className="text-blue-600 text-sm font-semibold">Nossos Serviços</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight"
          >
            Soluções completas em{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              impressão 3D
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Da ideia ao produto final, oferecemos tudo que você precisa para 
            transformar seus projetos em realidade.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-2xl hover:border-gray-200 transition-all duration-500"
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-2xl ${service.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-600">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient} mr-2.5 shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to={service.href} className="inline-block mt-4">
                  <Button size="sm" className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white">
                    Ver Detalhes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Bottom gradient bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link to="/orcamento">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all">
              Solicitar orçamento agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
