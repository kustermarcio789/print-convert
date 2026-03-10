export const config = { runtime: 'edge' };

const BASE_URL = 'https://www.3dkprint.com.br';

// ============ CATÁLOGO DE PRODUTOS ============
const PRODUCTS = {
  'elegoo-centauri-carbon': {
    nome: 'Elegoo Centauri Carbon',
    descricao: 'CoreXY de alta velocidade com estrutura em alumínio fundido e fibra de carbono. Velocidade até 500mm/s. Ideal para filamentos reforçados como Nylon CF e PC.',
    imagem: '/images/printers/elegoo-centauri.png',
    preco: 'R$ 4.360,00',
    marca: 'Elegoo'
  },
  'elegoo-orangestorm-giga': {
    nome: 'Elegoo OrangeStorm Giga',
    descricao: 'Impressora 3D FDM industrial de grande formato com volume de 800x800x1000mm. Estrutura CoreXY com firmware Klipper e tela de 10.1 polegadas.',
    imagem: '/images/printers/elegoo-orangestorm-giga.png',
    preco: 'R$ 18.900,00',
    marca: 'Elegoo'
  },
  'sovol-sv08-max': {
    nome: 'Sovol SV08 MAX',
    descricao: 'CoreXY baseada no Voron 2.4 com volume de impressao de 500x500x500mm. Velocidade ate 700mm/s com firmware Klipper e sensor Eddy Current.',
    imagem: '/images/printers/sovol-sv08-max.png',
    preco: 'R$ 15.000,00',
    marca: 'Sovol'
  },
  'sovol-sv08': {
    nome: 'Sovol SV08',
    descricao: 'CoreXY baseada no Voron 2.4 com volume de 350x350x345mm. Velocidade ate 700mm/s com Klipper, 4 motores Z independentes e conectividade WiFi.',
    imagem: '/images/printers/sovol-sv08.png',
    preco: 'R$ 6.800,00',
    marca: 'Sovol'
  },
  'sovol-zero': {
    nome: 'Sovol Zero',
    descricao: 'CoreXY compacta de alta velocidade ate 1200mm/s com guias lineares e sensor de nivelamento duplo. Excelente custo-beneficio.',
    imagem: '/images/printers/sovol-zero.png',
    preco: 'R$ 2.200,00',
    marca: 'Sovol'
  },
  'elegoo-saturn4-ultra-12k': {
    nome: 'Elegoo Saturn 4 Ultra 12K',
    descricao: 'Impressora de resina MSLA com resolucao 12K (11520x5120). Sistema Tilt Release para impressao suave e camera IA integrada.',
    imagem: '/images/printers/elegoo-saturn4-12k.png',
    preco: 'R$ 4.200,00',
    marca: 'Elegoo'
  },
  'elegoo-saturn4-ultra-16k': {
    nome: 'Elegoo Saturn 4 Ultra 16K',
    descricao: 'Topo de linha em resina com resolucao 16K (15120x6230). Aquecimento integrado ate 30 graus e sistema EL3D-4.0.',
    imagem: '/images/printers/elegoo-saturn4-16k.png',
    preco: 'R$ 5.500,00',
    marca: 'Elegoo'
  },
  'elegoo-mars5-ultra': {
    nome: 'Elegoo Mars 5 Ultra 9K',
    descricao: 'Resina compacta 9K com resolucao de 18 microns. Ideal para miniaturas, joalheria e pecas com detalhes finos. Impressao em cluster via WiFi.',
    imagem: '/images/products/mars-5-ultra-9k.jpg',
    preco: 'R$ 2.100,00',
    marca: 'Elegoo'
  },
  'elegoo-saturn3-ultra-12k': {
    nome: 'Elegoo Saturn 3 Ultra 12K',
    descricao: 'Resina 12K com excelente custo-beneficio. Volume de impressao generoso e resolucao profissional.',
    imagem: '/images/printers/elegoo-saturn3.png',
    preco: 'R$ 3.200,00',
    marca: 'Elegoo'
  }
};

