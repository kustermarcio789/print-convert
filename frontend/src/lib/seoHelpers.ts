/**
 * Helpers para SEO Avançado
 * Gerencia meta tags, Open Graph, Twitter Cards e Structured Data
 */

import type { SEOPage } from './seoContent';

export interface SEOMetaTags {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  keywords: string;
  robots: string;
  viewport: string;
  charset: string;
  language: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Gera meta tags completas para uma página SEO
 */
export function generateSEOMetaTags(page: SEOPage, baseUrl: string = 'https://www.3dkprint.com.br'): SEOMetaTags {
  const pageUrl = `${baseUrl}/seo/${page.slug}`;
  const ogImage = page.ogImage || `${baseUrl}/og-image-default.png`;

  return {
    title: page.title,
    description: page.metaDescription,
    canonical: pageUrl,
    ogTitle: page.title,
    ogDescription: page.metaDescription,
    ogImage: ogImage,
    ogUrl: pageUrl,
    ogType: page.schemaType === 'Product' ? 'product' : 'article',
    twitterCard: 'summary_large_image',
    twitterTitle: page.title,
    twitterDescription: page.metaDescription,
    twitterImage: ogImage,
    keywords: page.keywords.join(', '),
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    viewport: 'width=device-width, initial-scale=1.0',
    charset: 'utf-8',
    language: 'pt-BR'
  };
}

/**
 * Gera Product Schema para páginas de produtos
 */
export function generateProductSchema(page: SEOPage, baseUrl: string = 'https://www.3dkprint.com.br'): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: page.h1,
    description: page.metaDescription,
    image: page.ogImage || `${baseUrl}/og-image-default.png`,
    brand: {
      '@type': 'Brand',
      name: '3DKPRINT'
    },
    manufacturer: {
      '@type': 'Organization',
      name: '3DKPRINT'
    },
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'BRL',
      price: '0',
      url: `${baseUrl}/seo/${page.slug}`
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1'
    },
    url: `${baseUrl}/seo/${page.slug}`
  };
}

/**
 * Gera Article Schema com autor e data
 */
export function generateArticleSchema(page: SEOPage, baseUrl: string = 'https://www.3dkprint.com.br'): StructuredData {
  const now = new Date().toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.metaDescription,
    image: page.ogImage || `${baseUrl}/og-image-default.png`,
    author: {
      '@type': 'Organization',
      name: '3DKPRINT',
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: '3DKPRINT',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo-3dkprint.png`
      }
    },
    datePublished: now,
    dateModified: now,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/seo/${page.slug}`
    },
    articleBody: page.content.sections.map(s => s.content).join('\n'),
    wordCount: page.content.sections.reduce((acc, s) => acc + s.content.split(' ').length, 0),
    inLanguage: 'pt-BR'
  };
}

/**
 * Gera FAQPage Schema
 */
export function generateFAQSchema(page: SEOPage, baseUrl: string = 'https://www.3dkprint.com.br'): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.content.faq.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    })),
    url: `${baseUrl}/seo/${page.slug}`
  };
}

/**
 * Gera BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(page: SEOPage, baseUrl: string = 'https://www.3dkprint.com.br'): StructuredData {
  const clusterNames: Record<string, string> = {
    'placas': 'Placas e Acessórios',
    'pecas-acessorios': 'Peças de Reposição',
    'problemas': 'Soluções de Problemas',
    'guias': 'Guias e Tutoriais',
    'local': 'Serviços em Ourinhos'
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: clusterNames[page.cluster] || page.cluster,
        item: `${baseUrl}/seo?cluster=${page.cluster}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.h1,
        item: `${baseUrl}/seo/${page.slug}`
      }
    ]
  };
}

/**
 * Gera LocalBusiness Schema
 */
