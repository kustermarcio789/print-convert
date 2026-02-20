import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Search, HelpCircle, FileText, Package, CreditCard, Truck, Settings, Users, MessageCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories = [
    {
      icon: Package,
      title: 'Serviços',
      description: 'Impressão 3D, Modelagem, Pintura e Manutenção',
      link: '#servicos',
    },
    {
      icon: FileText,
      title: 'Orçamentos',
      description: 'Como solicitar e acompanhar orçamentos',
      link: '#orcamentos',
    },
    {
      icon: CreditCard,
      title: 'Pagamentos',
      description: 'Formas de pagamento e faturamento',
      link: '#pagamentos',
    },
    {
      icon: Truck,
      title: 'Entregas',
      description: 'Prazos, frete e rastreamento',
      link: '#entregas',
    },
    {
      icon: Settings,
      title: 'Produtos',
      description: 'Catálogo, especificações e garantia',
      link: '#produtos',
    },
    {
      icon: Users,
      title: 'Conta',
      description: 'Cadastro, login e dados pessoais',
      link: '#conta',
    },
  ];

  const faqs = [
    {
      category: 'Serviços',
      id: 'servicos',
      questions: [
        {
          question: 'Quais tipos de arquivos vocês aceitam para impressão 3D?',
          answer: 'Aceitamos arquivos nos formatos STL, OBJ, 3MF, STEP e FBX. O formato mais comum e recomendado é o STL. Se você não possui o arquivo 3D, oferecemos serviço de modelagem 3D personalizada.',
        },
        {
          question: 'Quais materiais estão disponíveis para impressão?',
          answer: 'Trabalhamos com diversos materiais: PLA (econômico e versátil), PETG (resistente e durável), ABS (alta resistência térmica), Nylon (flexível e resistente), TPU (flexível), Resina UV (alta precisão e detalhamento), entre outros. Consulte-nos para materiais específicos.',
        },
        {
          question: 'Qual o prazo de entrega para impressão 3D?',
          answer: 'O prazo varia de acordo com o tamanho, complexidade e quantidade de peças. Em média: Peças pequenas: 2-5 dias úteis, Peças médias: 5-10 dias úteis, Peças grandes ou complexas: 10-15 dias úteis. Oferecemos opção de produção expressa com acréscimo no valor.',
        },
        {
          question: 'Vocês fazem modelagem 3D do zero?',
          answer: 'Sim! Nossa equipe de designers 3D pode criar modelos a partir de desenhos, fotos, descrições ou engenharia reversa. O prazo e valor dependem da complexidade do projeto. Solicite um orçamento detalhado.',
        },
        {
          question: 'Como funciona o serviço de pintura?',
          answer: 'Oferecemos pintura profissional com acabamento automotivo, aerografia e detalhamento. Trabalhamos com primers, tintas acrílicas, esmaltes e vernizes. O processo inclui lixamento, preparação da superfície, pintura e acabamento final.',
        },
        {
          question: 'Vocês fazem manutenção de impressoras 3D?',
          answer: 'Sim! Realizamos manutenção preventiva e corretiva em impressoras FDM e resina. Serviços incluem: calibração, troca de peças, limpeza, upgrades, diagnóstico de problemas e consultoria técnica.',
        },
      ],
    },
    {
      category: 'Orçamentos',
      id: 'orcamentos',
      questions: [
        {
          question: 'Como solicitar um orçamento?',
          answer: 'Você pode solicitar orçamento de 3 formas: 1) Pelo formulário online em nosso site (resposta em até 24h), 2) Por WhatsApp (43) 9-9174-1518 (resposta imediata), 3) Por email 3dk.print.br@gmail.com. Envie o arquivo 3D ou descreva o que precisa.',
        },
        {
          question: 'Quanto tempo leva para receber o orçamento?',
          answer: 'Orçamentos simples são respondidos em até 24 horas úteis. Para projetos complexos ou personalizados, pode levar até 48 horas. Orçamentos via WhatsApp costumam ser mais rápidos.',
        },
        {
          question: 'O orçamento tem validade?',
          answer: 'Sim, todos os orçamentos têm validade de 7 dias corridos. Após esse prazo, podem ocorrer alterações nos valores devido a variações no custo de materiais.',
        },
        {
          question: 'Posso fazer alterações após aprovar o orçamento?',
          answer: 'Sim, mas alterações podem impactar o prazo e valor. Se a produção ainda não iniciou, podemos ajustar sem custos. Após o início, será necessário novo orçamento para as alterações.',
        },
        {
          question: 'Como acompanhar meu pedido?',
          answer: 'Após aprovação do orçamento, você receberá atualizações por email e WhatsApp sobre o andamento da produção. Você pode acompanhar o status na sua conta no site.',
        },
      ],
    },
    {
      category: 'Pagamentos',
      id: 'pagamentos',
      questions: [
        {
          question: 'Quais formas de pagamento vocês aceitam?',
          answer: 'Aceitamos: PIX (desconto de 5%), Cartão de crédito (até 12x), Boleto bancário (à vista), Transferência bancária. Para empresas, oferecemos faturamento com prazo.',
        },
        {
          question: 'Quando devo fazer o pagamento?',
          answer: 'O pagamento deve ser realizado antes do início da produção. Após aprovação do orçamento, você receberá os dados para pagamento. A produção inicia após confirmação do pagamento.',
        },
        {
          question: 'Posso parcelar no cartão de crédito?',
          answer: 'Sim! Aceitamos parcelamento em até 12x sem juros para compras acima de R$ 500. Para valores menores, consulte as opções disponíveis.',
        },
        {
          question: 'Vocês emitem nota fiscal?',
          answer: 'Sim, emitimos nota fiscal para todos os pedidos. A NF-e é enviada por email após o faturamento.',
        },
        {
          question: 'Como funciona o pagamento para empresas?',
          answer: 'Para empresas, oferecemos faturamento com prazo de 15 ou 30 dias mediante análise de crédito. Entre em contato para mais informações.',
        },
      ],
    },
    {
      category: 'Entregas',
      id: 'entregas',
      questions: [
        {
          question: 'Como funciona o frete?',
          answer: 'Calculamos o frete de acordo com o CEP de destino, peso e dimensões. Trabalhamos com Correios (PAC e SEDEX) e transportadoras. O valor do frete é informado no orçamento.',
        },
        {
          question: 'Qual o prazo de entrega?',
          answer: 'O prazo total = prazo de produção + prazo de transporte. O prazo de produção varia conforme o serviço. O prazo de transporte depende da modalidade escolhida e localidade.',
        },
        {
          question: 'Vocês entregam em todo o Brasil?',
          answer: 'Sim! Atendemos todo o território nacional. Para algumas regiões remotas, o prazo pode ser maior.',
        },
        {
          question: 'Como rastrear minha encomenda?',
          answer: 'Após o envio, você receberá o código de rastreamento por email e WhatsApp. Você pode acompanhar pelo site dos Correios ou da transportadora.',
        },
        {
          question: 'Posso retirar pessoalmente?',
          answer: 'Sim! Se você estiver em Ourinhos/SP ou região, pode retirar pessoalmente sem custo de frete. Agende a retirada conosco.',
        },
        {
          question: 'O que fazer se o produto chegar danificado?',
          answer: 'Entre em contato imediatamente! Envie fotos do produto e da embalagem. Faremos a substituição sem custos adicionais.',
        },
      ],
    },
    {
      category: 'Produtos',
      id: 'produtos',
      questions: [
        {
          question: 'Quais marcas de produtos vocês trabalham?',
          answer: 'Trabalhamos com as principais marcas do mercado: Creality, Bambu Lab, Prusa, Anycubic, Voron, Elegoo, Sovol, Flashforge. Oferecemos peças originais e compatíveis.',
        },
        {
          question: 'Os produtos têm garantia?',
          answer: 'Sim! Produtos novos têm garantia de 90 dias contra defeitos de fabricação. Peças impressas têm garantia de 30 dias. Consulte nossa Política de Devolução para mais detalhes.',
        },
        {
          question: 'Vocês vendem impressoras 3D?',
          answer: 'Sim! Trabalhamos com diversas marcas e modelos. Entre em contato para consultar disponibilidade e valores.',
        },
        {
          question: 'Como escolher o material certo para meu projeto?',
          answer: 'Depende da aplicação: PLA para protótipos e decoração, PETG para peças funcionais externas, ABS para alta resistência térmica, Nylon para peças mecânicas, TPU para peças flexíveis, Resina para alta precisão. Podemos ajudar na escolha!',
        },
        {
          question: 'Vocês fazem peças de reposição para impressoras?',
          answer: 'Sim! Temos um amplo catálogo de peças de reposição: hotends, bicos, correias, motores, PEI, extrusoras e muito mais. Consulte nosso catálogo online.',
        },
      ],
    },
    {
      category: 'Conta',
      id: 'conta',
      questions: [
        {
          question: 'Como criar uma conta?',
          answer: 'Clique em "Cadastro" no menu superior, preencha seus dados (nome, email, telefone, senha) e confirme o cadastro. Você receberá um email de confirmação.',
        },
        {
          question: 'Esqueci minha senha, o que fazer?',
          answer: 'Na página de login, clique em "Esqueci minha senha", informe seu email cadastrado e siga as instruções para redefinir.',
        },
        {
          question: 'Como atualizar meus dados cadastrais?',
          answer: 'Acesse "Minha Conta" no menu, vá em "Dados Pessoais" e atualize as informações desejadas. Não esqueça de salvar as alterações.',
        },
        {
          question: 'Posso ter mais de uma conta?',
          answer: 'Não é necessário. Você pode gerenciar múltiplos endereços e projetos em uma única conta.',
        },
        {
          question: 'Como excluir minha conta?',
          answer: 'Entre em contato conosco por email ou WhatsApp solicitando a exclusão. Seus dados serão removidos conforme a LGPD.',
        },
        {
          question: 'Meus dados estão seguros?',
          answer: 'Sim! Seguimos a LGPD e utilizamos criptografia para proteger seus dados. Consulte nossa Política de Privacidade para mais detalhes.',
        },
      ],
    },
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background via-secondary/20 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Central de <span className="text-accent">Ajuda</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Encontre respostas para suas dúvidas
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por palavras-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categorias */}
      {!searchTerm && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Categorias de Ajuda
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <motion.a
                    key={index}
                    href={category.link}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="card-elevated p-6 hover:shadow-xl transition-all group"
                  >
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <category.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-muted-foreground">
                Respostas para as dúvidas mais comuns
              </p>
            </motion.div>

            <div className="space-y-8">
              {filteredFaqs.map((category, categoryIndex) => (
                <motion.div
                  key={categoryIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  id={category.id}
                  className="scroll-mt-20"
                >
                  <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-accent" />
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 100 + faqIndex;
                      const isOpen = openFaq === globalIndex;

                      return (
                        <div
                          key={faqIndex}
                          className="card-elevated overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : globalIndex)}
                            className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-secondary/30 transition-colors"
                          >
                            <span className="font-semibold text-foreground pr-4">
                              {faq.question}
                            </span>
                            <ChevronDown
                              className={`w-5 h-5 text-accent flex-shrink-0 transition-transform ${
                                isOpen ? 'transform rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="px-6 pb-6"
                            >
                              <p className="text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {searchTerm && filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-muted-foreground mb-6">
                  Tente buscar com outras palavras-chave
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-accent hover:underline"
                >
                  Limpar busca
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <MessageCircle className="w-16 h-16 text-accent mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Não encontrou o que procurava?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nossa equipe está pronta para ajudar você
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5543991741518"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                WhatsApp
              </a>
              <a
                href="mailto:3dk.print.br@gmail.com"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
              >
                Enviar Email
              </a>
              <a
                href="/contato"
                className="inline-flex items-center justify-center px-8 py-4 bg-background text-foreground font-semibold rounded-lg border-2 border-accent hover:bg-accent/10 transition-colors"
              >
                Formulário de Contato
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
