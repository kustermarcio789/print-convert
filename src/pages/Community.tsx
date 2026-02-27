import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Zap, BookOpen, Download, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const whatsappGroups = [
  {
    id: 1,
    name: 'Grupo Geral 3DKPRINT',
    description: 'Comunidade principal para dúvidas, dicas e compartilhamento de projetos. Ideal para iniciantes e profissionais.',
    members: '500+',
    link: 'https://chat.whatsapp.com/IA6hGmUaRIwHqS4JXNp6xR',
    color: 'from-green-500/20 to-green-600/20',
    icon: '👥',
  },
  {
    id: 2,
    name: 'Impressoras FDM & Upgrades',
    description: 'Discussões técnicas sobre impressoras FDM, calibração, manutenção e modificações. Para entusiastas e makers.',
    members: '350+',
    link: 'https://chat.whatsapp.com/E6pvTgWBdYfBcFVQwbJ9LZ',
    color: 'from-blue-500/20 to-blue-600/20',
    icon: '🖨️',
  },
  {
    id: 3,
    name: 'Impressoras de Resina (SLA/DLP)',
    description: 'Especializado em impressoras de resina, técnicas de cura, acabamento e troubleshooting. Para profissionais de detalhes.',
    members: '280+',
    link: 'https://chat.whatsapp.com/Fn3dRV0VudAJqXL3LDRAbq',
    color: 'from-purple-500/20 to-purple-600/20',
    icon: '💎',
  },
  {
    id: 4,
    name: 'Modelagem 3D & Design',
    description: 'Comunidade de designers e modeladores 3D. Compartilhe projetos, peça feedback e aprenda técnicas avançadas.',
    members: '420+',
    link: 'https://chat.whatsapp.com/F2SvswavVTFFhJupz9pZri',
    color: 'from-orange-500/20 to-orange-600/20',
    icon: '🎨',
  },
];

const slicers = [
  {
    name: 'Ultimaker Cura',
    type: 'FDM',
    description: 'O fatiador mais popular e versátil. Suporta quase todas as impressoras FDM. Interface intuitiva e plugins avançados.',
    download: 'https://ultimaker.com/software/ultimaker-cura',
    logo: '🔵',
  },
  {
    name: 'PrusaSlicer',
    type: 'FDM',
    description: 'Desenvolvido pela Prusa Research. Excelente qualidade de impressão e suporte a múltiplas marcas de impressoras.',
    download: 'https://www.prusa3d.com/en/page/prusaslicer_3d_printing_software/',
    logo: '🟠',
  },
  {
    name: 'SuperSlicer',
    type: 'FDM',
    description: 'Fork avançado do PrusaSlicer com recursos extras. Ideal para usuários que buscam controle total.',
    download: 'https://github.com/supermerill/SuperSlicer',
    logo: '⚡',
  },
  {
    name: 'Bambu Studio',
    type: 'FDM',
    description: 'Fatiador oficial da Bambu Lab. Otimizado para impressoras de ultra-velocidade com suporte a multi-cores.',
    download: 'https://bambulab.com/en/download/studio',
    logo: '🟢',
  },
  {
    name: 'Lychee Slicer',
    type: 'Resina',
    description: 'O melhor fatiador para impressoras de resina. Interface 3D intuitiva e suporte a todos os modelos populares.',
    download: 'https://www.lychee3d.com/',
    logo: '💜',
  },
  {
    name: 'ChituBox',
    type: 'Resina',
    description: 'Fatiador gratuito para impressoras de resina. Compatível com Anycubic, Elegoo, Creality e outras marcas.',
    download: 'https://www.chitubox.com/',
    logo: '🟣',
  },
];

export default function Community() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              🌐 Comunidade 3DKPRINT
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Conecte-se com a comunidade de impressão 3D
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Junte-se a milhares de makers, profissionais e entusiastas. Compartilhe conhecimento, 
              tire dúvidas e acompanhe as últimas tendências em impressão 3D.
            </p>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Groups */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Grupos de WhatsApp
            </motion.h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o grupo que mais se alinha com seus interesses e comece a conversar agora mesmo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whatsappGroups.map((group, index) => (
              <motion.a
                key={group.id}
                href={group.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`card-elevated p-6 rounded-2xl bg-gradient-to-br ${group.color} border border-border hover:shadow-lg transition-all hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{group.icon}</div>
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                    {group.members} membros
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{group.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{group.description}</p>
                <div className="flex items-center gap-2 text-accent font-semibold">
                  <MessageCircle className="w-4 h-4" />
                  Entrar no grupo
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Slicers Download */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Fatiadores Gratuitos
            </motion.h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Baixe os melhores fatiadores (slicers) do mercado para FDM e Resina. Todos são gratuitos e open-source.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slicers.map((slicer, index) => (
              <motion.a
                key={slicer.name}
                href={slicer.download}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="card-elevated p-6 rounded-xl hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{slicer.logo}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    slicer.type === 'FDM' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {slicer.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                  {slicer.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{slicer.description}</p>
                <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                  <Download className="w-4 h-4" />
                  Baixar
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <BookOpen className="w-16 h-16 text-accent mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                Quer aprender mais sobre impressão 3D?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8">
                Explore nossa base de conhecimento completa com tutoriais, comparativos de firmware 
                e a história da impressão 3D desde o início.
              </p>
              <Link to="/conhecimento">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Acessar Base de Conhecimento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