export function generateLocalBusinessSchema(baseUrl: string = 'https://www.3dkprint.com.br'): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '3DKPRINT',
    image: `${baseUrl}/logo-3dkprint.png`,
    description: 'Impressão 3D profissional, modelagem 3D, peças de reposição e serviços especializados em Ourinhos',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Exemplo, 123',
      addressLocality: 'Ourinhos',
      addressRegion: 'SP',
      postalCode: '19900-000',
      addressCountry: 'BR'
    },
    telephone: '+55-43-99174-1518',
    url: baseUrl,
    sameAs: [
      'https://www.instagram.com/3dkprint',
      'https://www.facebook.com/3dkprint',
      'https://wa.me/5543991741518'
    ],
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00'
    }
  };
}

/**
 * Gera Organization Schema
 */
export function generateOrganizationSchema(baseUrl: string = 'https://www.3dkprint.com.br'): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '3DKPRINT',
    url: baseUrl,
    logo: `${baseUrl}/logo-3dkprint.png`,
    description: 'Especialista em impressão 3D, modelagem 3D e serviços de prototipagem rápida',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+55-43-99174-1518',
      email: 'contato@3dkprint.com.br',
      areaServed: 'BR'
    },
    sameAs: [
      'https://www.instagram.com/3dkprint',
      'https://www.facebook.com/3dkprint',
      'https://wa.me/5543991741518'
    ],
    foundingDate: '2020',
    areaServed: 'BR',
    knowsAbout: ['3D Printing', 'FDM Printing', 'Resin Printing', '3D Modeling', 'Rapid Prototyping']
  };
}

/**
 * Injeta meta tags no documento
 */
export function injectMetaTags(metaTags: SEOMetaTags): void {
  // Title
  document.title = metaTags.title;

  // Meta tags básicas
  updateMetaTag('meta[name="description"]', 'content', metaTags.description);
  updateMetaTag('meta[name="keywords"]', 'content', metaTags.keywords);
  updateMetaTag('meta[name="robots"]', 'content', metaTags.robots);
  updateMetaTag('meta[name="viewport"]', 'content', metaTags.viewport);
  updateMetaTag('meta[charset]', 'charset', metaTags.charset);
  updateMetaTag('meta[http-equiv="Content-Language"]', 'content', metaTags.language);

  // Canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (canonicalLink) {
    canonicalLink.href = metaTags.canonical;
  } else {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = metaTags.canonical;
    document.head.appendChild(link);
  }

  // Open Graph
  updateMetaTag('meta[property="og:title"]', 'content', metaTags.ogTitle);
  updateMetaTag('meta[property="og:description"]', 'content', metaTags.ogDescription);
  updateMetaTag('meta[property="og:image"]', 'content', metaTags.ogImage);
  updateMetaTag('meta[property="og:url"]', 'content', metaTags.ogUrl);
  updateMetaTag('meta[property="og:type"]', 'content', metaTags.ogType);

  // Twitter Card
  updateMetaTag('meta[name="twitter:card"]', 'content', metaTags.twitterCard);
  updateMetaTag('meta[name="twitter:title"]', 'content', metaTags.twitterTitle);
  updateMetaTag('meta[name="twitter:description"]', 'content', metaTags.twitterDescription);
  updateMetaTag('meta[name="twitter:image"]', 'content', metaTags.twitterImage);
}

/**
 * Atualiza ou cria uma meta tag
 */
function updateMetaTag(selector: string, attribute: string, value: string): void {
  let element = document.querySelector(selector) as HTMLMetaElement;
  if (!element) {
    element = document.createElement('meta');
    const [tag, attr] = selector.split('[');
    if (attr.includes('name=')) {
      element.name = attr.replace('name="', '').replace('"]', '');
    } else if (attr.includes('property=')) {
      element.setAttribute('property', attr.replace('property="', '').replace('"]', ''));
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

/**
 * Injeta schema markup no documento
 */
export function injectSchemaMarkup(schemas: StructuredData | StructuredData[]): void {
  const schemasArray = Array.isArray(schemas) ? schemas : [schemas];

  schemasArray.forEach((schema, idx) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `schema-markup-${idx}`;
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

/**
 * Remove schema markup anterior
 */
export function removeSchemaMarkup(): void {
  document.querySelectorAll('script[id^="schema-markup-"]').forEach(el => el.remove());
}

/**
 * Gera URL amigável para SEO
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Calcula tempo de leitura
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
