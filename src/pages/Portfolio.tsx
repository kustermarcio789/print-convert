import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

// Os projetos serão carregados dinamicamente via Admin futuramente
const projects: any[] = [];

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
              Confira os projetos realizados pela nossa equipe e parceiros. 
              Transformamos ideias em objetos reais com alta precisão.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding bg-background min-h-[400px]">
        <div className="container-custom">
          {projects.length > 0 ? (
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
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border">
              <Package className="w-16 h-16 text-muted mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-foreground mb-2">Novos projetos em breve</h3>
              <p className="text-muted-foreground mb-8">Estamos atualizando nossa galeria com os trabalhos mais recentes.</p>
              <Link to="/orcamento">
                <Button className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                  Iniciar meu projeto agora
                </Button>
              </Link>
            </div>
          )}
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
              que você busca para seus projetos.
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
