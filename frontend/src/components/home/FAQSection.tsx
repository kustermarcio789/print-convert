import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: 'Quais tipos de arquivos vocês aceitam?',
    answer: 'Aceitamos arquivos nos formatos STL, OBJ, 3MF, STEP e outros formatos CAD. Se você não tem o arquivo 3D, também podemos criar a modelagem a partir de desenhos, fotos ou descrições do seu projeto.',
  },
  {
    question: 'Quais materiais estão disponíveis?',
    answer: 'Trabalhamos com PLA, PETG, ABS, ASA, Nylon, TPU (flexível) e resinas (standard, tough, flexível). Cada material tem características específicas e podemos ajudar você a escolher o ideal para seu projeto.',
  },
  {
    question: 'Qual o prazo de entrega?',
    answer: 'O prazo varia de acordo com a complexidade e quantidade. Projetos simples podem ser entregues em 24-48h. Oferecemos também serviço expresso para urgências. O prazo exato é informado no orçamento.',
  },
  {
    question: 'Como funciona o frete?',
    answer: 'Enviamos para todo o Brasil via Correios (PAC e SEDEX) e transportadoras parceiras. O frete é calculado no checkout com base no CEP de destino e peso do pedido.',
  },
  {
    question: 'Vocês fazem pintura e acabamento?',
    answer: 'Sim! Oferecemos acabamento lixado, primer, pintura básica e pintura premium (automotiva/aerografia). O acabamento transforma a peça bruta em um produto final profissional.',
  },
  {
    question: 'Como faço para solicitar um orçamento?',
    answer: 'É simples! Clique em "Fazer Orçamento", envie seu arquivo (ou descreva o projeto), selecione material e acabamento, e receba o valor na hora. Sem compromisso e resposta imediata.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding bg-gray-50 relative overflow-hidden">
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
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 text-sm font-semibold">Perguntas Frequentes</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight"
          >
            Tire suas{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              dúvidas
            </span>
          </motion.h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="mb-3"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full flex items-center justify-between p-5 rounded-xl text-left transition-all duration-300 ${
                  openIndex === index
                    ? 'bg-white shadow-lg border border-blue-100'
                    : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <span className={`font-semibold pr-4 transition-colors ${
                  openIndex === index ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                    openIndex === index ? 'rotate-180 text-blue-500' : 'text-gray-400'
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-3 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-8 border-t border-gray-100"
        >
          <p className="text-gray-600 text-lg mb-6">Ainda tem duvidas? Fale com um especialista em impressao 3D agora mesmo!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orcamento">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all font-bold">
                Solicitar Orcamento Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="https://wa.me/5543991741518?text=Ola!%20Tenho%20duvidas%20sobre%20impressao%203D" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-50 text-lg px-10 py-6 rounded-xl font-bold">
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
