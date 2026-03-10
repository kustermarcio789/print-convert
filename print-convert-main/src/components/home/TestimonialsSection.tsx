import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Quote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'Engenheiro Mecânico',
    company: 'AutoTech',
    content: 'Qualidade excepcional! As peças ficaram perfeitas, com acabamento impecável. O prazo de entrega foi surpreendentemente rápido. Recomendo demais!',
    rating: 5,
    avatar: 'CS',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Ana Rodrigues',
    role: 'Designer de Produto',
    company: 'Studio Design',
    content: 'Já fiz vários protótipos com a 3DKPRINT e sempre fico impressionada com a precisão. O suporte é excelente e o preço muito justo.',
    rating: 5,
    avatar: 'AR',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Roberto Mendes',
    role: 'Maker',
    company: 'RoboLab',
    content: 'Comprei minha Sovol SV08 aqui e o suporte pós-venda é incrível. Sempre me ajudam com dúvidas e calibração. Melhor loja de impressão 3D!',
    rating: 5,
    avatar: 'RM',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Fernanda Costa',
    role: 'Arquiteta',
    company: 'FC Arquitetura',
    content: 'As maquetes ficam perfeitas! A qualidade da impressão em resina é impressionante. Meus clientes adoram ver os projetos em miniatura.',
    rating: 5,
    avatar: 'FC',
    color: 'from-orange-500 to-red-500',
  },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-100 mb-6"
          >
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-yellow-700 text-sm font-semibold">Depoimentos</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight"
          >
            O que nossos clientes{' '}
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              dizem
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Mais de 500 projetos entregues com excelência.
          </motion.p>
        </div>

        {/* Testimonial carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-gray-200" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Stars */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto font-medium">
                  "{testimonials[current].content}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonials[current].color} flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonials[current].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">{testimonials[current].name}</div>
                    <div className="text-sm text-gray-500">{testimonials[current].role} — {testimonials[current].company}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === current ? 'bg-blue-500 w-8' : 'bg-gray-300 hover:bg-gray-400 w-2.5'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-8 border-t border-gray-100"
        >
          <p className="text-gray-600 text-lg mb-6">Junte-se a centenas de clientes satisfeitos! Solicite seu orçamento hoje.</p>
          <Link to="/orcamento">
            <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/40 transition-all">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
