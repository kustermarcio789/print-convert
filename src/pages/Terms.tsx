import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Terms() {
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
              Termos de <span className="text-accent">Uso</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Condições gerais de uso do site 3DKPRINT
            </p>
          </motion.div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
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
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
                  <p className="text-muted-foreground mb-4">
                    Ao acessar e utilizar o site <strong className="text-foreground">3dkprint.com.br</strong>, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso site ou serviços.
                  </p>
                  <p className="text-muted-foreground">
                    Estes termos aplicam-se a todos os visitantes, usuários e outras pessoas que acessam ou utilizam o serviço.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Definições */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Definições</h2>
              <div className="space-y-3">
                {[
                  { term: '"Serviço"', definition: 'Refere-se aos serviços de impressão 3D, modelagem 3D, pintura, manutenção e venda de produtos oferecidos pela 3DKPRINT' },
                  { term: '"Usuário"', definition: 'Qualquer pessoa que acessa e utiliza o site 3dkprint.com.br' },
                  { term: '"Cliente"', definition: 'Usuário que realiza compras ou contrata serviços através do site' },
                  { term: '"Prestador"', definition: 'Profissional cadastrado que oferece serviços através da plataforma' },
                  { term: '"Conteúdo"', definition: 'Textos, imagens, vídeos, gráficos e outros materiais disponibilizados no site' },
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                    <strong className="text-foreground">{item.term}:</strong>
                    <span className="text-muted-foreground ml-2">{item.definition}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Uso do Site */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">3. Uso do Site</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">3.1. Elegibilidade</h3>
                  <p className="text-muted-foreground">
                    Para utilizar nossos serviços, você deve ter pelo menos 18 anos de idade ou possuir consentimento dos pais ou responsáveis legais.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">3.2. Cadastro</h3>
                  <p className="text-muted-foreground mb-2">
                    Ao criar uma conta, você concorda em:
                  </p>
                  <ul className="space-y-2 ml-6">
                    {[
                      'Fornecer informações verdadeiras, precisas e atualizadas',
                      'Manter a segurança de sua senha',
                      'Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta',
                      'Ser responsável por todas as atividades realizadas em sua conta',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">3.3. Uso Permitido</h3>
                  <p className="text-muted-foreground">
                    Você concorda em usar o site apenas para fins legais e de acordo com estes Termos de Uso.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Proibições */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8 bg-red-50 dark:bg-red-950/20"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                4. Condutas Proibidas
              </h2>
              <p className="text-muted-foreground mb-4">Você concorda em NÃO:</p>
              <ul className="space-y-3">
                {[
                  'Violar qualquer lei local, estadual, nacional ou internacional',
                  'Transmitir material que seja abusivo, difamatório, obsceno ou ilegal',
                  'Fazer uso comercial não autorizado do site',
                  'Tentar obter acesso não autorizado a qualquer parte do site',
                  'Interferir ou interromper o funcionamento do site',
                  'Usar robôs, spiders ou outros dispositivos automatizados',
                  'Copiar, modificar ou distribuir conteúdo sem autorização',
                  'Fazer engenharia reversa de qualquer parte do site',
                  'Solicitar impressão de itens protegidos por direitos autorais sem autorização',
                  'Usar o site para atividades fraudulentas ou enganosas',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Serviços e Produtos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">5. Serviços e Produtos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">5.1. Orçamentos</h3>
                  <p className="text-muted-foreground">
                    Todos os orçamentos são válidos por <strong className="text-foreground">7 dias</strong> e estão sujeitos à disponibilidade de materiais e capacidade de produção.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">5.2. Prazos</h3>
                  <p className="text-muted-foreground">
                    Os prazos informados são estimativas e podem variar de acordo com a complexidade do projeto e disponibilidade de materiais.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">5.3. Propriedade Intelectual</h3>
                  <p className="text-muted-foreground">
                    O cliente é responsável por garantir que possui os direitos necessários sobre os arquivos enviados para impressão. A 3DKPRINT não se responsabiliza por violações de propriedade intelectual.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">5.4. Produtos Personalizados</h3>
                  <p className="text-muted-foreground">
                    Produtos personalizados não podem ser devolvidos, exceto em casos de defeito de fabricação.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Pagamento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">6. Pagamento e Preços</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">6.1. Preços</h3>
                  <p className="text-muted-foreground">
                    Todos os preços estão em Reais (R$) e podem ser alterados sem aviso prévio. O preço aplicado será o vigente no momento da confirmação do pedido.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">6.2. Formas de Pagamento</h3>
                  <p className="text-muted-foreground">
                    Aceitamos PIX, cartão de crédito, boleto bancário e transferência bancária. O pagamento deve ser realizado antes do início da produção.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">6.3. Cancelamento</h3>
                  <p className="text-muted-foreground">
                    Pedidos podem ser cancelados sem custo antes do início da produção. Após o início, será cobrada uma taxa de acordo com o estágio de produção.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Propriedade Intelectual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">7. Propriedade Intelectual</h2>
              <p className="text-muted-foreground mb-4">
                Todo o conteúdo do site, incluindo textos, gráficos, logos, ícones, imagens, clipes de áudio e software, é propriedade da 3DKPRINT ou de seus fornecedores de conteúdo e está protegido por leis de direitos autorais.
              </p>
              <p className="text-muted-foreground">
                Você não pode reproduzir, distribuir, modificar ou criar trabalhos derivados sem autorização expressa por escrito.
              </p>
            </motion.div>

            {/* Limitação de Responsabilidade */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8 bg-yellow-50 dark:bg-yellow-950/20"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">8. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground mb-4">
                A 3DKPRINT não será responsável por:
              </p>
              <ul className="space-y-2 ml-6">
                {[
                  'Danos indiretos, incidentais ou consequenciais',
                  'Perda de lucros, dados ou uso',
                  'Interrupção de negócios',
                  'Uso inadequado dos produtos',
                  'Problemas causados por arquivos fornecidos pelo cliente',
                  'Atrasos causados por terceiros (correios, fornecedores)',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Garantias */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">9. Garantias</h2>
              <p className="text-muted-foreground mb-4">
                Nossos produtos e serviços são fornecidos "como estão". Garantimos que:
              </p>
              <ul className="space-y-2 ml-6">
                {[
                  'Os produtos serão fabricados conforme especificações acordadas',
                  'Utilizaremos materiais de qualidade',
                  'Seguiremos boas práticas de fabricação',
                  'Produtos com defeito de fabricação serão substituídos',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Modificações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Modificações dos Termos</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site. O uso continuado do site após as alterações constitui aceitação dos novos termos.
              </p>
            </motion.div>

            {/* Lei Aplicável */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">11. Lei Aplicável</h2>
              <p className="text-muted-foreground">
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida nos tribunais da comarca de Ourinhos, São Paulo.
              </p>
            </motion.div>

            {/* Contato */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center p-8 bg-secondary/30 rounded-lg"
            >
              <h3 className="text-xl font-bold text-foreground mb-4">Dúvidas sobre os Termos de Uso?</h3>
              <p className="text-muted-foreground mb-6">
                Entre em contato conosco
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:3dk.print.br@gmail.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Enviar Email
                </a>
                <a
                  href="/contato"
                  className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground font-semibold rounded-lg border-2 border-accent hover:bg-accent/10 transition-colors"
                >
                  Página de Contato
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
