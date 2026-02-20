import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const projects = [
  {
    id: 1,
    title: 'Protótipo de Drone',
    category: 'Protótipos',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=400&fit=crop',
    description: 'Estrutura completa impressa em Nylon com alta resistência mecânica.',
  },
  {
    id: 2,
    title: 'Coleção de Miniaturas',
    category: 'Colecionáveis',
    image: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=600&h=400&fit=crop',
    description: 'Miniaturas em resina com pintura premium e detalhes impressionantes.',
  },
  {
    id: 3,
    title: 'Setup Gamer Completo',
    category: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop',
    description: 'Suportes, organizadores e acessórios personalizados para gaming.',
  },
  {
    id: 4,
    title: 'Luminária Arquitetônica',
    category: 'Decoração',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop',
    description: 'Design exclusivo com acabamento translúcido e LED integrado.',
  },
  {
    id: 5,
    title: 'Peças Industriais',
    category: 'Industrial',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop',
    description: 'Componentes funcionais em ABS para linha de produção.',
  },
  {
    id: 6,
    title: 'Cosplay Premium',
    category: 'Cosplay',
    image: 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&h=400&fit=crop',
    description: 'Armadura completa com pintura metalizada e acabamento profissional.',
  },
];

export default function Portfolio() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Portfólio
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Nossos projetos
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl">
              Conheça alguns dos projetos que já realizamos. 
              De protótipos industriais a peças artísticas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group card-elevated overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform">
                    <Link to="/orcamento">
                      <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Quero algo parecido
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs text-accent uppercase tracking-wider">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-semibold text-foreground mt-2 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Tem um projeto em mente?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Transformamos sua ideia em realidade com a mesma qualidade 
              que você viu aqui.
            </p>
            <Link to="/orcamento">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Solicitar Orçamento
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
