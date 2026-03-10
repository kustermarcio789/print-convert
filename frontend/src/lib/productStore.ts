// ============================================================
// productStore.ts — Sistema unificado de produtos 3DKPRINT
// Combina catálogo estático com produtos cadastrados no painel
// ============================================================

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  nome: string;
  marca: string;
  categoria: 'FDM' | 'Resina' | 'Acessório' | 'Filamento' | 'Resina Líquida' | string;
  tipo?: string;
  preco: number;
  precoLabel?: string;
  freteIncluido?: boolean;
  estoque: number;
  ativo: boolean;
  destaque?: boolean;
  imagem: string;
  imagens?: string[];       // múltiplas fotos
  modelo3d?: string;        // arquivo 3D opcional (base64 ou URL)
  modelo3dNome?: string;    // nome do arquivo 3D
  descricao: string;
  detalhes?: string;
  specs?: ProductSpec[];
  velocidade?: string;
  volume?: string;
  resolucao?: string;
  firmware?: string;
  base?: string;
  garantia?: string;
  suporte?: string;
  envio?: string;
  badge?: string;
  destaqueTipo?: string;
  createdAt?: number;
  isCustom?: boolean;       // true = cadastrado no painel
}

// Catálogo estático de impressoras — dados reais dos sites oficiais
const catalogoEstatico: Product[] = [
  // ==================== ELEGOO FDM ====================
  {
    id: 'elegoo-centauri-carbon',
    nome: 'Elegoo Centauri Carbon',
    marca: 'Elegoo',
    categoria: 'FDM',
    tipo: 'CoreXY',
    preco: 4360,
    precoLabel: 'R$ 4.360,00',
    freteIncluido: false,
    estoque: 3,
    ativo: true,
    destaque: true,
    imagem: '/images/printers/elegoo-centauri.png',
    imagens: ['/images/printers/elegoo-centauri.png'],
    descricao: 'CoreXY de alta velocidade com estrutura em alumínio fundido e fibra de carbono. Ideal para filamentos reforçados.',
    detalhes: 'A Elegoo Centauri Carbon é uma impressora 3D de alta performance com estrutura CoreXY em alumínio fundido. Oferece velocidade de impressão de até 500 mm/s com aceleração de 20.000 mm/s², garantindo qualidade excepcional mesmo em alta velocidade. Equipada com bico de aço endurecido que atinge 320°C, é compatível com filamentos reforçados com fibra de carbono. O sistema de autonivelamento de 121 pontos, câmera de monitoramento integrada e plataforma de impressão dupla face completam o pacote profissional.',
    specs: [
      { label: 'Velocidade Máx.', value: '500 mm/s' },
      { label: 'Aceleração', value: '20.000 mm/s²' },
      { label: 'Volume de Impressão', value: '256 × 256 × 256 mm' },
      { label: 'Estrutura', value: 'CoreXY — Alumínio Fundido' },
      { label: 'Firmware', value: 'ELEGOO OS' },
      { label: 'Bico', value: 'Aço endurecido — até 320°C' },
      { label: 'Nivelamento', value: 'Automático — 121 pontos' },
      { label: 'Tela', value: '4.3" Touch Capacitiva Colorida' },
      { label: 'Conectividade', value: 'WiFi, USB' },
      { label: 'Câmera', value: 'Sim — Monitoramento remoto' },
      { label: 'Plataforma', value: 'Dupla face — PEI + Texturizada' },
      { label: 'Peso', value: '17.5 kg' },
      { label: 'Dimensões', value: '398 × 404 × 490 mm' },
    ],
    velocidade: '500 mm/s',
    volume: '256×256×256mm',
    firmware: 'ELEGOO OS',
    garantia: 'Garantia de 12 meses',
    suporte: 'Suporte técnico incluso',
    envio: 'Envio para todo o Brasil',
    badge: 'COREXY',
    isCustom: false,
  },
  {
    id: 'elegoo-orangestorm-giga',
    nome: 'Elegoo OrangeStorm Giga',
    marca: 'Elegoo',
    categoria: 'FDM',
    tipo: 'Cartesiana',
    preco: 18900,
    precoLabel: 'R$ 18.900,00',
    freteIncluido: false,
    estoque: 1,
    ativo: true,
    destaque: true,
    imagem: '/images/printers/elegoo-orangestorm-giga.png',
    imagens: ['/images/printers/elegoo-orangestorm-giga.png'],
    descricao: 'Impressora 3D FDM de nível industrial com volume gigante de 800×800×1000mm. Ideal para peças de grande escala.',
    detalhes: 'A Elegoo OrangeStorm Giga é uma impressora 3D FDM de nível industrial, projetada para impressões de grande escala com seu volume de construção massivo de 800×800×1000mm. Oferece velocidade de até 300 mm/s, nivelamento automático de 100 pontos e um bico de alta temperatura que atinge 300°C, sendo compatível com uma ampla variedade de materiais. Sua estrutura robusta de 104 kg, firmware Klipper e tela sensível ao toque HD de 10.1 polegadas proporcionam uma experiência de impressão estável e profissional. Conectividade WiFi, USB e LAN para máxima flexibilidade.',
    specs: [
      { label: 'Velocidade Máx.', value: '300 mm/s' },
      { label: 'Volume de Impressão', value: '800 × 800 × 1000 mm' },
      { label: 'Estrutura', value: 'Cartesiana Industrial' },
      { label: 'Firmware', value: 'Klipper' },
      { label: 'Bico', value: 'Alta temperatura — até 300°C' },
      { label: 'Nivelamento', value: 'Automático — 100 pontos' },
      { label: 'Tela', value: '10.1" HD Touch Capacitiva' },
      { label: 'Conectividade', value: 'WiFi, USB, LAN' },
      { label: 'Cama Aquecida', value: 'Sim — Aquecimento rápido' },
      { label: 'Ventilação', value: 'Sistema de refrigeração potente' },
      { label: 'Peso', value: '104 kg' },
      { label: 'Dimensões', value: '1224 × 1164 × 1425 mm' },
    ],
    velocidade: '300 mm/s',
    volume: '800×800×1000mm',
    firmware: 'Klipper',
    garantia: 'Garantia de 12 meses',
    suporte: 'Suporte técnico incluso',
    envio: 'Envio para todo o Brasil',
    badge: 'INDUSTRIAL',
    isCustom: false,
  },

  // ==================== SOVOL FDM ====================
  {
    id: 'sovol-sv08-max',
    nome: 'Sovol SV08 MAX',
    marca: 'Sovol',
    categoria: 'FDM',
    tipo: 'CoreXY',
    preco: 15000,
    precoLabel: 'R$ 15.000,00',
    freteIncluido: false,
    estoque: 1,
    ativo: true,
    destaque: true,
    imagem: '/images/printers/sovol-sv08-max.png',
    imagens: ['/images/printers/sovol-sv08-max.png'],
    descricao: 'CoreXY de grande formato com volume de 500×500×500mm e velocidade de até 700 mm/s. A definitiva para profissionais.',
    detalhes: 'A Sovol SV08 MAX é a impressora definitiva para profissionais que precisam de volume e velocidade. Com estrutura CoreXY e volume de construção massivo de 500×500×500mm, ela redefine a impressão em grande escala. Atinge velocidades de até 700 mm/s sem comprometer a qualidade, graças ao firmware Klipper de código aberto. O nivelamento automático por Eddy Current Scanning com sensor de pressão garante a primeira camada perfeita. Inclui câmera para monitoramento remoto e hotend de alta temperatura (300°C) para materiais avançados.',
    specs: [
      { label: 'Velocidade Máx.', value: '700 mm/s' },
      { label: 'Volume de Impressão', value: '500 × 500 × 500 mm' },
      { label: 'Estrutura', value: 'CoreXY' },
      { label: 'Firmware', value: 'Klipper (Open-source)' },
      { label: 'Hotend', value: 'Alta temperatura — até 300°C' },
      { label: 'Nivelamento', value: 'Eddy Current + Sensor de Pressão' },
      { label: 'Tela', value: 'Touch Capacitiva HDMI Klipper' },
      { label: 'Câmera', value: 'Sim — Monitoramento remoto' },
      { label: 'Base', value: 'Inspirada no Voron 2.4' },
    ],
    velocidade: '700 mm/s',
    volume: '500×500×500mm',
    base: 'Voron 2.4',
    firmware: 'Klipper',
    garantia: 'Garantia de 12 meses',
    suporte: 'Suporte técnico incluso',
    envio: 'Envio para todo o Brasil',
    badge: 'PROFISSIONAL',
    isCustom: false,
  },
  {
    id: 'sovol-sv08',
    nome: 'Sovol SV08',
    marca: 'Sovol',
    categoria: 'FDM',
    tipo: 'CoreXY',
    preco: 6800,
    precoLabel: 'R$ 6.800,00',
    freteIncluido: false,
    estoque: 2,
    ativo: true,
    destaque: false,
    imagem: '/images/printers/sovol-sv08.png',
    imagens: ['/images/printers/sovol-sv08.png'],
    descricao: 'CoreXY de código aberto inspirada na Voron 2.4 com 700 mm/s e volume de 350×350×345mm.',
    detalhes: 'A Sovol SV08 é uma impressora 3D FDM de alta velocidade inspirada no design Voron 2.4, oferecendo um grande volume de impressão de 350×350×345mm e velocidades de até 700 mm/s. Com firmware Klipper de código aberto, 4 motores Z independentes para estabilidade e conectividade WiFi + Ethernet, é ideal para entusiastas e profissionais que buscam velocidade, personalização e confiabilidade. O layer height mínimo de 0.08mm garante detalhes finos quando necessário.',
    specs: [
      { label: 'Velocidade Máx.', value: '700 mm/s' },
      { label: 'Volume de Impressão', value: '350 × 350 × 345 mm' },
      { label: 'Estrutura', value: 'CoreXY' },
      { label: 'Firmware', value: 'Klipper (Open-source)' },
      { label: 'Layer Height', value: '0.08 — 0.36 mm' },
      { label: 'Nivelamento', value: 'Sensor indutivo + Sensor de pressão' },
      { label: 'Tela', value: '5" Touch Screen' },
      { label: 'Conectividade', value: 'WiFi, Ethernet' },
      { label: 'Motores Z', value: '4 independentes' },
      { label: 'Base', value: 'Inspirada no Voron 2.4' },
      { label: 'Dimensões', value: '550 × 537 × 575 mm' },
    ],
    velocidade: '700 mm/s',
    volume: '350×350×345mm',
    base: 'Voron 2.4',
    firmware: 'Klipper',
    garantia: 'Garantia de 12 meses',
    suporte: 'Suporte técnico incluso',
    envio: 'Envio para todo o Brasil',
    isCustom: false,
  },
  {
    id: 'sovol-zero',
    nome: 'Sovol Zero',
    marca: 'Sovol',
    categoria: 'FDM',
    tipo: 'CoreXY',
    preco: 4900,
    precoLabel: 'R$ 4.900,00',
    freteIncluido: false,
    estoque: 3,
    ativo: true,
    destaque: true,
    imagem: '/images/printers/sovol-zero.png',
    imagens: ['/images/printers/sovol-zero.png'],
    descricao: 'CoreXY ultra-rápida de 1200 mm/s com Klipper. Compacta, precisa e extremamente veloz.',
    detalhes: 'A Sovol Zero é uma impressora 3D CoreXY de ultra-alta velocidade, atingindo impressionantes 1200 mm/s. Apesar do volume compacto de 152×152×152mm, ela entrega impressões rápidas e precisas graças ao firmware Klipper, guias lineares de alta qualidade e sistema de nivelamento automático duplo (sensor indutivo + sensor de força). A extrusora de alta temperatura permite trabalhar com uma ampla variedade de filamentos, incluindo materiais de engenharia.',
    specs: [
      { label: 'Velocidade Máx.', value: '1200 mm/s' },
      { label: 'Volume de Impressão', value: '152 × 152 × 152 mm' },
      { label: 'Estrutura', value: 'CoreXY — Guias Lineares' },
      { label: 'Firmware', value: 'Klipper (Open-source)' },
      { label: 'Nivelamento', value: 'Sensor indutivo + Sensor de força' },
      { label: 'Conectividade', value: 'WiFi, Ethernet' },
      { label: 'Extrusora', value: 'Alta temperatura' },
    ],
    velocidade: '1200 mm/s',
    volume: '152×152×152mm',
    firmware: 'Klipper',
    garantia: 'Garantia de 12 meses',
    suporte: 'Suporte técnico incluso',
    envio: 'Envio para todo o Brasil',
    badge: 'ULTRA VELOCIDADE',
    isCustom: false,
  },

  // ==================== ELEGOO RESINA ====================
  {
    id: 'elegoo-saturn4-ultra-12k',
    nome: 'Elegoo Saturn 4 Ultra 12K',
    marca: 'Elegoo',
    categoria: 'Resina',
    tipo: 'MSLA',
    preco: 4800,
    precoLabel: 'R$ 4.800,00',
    freteIncluido: false,
    estoque: 2,
    ativo: true,
    destaque: true,
    imagem: '/images/printers/elegoo-saturn4-12k.png',
    imagens: ['/images/printers/elegoo-saturn4-12k.png'],
    descricao: 'Resina profissional 12K com tecnologia de liberação de inclinação e resolução de 19×24 μm.',
    detalhes: 'A Elegoo Saturn 4 Ultra utiliza a revolucionária tecnologia de liberação de inclinação, permitindo que o modelo seja retirado rapidamente do filme de liberação ao inclinar o tanque de resina, alcançando velocidade de impressão de até 150 mm/h. Com LCD monocromático de 10 polegadas e resolução 12K (11520×5120), oferece resolução XY de 19×24 μm para modelos com clareza e precisão impressionantes. O nivelamento automático, câmera com IA para monitoramento e sensores mecânicos inteligentes garantem impressões sem falhas.',
    specs: [
      { label: 'Resolução', value: '12K (11520 × 5120)' },
      { label: 'Resolução XY', value: '19 × 24 μm' },
      { label: 'Volume de Impressão', value: '218.88 × 122.88 × 220 mm' },
      { label: 'Velocidade', value: '150 mm/h' },
      { label: 'Tela LCD', value: '10" Monocromática' },
      { label: 'Tecnologia', value: 'Liberação de Inclinação (Tilt Release)' },
      { label: 'Nivelamento', value: 'Automático' },
      { label: 'Câmera IA', value: 'Sim — Detecção de falhas' },
      { label: 'Tela Touch', value: '4.0" Capacitiva' },
      { label: 'Conectividade', value: 'WiFi, USB' },
      { label: 'Sensores', value: 'Mecânicos inteligentes' },
      { label: 'Peso', value: '14.5 kg' },
      { label: 'Dimensões', value: '327.4 × 329.2 × 548 mm' },
    ],
    velocidade: '150 mm/h',
    volume: '218.88×122.88×220mm',
    resolucao: '12K',
    garantia: 'Garantia de 12 meses',
    suporte: 'Suporte técnico incluso',
    envio: 'Envio para todo o Brasil',
    badge: 'RESINA 12K',
    isCustom: false,
  },
  {
    id: 'elegoo-saturn4-ultra-16k',
    nome: 'Elegoo Saturn 4 Ultra 16K',
    marca: 'Elegoo',
    categoria: 'Resina',
    tipo: 'MSLA',
    preco: 5900,
    precoLabel: 'R$ 5.900,00',
    freteIncluido: false,
    estoque: 1,
    ativo: true,
    destaque: true,
    imagem: '/images/printers/elegoo-saturn4-16k.png',
    imagens: ['/images/printers/elegoo-saturn4-16k.png'],
    descricao: 'A MELHOR resolução do mercado! Resina 16K (15120×6230) para detalhes microscópicos com precisão impecável.',
    detalhes: 'A Saturn 4 Ultra 16K é o topo de linha absoluto em impressão de resina. Com resolução ultra-alta de 16K (15120×6230), cada modelo apresenta superfícies lisas, texturas realistas e precisão impecável que nenhuma outra impressora consegue reproduzir. Possui tecnologia avançada de liberação de inclinação para velocidade de até 150 mm/h, aquecimento inteligente do tanque a 30°C para consistência da resina, câmera AI atualizada com luz para monitoramento e gravação de time-lapse, e nivelamento automático Plug-N-Play. Ideal para joalheria, miniaturas, odontologia e protótipos de alta fidelidade.',
    specs: [
      { label: 'Resolução', value: '16K (15120 × 6230)' },
      { label: 'Volume de Impressão', value: '211.68 × 118.37 × 220 mm' },
      { label: 'Velocidade', value: '150 mm/h' },
      { label: 'Tela LCD', value: '10" Monocromática' },
      { label: 'Tecnologia', value: 'Liberação de Inclinação (Tilt Release)' },
      { label: 'Aquecimento', value: 'Tanque inteligente a 30°C' },
      { label: 'Nivelamento', value: 'Automático — Plug-N-Play' },
      { label: 'Câmera IA', value: 'Sim — Com luz + Time-lapse' },
      { label: 'Firmware', value: 'EL3D-4.0' },
      { label: 'Conectividade', value: 'WiFi, USB' },
      { label: 'Peso', value: '16.1 kg' },
      { label: 'Dimensões', value: '327.4 × 329.2 × 548 mm' },
    ],
    velocidade: '150 mm/h',
    volume: '211.68×118.37×220mm',
    resolucao: '16K',
    firmware: 'EL3D-4.0',
    garantia: 'Garantia de 12 meses',
    suporte: 'Suporte técnico incluso',
    envio: 'Envio para todo o Brasil',
    badge: 'TOPO DE LINHA 16K',
    isCustom: false,
  },
  {
    id: 'elegoo-mars5-ultra',
    nome: 'Elegoo Mars 5 Ultra 9K',
    marca: 'Elegoo',
    categoria: 'Resina',
    tipo: 'MSLA',
    preco: 2900,
    precoLabel: 'R$ 2.900,00',
    freteIncluido: false,
    estoque: 3,
    ativo: true,
    destaque: false,
    imagem: '/images/products/mars-5-ultra-9k.jpg',
    imagens: ['/images/products/mars-5-ultra-9k.jpg'],
    descricao: 'Resina compacta 9K ideal para iniciantes. Tecnologia de inclinação, câmera IA e impressão via WiFi.',
    detalhes: 'A Elegoo Mars 5 Ultra é a impressora 3D de resina ideal para quem está começando, oferecendo uma combinação perfeita de velocidade, precisão e facilidade de uso. Com tela LCD monocromática 9K de 7 polegadas e resolução XY de 18 μm, ela produz impressões detalhadas de forma consistente. A tecnologia de liberação de inclinação permite velocidades de até 150 mm/h. A câmera AI integrada com monitoramento em tempo real e gravação em time-lapse, sensores mecânicos inteligentes para detecção de problemas e impressão em cluster via WiFi completam o pacote.',
    specs: [
      { label: 'Resolução', value: '9K' },
      { label: 'Resolução XY', value: '18 μm' },
      { label: 'Volume de Impressão', value: '153.36 × 77.76 × 165 mm' },
      { label: 'Velocidade', value: '150 mm/h' },
      { label: 'Tela LCD', value: '7" Monocromática' },
      { label: 'Tecnologia', value: 'Liberação de Inclinação (Tilt Release)' },
      { label: 'Nivelamento', value: 'Automático — 1 clique' },
      { label: 'Câmera IA', value: 'Sim — Monitoramento + Time-lapse' },
      { label: 'Tela Touch', value: '4.0" Capacitiva' },
      { label: 'Conectividade', value: 'WiFi, USB' },
      { label: 'Firmware', value: 'EL3D-4.0' },
      { label: 'Peso', value: '8.8 kg' },
      { label: 'Dimensões', value: '260 × 268 × 451.5 mm' },
    ],
    velocidade: '150 mm/h',
    volume: '153.36×77.76×165mm',
    resolucao: '9K',
    firmware: 'EL3D-4.0',
    garantia: 'Garantia de 12 meses',
    suporte: 'Suporte técnico incluso',
    envio: 'Envio para todo o Brasil',
    badge: 'INICIANTE',
    isCustom: false,
  },
  {
    id: 'elegoo-saturn3-ultra-12k',
    nome: 'Elegoo Saturn 3 Ultra 12K',
    marca: 'Elegoo',
    categoria: 'Resina',
    tipo: 'MSLA',
    preco: 3700,
    precoLabel: 'R$ 3.700,00',
    freteIncluido: false,
    estoque: 3,
    ativo: true,
    destaque: false,
    imagem: '/images/printers/elegoo-saturn3.png',
    imagens: ['/images/printers/elegoo-saturn3.png'],
    descricao: 'Excelente custo-benefício em resina 12K. Tela de 10 polegadas com volume generoso de 219×123×260mm.',
    detalhes: 'A Elegoo Saturn 3 Ultra 12K oferece excelente custo-benefício para quem quer entrar no mundo da resina com qualidade profissional. Com resolução 12K em tela de 10 polegadas, velocidade de até 150 mm/h e volume de impressão generoso de 219×123×260mm, é uma escolha sólida para miniaturas, protótipos e peças detalhadas.',
    specs: [
      { label: 'Resolução', value: '12K Mono MSLA' },
      { label: 'Volume de Impressão', value: '219 × 123 × 260 mm' },
      { label: 'Velocidade', value: '150 mm/h' },
      { label: 'Tela LCD', value: '10" Monocromática' },
    ],
    velocidade: '150 mm/h',
    volume: '219×123×260mm',
    resolucao: '12K',
    garantia: 'Garantia de 12 meses',
    suporte: 'Suporte técnico incluso',
    envio: 'Envio para todo o Brasil',
    isCustom: false,
  },
];

