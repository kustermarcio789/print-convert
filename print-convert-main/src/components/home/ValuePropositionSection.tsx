import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap, Award, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const valueProps = [
  {
    icon: Zap,
    title: 'Rápido',
    description: 'Orçamento em minutos, entrega em 24-48h',
  },
  {
    icon: Award,
    title: 'Qualidade Premium',
    description: 'Precisão dimensional e acabamento profissional',
  },
  {
    icon: Clock,
    title: 'Suporte 24/7',
    description: 'Especialistas em impressão 3D sempre prontos',
  },
];

export function ValuePropositionSection() {
  return (
    <section className="relative py-16 bg-white border-b border-gray-100">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{prop.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{prop.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
