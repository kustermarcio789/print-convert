import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Target, Eye, Award, Zap, Users, Shield, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function About() {
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
              Sobre a <span className="text-accent">3DKPRINT</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Tecnologia 3D aplicada à solução de problemas reais
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quem Somos */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">Quem Somos</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                A <strong className="text-foreground">3DKPRINT</strong> é uma empresa brasileira especializada em{' '}
                <strong className="text-foreground">impressão 3D, fabricação digital e soluções industriais</strong>, atuando em todo o território nacional com foco em qualidade técnica, confiabilidade e eficiência operacional.
              </p>
              <p>
                Operamos como um <strong className="text-foreground">hub de soluções em tecnologia 3D</strong>, atendendo desde demandas pontuais até projetos complexos, sempre com abordagem técnica, visão estratégica e orientação total a resultados. Nossa atuação vai além da simples produção de peças: entregamos{' '}
                <strong className="text-foreground">soluções sob medida</strong>, alinhadas às necessidades reais de cada cliente.
              </p>
              <p>
                Trabalhamos com tecnologias <strong className="text-foreground">FDM e resina UV</strong>, garantindo peças de alta precisão dimensional, resistência mecânica adequada à aplicação e excelente acabamento visual, seja para protótipos, peças funcionais, reposições técnicas ou aplicações industriais.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Missão */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card-elevated p-8 text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Missão</h3>
              <p className="text-muted-foreground">
                Democratizar o acesso à fabricação digital, transformando ideias, projetos e necessidades técnicas em{' '}
                <strong className="text-foreground">produtos reais</strong>, com qualidade, agilidade, precisão e confiabilidade.
              </p>
            </motion.div>

            {/* Visão */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card-elevated p-8 text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Visão</h3>
              <p className="text-muted-foreground">
                Ser referência nacional em <strong className="text-foreground">soluções baseadas em impressão 3D</strong>, reconhecida como parceira estratégica de empresas, indústrias e profissionais que buscam inovação, redução de custos, ganho de eficiência e agilidade no desenvolvimento de produtos.
              </p>
            </motion.div>

            {/* Valores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card-elevated p-8 text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Valores</h3>
              <ul className="text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Compromisso com qualidade técnica</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Foco em solução, não apenas em execução</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Ética, transparência e responsabilidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Inovação aplicada à prática</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Relacionamento de longo prazo com clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Evolução contínua em tecnologia e processos</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Diferenciais Competitivos */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Diferenciais Competitivos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: 'Atuação Estratégica',
                  description: 'Atuação técnica e estratégica, não apenas operacional',
                },
                {
                  icon: TrendingUp,
                  title: 'Versatilidade',
                  description: 'Capacidade de atender projetos simples e demandas industriais complexas',
                },
                {
                  icon: Award,
                  title: 'Múltiplas Tecnologias',
                  description: 'Domínio de múltiplas tecnologias de impressão 3D',
                },
                {
                  icon: Target,
                  title: 'Soluções Personalizadas',
                  description: 'Soluções personalizadas conforme a aplicação real do cliente',
                },
                {
                  icon: Users,
                  title: 'Serviço Completo',
                  description: 'Integração entre modelagem, fabricação, acabamento e suporte técnico',
                },
                {
                  icon: Shield,
                  title: 'Atendimento Consultivo',
                  description: 'Atendimento consultivo, com foco em viabilidade, custo e desempenho',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-elevated p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Serviços Oferecidos */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Serviços Oferecidos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Impressão 3D em tecnologia FDM',
                'Impressão 3D em resina UV',
                'Modelagem 3D sob medida',
                'Engenharia reversa e ajustes técnicos',
                'Escaneamento 3D',
                'Prototipagem rápida',
                'Fabricação de peças técnicas e funcionais',
                'Pintura técnica e acabamento profissional',
                'Manutenção, montagem e calibração de impressoras 3D',
                'Consultoria e implementação de tecnologias 3D em empresas',
                'Fabricação de placas PEI personalizadas',
                'Soluções customizadas para impressão 3D',
              ].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-background rounded-lg hover:shadow-md transition-shadow"
                >
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">{service}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compromisso com Qualidade */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">Compromisso com Qualidade e Tecnologia</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Na 3DKPRINT, cada projeto é tratado com <strong className="text-foreground">análise técnica, planejamento e controle de qualidade</strong>. Utilizamos materiais adequados à aplicação, processos validados e equipamentos calibrados para garantir desempenho, durabilidade e confiabilidade.
            </p>
            <p className="text-lg text-muted-foreground">
              Investimos continuamente em tecnologia, capacitação e melhoria de processos para assegurar que nossos clientes recebam soluções alinhadas às exigências do mercado atual.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-accent/10 via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Vamos Desenvolver Sua Solução
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Se você busca um parceiro técnico confiável para transformar ideias em soluções reais por meio da tecnologia 3D, a <strong className="text-foreground">3DKPRINT</strong> está preparada para atender sua demanda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/orcamento"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
              >
                Solicitar Orçamento
              </a>
              <a
                href="/contato"
                className="inline-flex items-center justify-center px-8 py-4 bg-background text-foreground font-semibold rounded-lg border-2 border-accent hover:bg-accent/10 transition-colors"
              >
                Entrar em Contato
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
