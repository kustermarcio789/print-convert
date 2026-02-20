import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

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
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4"
            >
              Dúvidas Frequentes
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              Perguntas e Respostas
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left bg-card hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-muted-foreground">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
