import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ReturnPolicy() {
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
              Política de <span className="text-accent">Devolução</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Transparência e segurança nas suas compras
            </p>
          </motion.div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introdução */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Direito de Arrependimento</h2>
                  <p className="text-muted-foreground mb-4">
                    Conforme o <strong className="text-foreground">Código de Defesa do Consumidor (CDC)</strong>, você tem o direito de desistir da compra em até <strong className="text-foreground">7 (sete) dias corridos</strong> a partir do recebimento do produto, sem necessidade de justificativa.
                  </p>
                  <p className="text-muted-foreground">
                    A 3DKPRINT está comprometida em garantir a satisfação dos nossos clientes e facilitar o processo de devolução quando necessário.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Condições para Devolução */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-accent" />
                Condições para Devolução
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Produto sem uso, em perfeito estado',
                  'Embalagem original intacta',
                  'Todos os acessórios e manuais incluídos',
                  'Nota fiscal ou comprovante de compra',
                  'Solicitação dentro do prazo de 7 dias',
                  'Produto sem sinais de montagem ou instalação',
                ].map((condition, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{condition}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Produtos Não Aceitos para Devolução */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8 bg-red-50 dark:bg-red-950/20"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                Produtos Não Aceitos para Devolução
              </h2>
              <ul className="space-y-3">
                {[
                  {
                    title: 'Produtos Personalizados',
                    description: 'Peças impressas sob medida, modelagens customizadas ou itens com especificações únicas do cliente',
                  },
                  {
                    title: 'Produtos com Defeito de Fabricação Causado pelo Cliente',
                    description: 'Danos causados por mau uso, instalação incorreta ou modificações não autorizadas',
                  },
                  {
                    title: 'Produtos Fora do Prazo',
                    description: 'Solicitações de devolução após 7 dias do recebimento',
                  },
                  {
                    title: 'Produtos Sem Embalagem Original',
                    description: 'Itens que não estejam na embalagem original ou com embalagem danificada',
                  },
                  {
                    title: 'Consumíveis Utilizados',
                    description: 'Filamentos, resinas ou materiais consumíveis já abertos ou parcialmente utilizados',
                  },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">{item.title}:</strong>
                      <span className="text-muted-foreground ml-1">{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Como Solicitar Devolução */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-accent" />
                Como Solicitar a Devolução
              </h2>
              <div className="space-y-4">
                {[
                  {
                    step: '1',
                    title: 'Entre em Contato',
                    description: 'Envie um email para 3dk.print.br@gmail.com ou WhatsApp (43) 9-9174-1518 informando o número do pedido e motivo da devolução',
                  },
                  {
                    step: '2',
                    title: 'Aguarde Autorização',
                    description: 'Nossa equipe analisará sua solicitação em até 24 horas úteis e enviará as instruções de devolução',
                  },
                  {
                    step: '3',
                    title: 'Embale o Produto',
                    description: 'Embale o produto na embalagem original com todos os acessórios, manuais e nota fiscal',
                  },
                  {
                    step: '4',
                    title: 'Envie o Produto',
                    description: 'Envie o produto para o endereço fornecido. O frete de devolução é por conta do cliente, exceto em casos de defeito',
                  },
                  {
                    step: '5',
                    title: 'Receba o Reembolso',
                    description: 'Após recebermos e inspecionarmos o produto, o reembolso será processado em até 7 dias úteis',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 p-6 bg-secondary/30 rounded-lg">
                    <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reembolso */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-accent" />
                Prazo de Reembolso
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  O reembolso será processado em até <strong className="text-foreground">7 (sete) dias úteis</strong> após a aprovação da devolução, utilizando a mesma forma de pagamento original:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Cartão de Crédito:</strong> O estorno aparecerá na fatura seguinte ou em até 2 faturas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">PIX/Transferência:</strong> O valor será devolvido na mesma conta em até 5 dias úteis
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Boleto:</strong> Informe seus dados bancários para transferência
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Troca de Produtos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8 bg-accent/5"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-accent" />
                Troca de Produtos
              </h2>
              <p className="text-muted-foreground mb-4">
                A 3DKPRINT <strong className="text-foreground">não realiza trocas diretas</strong>. Para adquirir um produto diferente, é necessário:
              </p>
              <ol className="space-y-2 ml-6 list-decimal text-muted-foreground">
                <li>Solicitar a devolução do produto original</li>
                <li>Aguardar o reembolso</li>
                <li>Realizar uma nova compra do produto desejado</li>
              </ol>
            </motion.div>

            {/* Defeitos e Garantia */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-accent" />
                Produtos com Defeito
              </h2>
              <p className="text-muted-foreground mb-4">
                Se você recebeu um produto com <strong className="text-foreground">defeito de fabricação</strong>, entre em contato imediatamente:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    O <strong className="text-foreground">frete de devolução será por nossa conta</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Você poderá escolher entre <strong className="text-foreground">reembolso total ou substituição do produto</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    A substituição será <strong className="text-foreground">prioritária e sem custos adicionais</strong>
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Contato */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center p-8 bg-secondary/30 rounded-lg"
            >
              <h3 className="text-xl font-bold text-foreground mb-4">Dúvidas sobre Devolução?</h3>
              <p className="text-muted-foreground mb-6">
                Nossa equipe está pronta para ajudar você
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:3dk.print.br@gmail.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Enviar Email
                </a>
                <a
                  href="https://wa.me/5543991741518"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </motion.div>

            {/* Última Atualização */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Última atualização: Fevereiro de 2026</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
