import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, ChevronRight, Home, Clock } from 'lucide-react';
import type { SEOPage } from '@/lib/seoContent';
import {
  generateSEOMetaTags,
  generateProductSchema,
  generateArticleSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  injectMetaTags,
  injectSchemaMarkup,
  removeSchemaMarkup,
  calculateReadingTime
} from '@/lib/seoHelpers';

interface SEOPageRendererProps {
  page: SEOPage;
}

export function SEOPageRenderer({ page }: SEOPageRendererProps) {
  // Atualizar meta tags, schemas e scroll para o topo
  useEffect(() => {
    window.scrollTo(0, 0);

    // Gerar e injetar meta tags
    const metaTags = generateSEOMetaTags(page);
    injectMetaTags(metaTags);

    // Remover schemas antigos
    removeSchemaMarkup();

    // Gerar e injetar schemas apropriados
    const schemas = [
      generateBreadcrumbSchema(page),
      page.schemaType === 'Product' ? generateProductSchema(page) : generateArticleSchema(page)
    ];

    if (page.content.faq.length > 0) {
      schemas.push(generateFAQSchema(page));
    }

    if (page.cluster === 'local') {
      schemas.push(generateLocalBusinessSchema());
    }

    injectSchemaMarkup(schemas);

    return () => {
      removeSchemaMarkup();
    };
  }, [page]);

  // Calcular tempo de leitura
  const readingTime = calculateReadingTime(
    page.content.sections.map(s => s.content).join(' ')
  );

  const generateSchema = (page: SEOPage) => {
    const baseSchema: any = {
      '@context': 'https://schema.org',
      '@type': page.schemaType,
      headline: page.h1,
      description: page.metaDescription,
      image: page.ogImage || 'https://www.3dkprint.com.br/logo-3dkprint.png',
      author: {
        '@type': 'Organization',
        name: '3DKPRINT',
        url: 'https://www.3dkprint.com.br'
      },
      publisher: {
        '@type': 'Organization',
        name: '3DKPRINT',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.3dkprint.com.br/logo-3dkprint.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.3dkprint.com.br/seo/${page.slug}`
      }
    };

    if (page.content.faq.length > 0) {
      baseSchema.mainEntity = page.content.faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }));
    }

    if (page.schemaType === 'LocalBusiness') {
      baseSchema.address = {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Exemplo, 123',
        addressLocality: 'Ourinhos',
        addressRegion: 'SP',
        postalCode: '19900-000',
        addressCountry: 'BR'
      };
      baseSchema.telephone = '+55-43-99174-1518';
      baseSchema.priceRange = '$$';
    }

    // BreadcrumbList Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: 'https://www.3dkprint.com.br/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.cluster.charAt(0).toUpperCase() + page.cluster.slice(1).replace('-', ' '),
          item: `https://www.3dkprint.com.br/seo/${page.slug}` // Simplificado para fins de SEO
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: page.h1,
          item: `https://www.3dkprint.com.br/seo/${page.slug}`
        }
      ]
    };

    return [baseSchema, breadcrumbSchema];
  };

  const clusterLabels: Record<string, string> = {
    'placas': 'Placas e Acessórios',
    'pecas-acessorios': 'Peças de Reposição',
    'problemas': 'Soluções de Problemas',
    'guias': 'Guias e Tutoriais',
    'local': 'Serviços em Ourinhos'
  };

  // Links internos de backup se o array estiver vazio (para garantir interlinking em todas as páginas)
  const defaultInternalLinks = [
    { title: 'Guia Completo de Placas PEI', slug: 'guia-completo-placas-pei' },
    { title: 'Como Melhorar Adesão na Mesa 3D', slug: 'como-melhorar-adesao-na-mesa-3d' },
    { title: 'Manutenção de Impressora 3D em Ourinhos', slug: 'manutencao-impressora-3d-ourinhos' }
  ].filter(link => link.slug !== page.slug);

  const displayLinks = page.internalLinks.length > 0 ? page.internalLinks : defaultInternalLinks;

  return (
    <Layout>
      {/* Breadcrumbs */}
      <nav className="bg-muted/30 border-b border-border py-3">
        <div className="container-custom">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
            <li className="flex items-center gap-2">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <li className="flex items-center gap-2">
              <span className="capitalize">{clusterLabels[page.cluster] || page.cluster.replace('-', ' ')}</span>
            </li>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <li className="text-foreground font-medium truncate">
              {page.h1}
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-background py-12 md:py-20 border-b border-border">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6 dark:bg-blue-900/20 dark:border-blue-800">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 text-sm font-semibold dark:text-blue-400">
                {clusterLabels[page.cluster] || page.cluster.replace('-', ' ')}
              </span>
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              {page.h1}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              {page.content.introduction}
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min de leitura</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{page.keywords.length}</span>
                <span>palavras-chave</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{page.content.sections.length}</span>
                <span>seções</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Article Content */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="prose prose-lg dark:prose-invert max-w-none"
              >
                {/* Content Sections */}
                {page.content.sections.map((section, idx) => (
                  <div key={idx} className="mb-12 last:mb-0">
                    {section.level === 'h2' ? (
                      <h2 className="text-3xl font-bold text-foreground mb-6 mt-0 flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-accent rounded-full hidden md:block" />
                        {section.heading}
                      </h2>
                    ) : (
                      <h3 className="text-2xl font-bold text-foreground mb-4 mt-8">{section.heading}</h3>
                    )}
                    <div className="text-muted-foreground leading-relaxed space-y-4">
                      {section.content.split('\n').map((para, pIdx) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                    </div>
                  </div>
                ))}

                {/* FAQ Section */}
                {page.content.faq.length > 0 && (
                  <div className="mt-16 pt-12 border-t border-border">
                    <h2 className="text-3xl font-bold text-foreground mb-8">Dúvidas Frequentes</h2>
                    <div className="space-y-4">
                      {page.content.faq.map((faq, idx) => (
                        <details 
                          key={idx} 
                          className="group border border-border rounded-xl p-5 cursor-pointer hover:border-accent/50 hover:bg-muted/30 transition-all"
                        >
                          <summary className="font-bold text-lg text-foreground flex items-center justify-between list-none">
                            {faq.question}
                            <span className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-muted group-open:rotate-180 transition-transform text-xs">
                              ▼
                            </span>
                          </summary>
                          <div className="text-muted-foreground mt-4 leading-relaxed border-t border-border/50 pt-4">
                            {faq.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internal Links (Bottom of Content) */}
                {displayLinks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 pt-12 border-t border-border"
                  >
                    <h3 className="text-2xl font-bold text-foreground mb-8">Artigos Relacionados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayLinks.map((link, idx) => (
                        <Link
                          key={idx}
                          to={`/seo/${link.slug}`}
                          className="group p-6 bg-muted/20 border border-border rounded-2xl hover:bg-muted/40 hover:border-accent/50 transition-all"
                        >
                          <h4 className="font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                            {link.title}
                          </h4>
                          <div className="flex items-center text-sm text-accent font-semibold">
                            Ler artigo completo
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Sidebar / Conversion */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Trust Block */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl dark:from-blue-900/10 dark:to-cyan-900/10 dark:border-blue-900/30"
              >
                <h3 className="text-xl font-bold text-foreground mb-6">{page.trustBlock.title}</h3>
                <ul className="space-y-4">
                  {page.trustBlock.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-500 rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm md:text-base text-muted-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Sticky CTA */}
              <div className="sticky top-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 bg-background border border-border rounded-2xl shadow-xl shadow-primary/5"
                >
                  <h3 className="text-xl font-bold text-foreground mb-4">Precisa de Ajuda?</h3>
                  <p className="text-muted-foreground mb-8">
                    Nossos especialistas estão prontos para ajudar você com o melhor orçamento e suporte técnico.
                  </p>
                  
                  <div className="space-y-4">
                    <a href={page.cta.primaryLink} className="block w-full">
                      <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold h-14 shadow-lg shadow-blue-500/20">
                        {page.cta.primary}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </a>
                    
                    {page.cta.secondary && (
                      <a href={page.cta.secondaryLink} className="block w-full">
                        <Button size="lg" variant="outline" className="w-full h-14 font-semibold border-2">
                          {page.cta.secondary}
                        </Button>
                      </a>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-4 grayscale opacity-70">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WhatsApp" className="w-6 h-6" />
                    <span className="text-sm font-medium">Atendimento via WhatsApp</span>
                  </div>
                </motion.div>

                {/* Internal Links (Sidebar Version) */}
                {displayLinks.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-foreground mb-4">Veja Também</h3>
                    <div className="space-y-3">
                      {displayLinks.map((link, idx) => (
                        <Link
                          key={idx}
                          to={`/seo/${link.slug}`}
                          className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 hover:border-accent/50 transition-all group"
                        >
                          <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                            {link.title}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
}
