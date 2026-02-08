import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const posts = [
  {
    id: 1,
    slug: 'guia-materiais-impressao-3d',
    title: 'Guia Completo de Materiais para Impressão 3D',
    excerpt: 'Conheça as diferenças entre PLA, PETG, ABS, Nylon e Resina. Saiba qual material escolher para cada tipo de projeto.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop',
    category: 'Guias',
    author: 'Equipe 3DKPRINT',
    date: '15 Jan 2024',
    readTime: '8 min',
  },
  {
    id: 2,
    slug: 'impressao-3d-ourinhos',
    title: 'Impressão 3D em Ourinhos: Onde Encontrar os Melhores Serviços',
    excerpt: 'Descubra como a 3DKPRINT está revolucionando a impressão 3D na região de Ourinhos e arredores.',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop',
    category: 'Regional',
    author: 'Equipe 3DKPRINT',
    date: '10 Jan 2024',
    readTime: '5 min',
  },
  {
    id: 3,
    slug: 'como-preparar-arquivo-3d',
    title: 'Como Preparar seu Arquivo 3D para Impressão',
    excerpt: 'Dicas essenciais para garantir que seu modelo 3D seja impresso perfeitamente. Evite erros comuns.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    category: 'Tutoriais',
    author: 'Equipe 3DKPRINT',
    date: '05 Jan 2024',
    readTime: '6 min',
  },
  {
    id: 4,
    slug: 'prototipagem-rapida-industria',
    title: 'Prototipagem Rápida: Como a Impressão 3D Acelera a Indústria',
    excerpt: 'Entenda como empresas estão usando impressão 3D para reduzir custos e acelerar o desenvolvimento de produtos.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    category: 'Indústria',
    author: 'Equipe 3DKPRINT',
    date: '28 Dec 2023',
    readTime: '7 min',
  },
];

export default function Blog() {
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
              Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Conteúdo sobre Impressão 3D
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl">
              Dicas, tutoriais e novidades do mundo da impressão 3D. 
              Aprenda e inspire-se com nossos artigos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group card-elevated overflow-hidden"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </span>
                    <span>{post.readTime} de leitura</span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="ghost" className="p-0 h-auto text-accent hover:text-accent/80 group/btn">
                      Ler mais
                      <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