// ============ META TAGS POR PÁGINA ============
const PAGE_META = {
  'produtos': {
    title: '3DKPRINT - Catalogo de Impressoras 3D | Elegoo, Sovol, Creality',
    description: 'Catalogo de impressoras 3D FDM e Resina. Elegoo Centauri Carbon, Saturn 4 Ultra, Sovol SV08 e mais. Envio para todo o Brasil com garantia.',
    image: '/images/og/og-produtos.png'
  },
  'orcamento': {
    title: '3DKPRINT - Orcamento Online de Impressao 3D',
    description: 'Solicite orcamento gratuito para impressao 3D. Envie seu arquivo STL e receba resposta em ate 24 horas. FDM e Resina SLA.',
    image: '/images/og/og-orcamento.png'
  },
  'conhecimento': {
    title: '3DKPRINT - Base de Conhecimento | Impressao 3D, Klipper, Voron',
    description: 'Guia completo sobre impressao 3D: filamentos, resinas, Klipper vs Marlin, Voron Design, tipos de maquinas e muito mais.',
    image: '/images/og/og-conhecimento.png'
  },
  'consultor-3d': {
    title: '3DKPRINT - Consultor Inteligente de Impressoras 3D',
    description: 'Encontre a impressora 3D ideal para voce com nosso consultor inteligente. Responda algumas perguntas e receba recomendacoes personalizadas.',
    image: '/images/og/og-consultor.png'
  },
  'portfolio': {
    title: '3DKPRINT - Portfolio de Projetos 3D',
    description: 'Veja nossos projetos de impressao 3D: prototipos, miniaturas, pecas funcionais e muito mais.',
    image: '/images/og/og-portfolio.png'
  },
  'comunidade': {
    title: '3DKPRINT - Comunidade de Impressao 3D',
    description: 'Junte-se a comunidade 3DKPRINT. Compartilhe projetos, tire duvidas e conecte-se com outros makers.',
    image: '/images/og/og-comunidade.png'
  },
  'calculadora': {
    title: '3DKPRINT - Calculadora 3D | Calcule o Custo e Preco de Venda',
    description: 'Calculadora 3D gratuita: descubra o custo real e o preco de venda ideal das suas impressoes em filamento FDM e resina SLA/DLP. Inclui depreciacao, energia, material e margem de lucro.',
    image: '/images/og/og-calculadora.png'
  },
  'servicos': {
    title: '3DKPRINT - Servicos de Impressao 3D Profissional',
    description: 'Impressao 3D FDM e Resina SLA, modelagem 3D, pintura premium e manutencao de impressoras. Orcamento online em 24h.',
    image: '/images/og/og-default.png'
  },
  'sobre': {
    title: '3DKPRINT - Sobre Nos | Impressao 3D Profissional',
    description: 'Conheca a 3DKPRINT. Especialistas em impressao 3D profissional em Ourinhos-SP. Servicos de qualidade para todo o Brasil.',
    image: '/images/og/og-default.png'
  },
  'contato': {
    title: '3DKPRINT - Contato | Fale Conosco',
    description: 'Entre em contato com a 3DKPRINT. WhatsApp, e-mail e formulario de contato. Atendimento rapido e personalizado.',
    image: '/images/og/og-default.png'
  },
  'login': {
    title: '3DKPRINT - Login | Acesse sua Conta',
    description: 'Faca login na sua conta 3DKPRINT para acompanhar pedidos, orcamentos e acessar funcionalidades exclusivas.',
    image: '/images/og/og-default.png'
  },
  'cadastro': {
    title: '3DKPRINT - Cadastro | Crie sua Conta',
    description: 'Crie sua conta na 3DKPRINT e tenha acesso a orcamentos, acompanhamento de pedidos e muito mais.',
    image: '/images/og/og-default.png'
  },
  'orcamento-pintura': {
    title: '3DKPRINT - Orcamento de Pintura Premium para Pecas 3D',
    description: 'Solicite orcamento para pintura profissional de pecas impressas em 3D. Acabamento premium com tintas de alta qualidade.',
    image: '/images/og/og-orcamento.png'
  },
  'orcamento-modelagem': {
    title: '3DKPRINT - Orcamento de Modelagem 3D Profissional',
    description: 'Solicite orcamento para modelagem 3D profissional. Criamos seu modelo do zero ou adaptamos arquivos existentes.',
    image: '/images/og/og-orcamento.png'
  },
  'orcamento-manutencao': {
    title: '3DKPRINT - Orcamento de Manutencao de Impressora 3D',
    description: 'Solicite orcamento para manutencao e reparo de impressoras 3D FDM e Resina. Atendimento tecnico especializado.',
    image: '/images/og/og-orcamento.png'
  },
  'orcamento-multi': {
    title: '3DKPRINT - Orcamento Multiplo de Impressao 3D',
    description: 'Envie multiplos arquivos 3D e receba orcamento para todos de uma vez. Ideal para projetos com varias pecas.',
    image: '/images/og/og-orcamento.png'
  },
  'blog': {
    title: '3DKPRINT - Blog | Novidades e Dicas de Impressao 3D',
    description: 'Acompanhe as ultimas novidades, tutoriais e dicas sobre impressao 3D, materiais, maquinas e tecnicas.',
    image: '/images/og/og-conhecimento.png'
  },
  'marcas': {
    title: '3DKPRINT - Marcas de Impressoras 3D | Elegoo, Sovol, Creality',
    description: 'Conheca as melhores marcas de impressoras 3D disponiveis na 3DKPRINT. Elegoo, Sovol, Creality e mais.',
    image: '/images/og/og-produtos.png'
  },
  'enviar-arquivo': {
    title: '3DKPRINT - Enviar Arquivo 3D para Impressao',
    description: 'Envie seu arquivo STL, OBJ, 3MF ou STEP para impressao 3D profissional. Aceitamos diversos formatos.',
    image: '/images/og/og-orcamento.png'
  },
  'ajuda': {
    title: '3DKPRINT - Central de Ajuda',
    description: 'Central de ajuda da 3DKPRINT. Encontre respostas para suas duvidas sobre impressao 3D, pedidos e servicos.',
    image: '/images/og/og-default.png'
  },
  'termos': {
    title: '3DKPRINT - Termos de Uso',
    description: 'Termos de uso da plataforma 3DKPRINT. Leia nossos termos e condicoes de servico.',
    image: '/images/og/og-default.png'
  },
  'privacidade': {
    title: '3DKPRINT - Politica de Privacidade',
    description: 'Politica de privacidade da 3DKPRINT. Saiba como tratamos seus dados pessoais.',
    image: '/images/og/og-default.png'
  },
  'devolucao': {
    title: '3DKPRINT - Politica de Devolucao',
    description: 'Politica de devolucao e troca da 3DKPRINT. Saiba como funciona nosso processo de devolucao.',
    image: '/images/og/og-default.png'
  },
  'demo-3d': {
    title: '3DKPRINT - Demonstracao de Modelos 3D',
    description: 'Visualize modelos 3D interativos diretamente no navegador. Demonstracao da tecnologia de visualizacao 3D da 3DKPRINT.',
    image: '/images/og/og-default.png'
  }
};

