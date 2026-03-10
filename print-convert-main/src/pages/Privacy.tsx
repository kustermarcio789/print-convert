import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from 'lucide-react';

export default function Privacy() {
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
              Política de <span className="text-accent">Privacidade</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Seu dados estão seguros conosco
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
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Compromisso com sua Privacidade</h2>
                  <p className="text-muted-foreground mb-4">
                    A <strong className="text-foreground">3DKPRINT</strong> está comprometida em proteger a privacidade e segurança dos dados pessoais de nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações.
                  </p>
                  <p className="text-muted-foreground">
                    Esta política está em conformidade com a <strong className="text-foreground">Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e demais legislações aplicáveis.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Dados Coletados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Database className="w-6 h-6 text-accent" />
                1. Dados que Coletamos
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">1.1. Dados Fornecidos por Você</h3>
                  <ul className="space-y-2 ml-6 list-disc text-muted-foreground">
                    <li><strong className="text-foreground">Dados de Cadastro:</strong> Nome, email, telefone, CPF/CNPJ, endereço</li>
                    <li><strong className="text-foreground">Dados de Pagamento:</strong> Informações de cartão de crédito, dados bancários (processados por gateways seguros)</li>
                    <li><strong className="text-foreground">Dados de Orçamento:</strong> Especificações técnicas, arquivos 3D, preferências de materiais</li>
                    <li><strong className="text-foreground">Comunicações:</strong> Mensagens enviadas através de formulários de contato</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">1.2. Dados Coletados Automaticamente</h3>
                  <ul className="space-y-2 ml-6 list-disc text-muted-foreground">
                    <li><strong className="text-foreground">Dados de Navegação:</strong> Endereço IP, tipo de navegador, páginas visitadas, tempo de permanência</li>
                    <li><strong className="text-foreground">Cookies:</strong> Pequenos arquivos armazenados no seu dispositivo para melhorar a experiência</li>
                    <li><strong className="text-foreground">Dados de Dispositivo:</strong> Sistema operacional, resolução de tela, idioma</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Como Usamos os Dados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Eye className="w-6 h-6 text-accent" />
                2. Como Usamos seus Dados
              </h2>
              <div className="space-y-3">
                {[
                  { title: 'Processar Pedidos', description: 'Para processar e entregar seus pedidos de produtos e serviços' },
                  { title: 'Comunicação', description: 'Para enviar confirmações, atualizações de pedidos e responder suas dúvidas' },
                  { title: 'Melhorias', description: 'Para melhorar nossos produtos, serviços e experiência do usuário' },
                  { title: 'Marketing', description: 'Para enviar ofertas e novidades (apenas com seu consentimento)' },
                  { title: 'Segurança', description: 'Para detectar e prevenir fraudes e atividades suspeitas' },
                  { title: 'Obrigações Legais', description: 'Para cumprir com requisitos legais e regulatórios' },
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                    <strong className="text-foreground">{item.title}:</strong>
                    <span className="text-muted-foreground ml-2">{item.description}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Compartilhamento de Dados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8 bg-yellow-50 dark:bg-yellow-950/20"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                3. Compartilhamento de Dados
              </h2>
              <p className="text-muted-foreground mb-4">
                <strong className="text-foreground">Não vendemos seus dados pessoais.</strong> Podemos compartilhar suas informações apenas nas seguintes situações:
              </p>
              <ul className="space-y-3">
                {[
                  { title: 'Prestadores de Serviço', description: 'Empresas que nos ajudam a operar o site e processar pagamentos (ex: gateways de pagamento, serviços de hospedagem)' },
                  { title: 'Transportadoras', description: 'Para viabilizar a entrega dos produtos' },
                  { title: 'Obrigações Legais', description: 'Quando exigido por lei ou ordem judicial' },
                  { title: 'Proteção de Direitos', description: 'Para proteger nossos direitos, propriedade ou segurança' },
                  { title: 'Com seu Consentimento', description: 'Em outras situações, mediante sua autorização explícita' },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">{item.title}:</strong>
                      <span className="text-muted-foreground ml-1">{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Segurança */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6 text-accent" />
                4. Segurança dos Dados
              </h2>
              <p className="text-muted-foreground mb-4">
                Implementamos medidas técnicas e organizacionais para proteger seus dados:
              </p>
              <ul className="space-y-2 ml-6 list-disc text-muted-foreground">
                <li>Criptografia SSL/TLS para transmissão de dados</li>
                <li>Armazenamento seguro em servidores protegidos</li>
                <li>Acesso restrito aos dados apenas para funcionários autorizados</li>
                <li>Monitoramento contínuo de atividades suspeitas</li>
                <li>Backups regulares para prevenir perda de dados</li>
                <li>Políticas internas de segurança da informação</li>
              </ul>
            </motion.div>

            {/* Cookies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">5. Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos cookies para melhorar sua experiência. Você pode gerenciar cookies através das configurações do seu navegador.
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <strong className="text-foreground">Cookies Essenciais:</strong>
                  <span className="text-muted-foreground ml-2">Necessários para o funcionamento básico do site</span>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <strong className="text-foreground">Cookies de Desempenho:</strong>
                  <span className="text-muted-foreground ml-2">Coletam informações sobre como você usa o site</span>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <strong className="text-foreground">Cookies de Marketing:</strong>
                  <span className="text-muted-foreground ml-2">Usados para exibir anúncios relevantes</span>
                </div>
              </div>
            </motion.div>

            {/* Seus Direitos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8 bg-accent/5"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-accent" />
                6. Seus Direitos (LGPD)
              </h2>
              <p className="text-muted-foreground mb-4">
                De acordo com a LGPD, você tem os seguintes direitos:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Confirmação da existência de tratamento',
                  'Acesso aos seus dados',
                  'Correção de dados incompletos ou desatualizados',
                  'Anonimização, bloqueio ou eliminação',
                  'Portabilidade dos dados',
                  'Eliminação dos dados tratados com consentimento',
                  'Informação sobre compartilhamento',
                  'Revogação do consentimento',
                ].map((right, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-background rounded-lg">
                    <UserCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{right}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-4">
                Para exercer seus direitos, entre em contato através do email:{' '}
                <a href="mailto:3dk.print.br@gmail.com" className="text-accent hover:underline">
                  3dk.print.br@gmail.com
                </a>
              </p>
            </motion.div>

            {/* Retenção de Dados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Retenção de Dados</h2>
              <p className="text-muted-foreground mb-4">
                Mantemos seus dados pessoais apenas pelo tempo necessário para:
              </p>
              <ul className="space-y-2 ml-6 list-disc text-muted-foreground">
                <li>Cumprir as finalidades descritas nesta política</li>
                <li>Atender obrigações legais e regulatórias</li>
                <li>Resolver disputas e fazer cumprir acordos</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Após esse período, os dados serão excluídos ou anonimizados de forma segura.
              </p>
            </motion.div>

            {/* Menores de Idade */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Menores de Idade</h2>
              <p className="text-muted-foreground">
                Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente dados de menores sem o consentimento dos pais ou responsáveis legais.
              </p>
            </motion.div>

            {/* Alterações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Alterações na Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas através do email cadastrado ou aviso no site.
              </p>
            </motion.div>

            {/* Encarregado de Dados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8 bg-secondary/30"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Encarregado de Dados (DPO)</h2>
              <p className="text-muted-foreground mb-4">
                Para questões relacionadas à proteção de dados, entre em contato com nosso Encarregado de Dados:
              </p>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Email:</strong> 3dk.print.br@gmail.com
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Telefone:</strong> (43) 9-9174-1518
                </p>
              </div>
            </motion.div>

            {/* Contato */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center p-8 bg-accent/5 rounded-lg"
            >
              <h3 className="text-xl font-bold text-foreground mb-4">Dúvidas sobre Privacidade?</h3>
              <p className="text-muted-foreground mb-6">
                Estamos à disposição para esclarecer qualquer dúvida
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