// Chave do localStorage para produtos customizados
const CUSTOM_PRODUCTS_KEY = 'admin_custom_produtos';
const IMAGE_OVERRIDES_KEY = 'admin_image_overrides';
const CATALOG_OVERRIDES_KEY = 'admin_catalog_overrides';

// Buscar overrides de dados do catálogo (preço, estoque, destaque, ativo, variações)
export function getCatalogOverrides(): Record<string, Partial<Product>> {
  try {
    const saved = localStorage.getItem(CATALOG_OVERRIDES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Buscar produtos customizados do localStorage
export function getCustomProducts(): Product[] {
  try {
    const saved = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Salvar produtos customizados no localStorage
export function saveCustomProducts(products: Product[]): void {
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(products));
}

// Buscar overrides de imagem do localStorage
export function getImageOverrides(): Record<string, string> {
  try {
    const saved = localStorage.getItem(IMAGE_OVERRIDES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Obter todos os produtos (estático + customizados), com overrides de imagem
export function getAllProducts(): Product[] {
  const customProducts = getCustomProducts();
  const imageOverrides = getImageOverrides();

  const catalogOverrides = getCatalogOverrides();

  // Aplicar overrides de imagem e dados ao catálogo estático
  const staticWithOverrides = catalogoEstatico.map((p) => ({
    ...p,
    ...(catalogOverrides[p.id] || {}),
    imagem: imageOverrides[p.id] || (catalogOverrides[p.id]?.imagem) || p.imagem,
    imagens: imageOverrides[p.id]
      ? [imageOverrides[p.id], ...(p.imagens || []).slice(1)]
      : (catalogOverrides[p.id]?.imagens) || p.imagens || [p.imagem],
  }));

  // Combinar: estático primeiro, depois customizados (sem duplicatas)
  const staticIds = new Set(staticWithOverrides.map((p) => p.id));
  const uniqueCustom = customProducts.filter((p) => !staticIds.has(p.id));

  return [...staticWithOverrides, ...uniqueCustom];
}

// Buscar produto por ID
export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

// Buscar apenas produtos ativos
export function getActiveProducts(): Product[] {
  return getAllProducts().filter((p) => p.ativo !== false);
}

// Adicionar produto customizado
export function addCustomProduct(product: Omit<Product, 'isCustom' | 'createdAt'>): Product {
  const newProduct: Product = {
    ...product,
    isCustom: true,
    createdAt: Date.now(),
  };
  const existing = getCustomProducts();
  saveCustomProducts([...existing, newProduct]);
  return newProduct;
}

// Atualizar produto customizado
export function updateCustomProduct(id: string, updates: Partial<Product>): void {
  const products = getCustomProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    saveCustomProducts(products);
  }
}

// Remover produto customizado
export function removeCustomProduct(id: string): void {
  const products = getCustomProducts().filter((p) => p.id !== id);
  saveCustomProducts(products);
}

// Exportar catálogo estático para uso no admin
export { catalogoEstatico };