// ============ DEFAULTS ============
const DEFAULTS = {
  title: '3DKPRINT - Impressao 3D Profissional | Orcamento Online',
  description: 'Especialistas em Impressao 3D Profissional. Servicos de impressao FDM e Resina SLA, modelagem 3D, pintura premium e manutencao de impressoras. Orcamento online em 24h. Entrega para todo o Brasil.',
  image: '/images/og/og-home-logo.png',
  type: 'website'
};

// ============ HANDLER ============
export default async function handler(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const pathParts = pathname.split('/').filter(Boolean);

  let title, description, image, ogType, pageUrl;

  // 1. Verificar se é uma página de produto ou checkout
  if ((pathParts[0] === 'produto' || pathParts[0] === 'checkout') && pathParts[1]) {
    const productId = pathParts[1];
    const product = PRODUCTS[productId];

    if (product) {
      title = `${product.nome} - ${product.preco} | 3DKPRINT`;
      description = `${product.descricao} Envio para todo o Brasil. Garantia de 12 meses.`;
      image = `${BASE_URL}${product.imagem}`;
      ogType = 'product';
      pageUrl = `${BASE_URL}/produto/${productId}`;
    }
  }

  // 2. Se não é produto, verificar páginas conhecidas
  if (!title && pathParts[0]) {
    const pageMeta = PAGE_META[pathParts[0]];
    if (pageMeta) {
      title = pageMeta.title;
      description = pageMeta.description;
      image = `${BASE_URL}${pageMeta.image}`;
      ogType = 'website';
      pageUrl = `${BASE_URL}/${pathParts[0]}`;
    }
  }

  // 3. Fallback para defaults
  if (!title) {
    title = DEFAULTS.title;
    description = DEFAULTS.description;
    image = `${BASE_URL}${DEFAULTS.image}`;
    ogType = DEFAULTS.type;
    pageUrl = BASE_URL + (pathname !== '/' ? pathname : '');
  }

  // Buscar o index.html estático do build
  // Na Vercel, os assets estáticos são servidos diretamente.
  // Precisamos buscar o index.html original (sem passar pelo rewrite).
  const base = url.origin;
  
  // Usar _next/static ou diretamente o index.html
  // O truque é adicionar uma extensão para que o rewrite do vercel.json não capture
  const htmlRes = await fetch(`${base}/index.html`);
  let html = await htmlRes.text();

  // Substituir os placeholders
  html = html
    .replace(/__OG_TITLE__/g, escapeHtml(title))
    .replace(/__OG_DESCRIPTION__/g, escapeHtml(description))
    .replace(/__OG_IMAGE__/g, image)
    .replace(/__OG_TYPE__/g, ogType)
    .replace(/__OG_URL__/g, pageUrl || BASE_URL);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}

// Escapar HTML para evitar XSS nas meta tags
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
