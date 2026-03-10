import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Zap, Cpu, Layers, Award, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const expertise = [
  {
    icon: Target,
    title: 'Placas PEI Premium',
    description: 'Especialistas em placas PEI de alta qualidade para impressoras FDM',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Cpu,
    title: 'Peças Sovol',
    description: 'Catálogo completo de peças e acessórios para impressoras Sovol',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Layers,
    title: 'Peças Creality',
    description: 'Componentes originais e compatíveis para toda linha Creality',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    title: 'Soluções Técnicas',
    description: 'Consultoria em calibração, troubleshooting e otimização de impressoras',
    color: 'from-green-500 to-emerald-500',
  },
];

export function ExpertiseSection() {
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
            <Award className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 text-sm font-semibold">Nossa Especialização</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight"
          >
            Experts em{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              impressão 3D
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Profundo conhecimento técnico em marcas e tecnologias específicas.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {expertise.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${item.color} bg-opacity-10 mb-4`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Precisa de consultoria técnica?
          </h3>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            Nossos especialistas estão prontos para ajudar com calibração, manutenção, troubleshooting e otimização de suas impressoras.
          </p>
          <Link to="/orcamento?servico=consultoria">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-6 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all">
              Solicitar Consultoria
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
