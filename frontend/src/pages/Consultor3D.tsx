import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, ArrowRight, Printer, Cpu, Gauge, DollarSign, Layers, Target, ChevronRight, RotateCw, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

// ===== MACHINE DATABASE =====
interface Machine {
  name: string;
  brand: string;
  type: 'fdm' | 'resina';
  architecture: string;
  firmware: string;
  buildVolume: string;
  speed: string;
  price: string;
  priceRange: [number, number];
  linearRails: boolean;
  autoLevel: boolean;
  directDrive: boolean;
  enclosure: boolean;
  multiColor: boolean;
  wifi: boolean;
  image: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  level: 'iniciante' | 'intermediario' | 'avancado' | 'profissional';
  availableOnSite?: boolean;
  sitePrice?: string;
  buyLink?: string;
}

const machines: Machine[] = [
  {
    name: 'Creality Ender 3 V3 SE', brand: 'Creality', type: 'fdm', architecture: 'Cartesiana (Bed Slinger)',
    firmware: 'Marlin', buildVolume: '220x220x250mm', speed: '250mm/s', price: 'R$800 - R$1.200',
    priceRange: [800, 1200], linearRails: false, autoLevel: true, directDrive: true, enclosure: false,
    multiColor: false, wifi: false, image: '/images/brands/creality.png',
    pros: ['Preço acessível', 'Auto-nivelamento CR Touch', 'Direct drive', 'Boa comunidade'],
    cons: ['Velocidade limitada', 'Sem Wi-Fi', 'Sem câmara fechada', 'Rodinhas no eixo Y'],
    bestFor: ['Iniciantes', 'Prototipagem básica', 'Peças decorativas', 'Aprendizado'],
    level: 'iniciante',
  },
  {
    name: 'Creality Ender 3 V3', brand: 'Creality', type: 'fdm', architecture: 'CoreXZ',
    firmware: 'Klipper', buildVolume: '220x220x250mm', speed: '600mm/s', price: 'R$1.500 - R$2.200',
    priceRange: [1500, 2200], linearRails: true, autoLevel: true, directDrive: true, enclosure: false,
    multiColor: false, wifi: true, image: '/images/brands/creality.png',
    pros: ['Klipper nativo', 'Guias lineares', '600mm/s', 'Wi-Fi integrado', 'Preço competitivo'],
    cons: ['Sem câmara fechada', 'Volume médio', 'Marca com suporte variável'],
    bestFor: ['Quem quer velocidade por bom preço', 'Upgrade de Ender 3 antiga', 'Impressões rápidas'],
    level: 'intermediario',
  },
  {
    name: 'Bambu Lab A1 Mini', brand: 'Bambu Lab', type: 'fdm', architecture: 'CoreXY (Bed Slinger)',
    firmware: 'Proprietário (Bambu)', buildVolume: '180x180x180mm', speed: '500mm/s', price: 'R$1.800 - R$2.500',
    priceRange: [1800, 2500], linearRails: true, autoLevel: true, directDrive: true, enclosure: false,
    multiColor: true, wifi: true, image: '/images/brands/bambulab.png',
    pros: ['Plug and play', 'Multi-cor com AMS Lite', 'Calibração 100% automática', 'App e câmera'],
    cons: ['Volume pequeno', 'Firmware fechado', 'Dependência da nuvem Bambu'],
    bestFor: ['Iniciantes que querem qualidade', 'Multi-cor fácil', 'Impressões rápidas e bonitas'],
    level: 'iniciante',
  },
  {
    name: 'Bambu Lab P1S', brand: 'Bambu Lab', type: 'fdm', architecture: 'CoreXY',
    firmware: 'Proprietário (Bambu)', buildVolume: '256x256x256mm', speed: '500mm/s', price: 'R$4.500 - R$6.000',
    priceRange: [4500, 6000], linearRails: true, autoLevel: true, directDrive: true, enclosure: true,
    multiColor: true, wifi: true, image: '/images/brands/bambulab.png',
    pros: ['Câmara fechada', 'AMS multi-cor', 'Imprime ABS/Nylon/PC', 'Calibração automática total'],
    cons: ['Preço elevado', 'Firmware fechado', 'Dependência da nuvem'],
    bestFor: ['Uso profissional', 'Materiais de engenharia', 'Produção em série', 'Multi-cor avançado'],
    level: 'avancado',
  },
  {
    name: 'Bambu Lab X1 Carbon', brand: 'Bambu Lab', type: 'fdm', architecture: 'CoreXY',
    firmware: 'Proprietário (Bambu)', buildVolume: '256x256x256mm', speed: '500mm/s', price: 'R$8.000 - R$12.000',
    priceRange: [8000, 12000], linearRails: true, autoLevel: true, directDrive: true, enclosure: true,
    multiColor: true, wifi: true, image: '/images/brands/bambulab.png',
    pros: ['Topo de linha', 'Sensor de espaguete IA', 'Hardened nozzle', 'LiDAR', 'Câmera IA'],
    cons: ['Preço premium', 'Firmware fechado', 'Volume não é o maior'],
    bestFor: ['Profissionais exigentes', 'Fibra de carbono', 'Produção de alta qualidade'],
    level: 'profissional',
  },
  {
    name: 'Prusa MK4S', brand: 'Prusa', type: 'fdm', architecture: 'Cartesiana (Bed Slinger)',
    firmware: 'PrusaFirmware (Marlin fork)', buildVolume: '250x210x220mm', speed: '200mm/s', price: 'R$5.000 - R$7.000',
    priceRange: [5000, 7000], linearRails: false, autoLevel: true, directDrive: true, enclosure: false,
    multiColor: true, wifi: true, image: '/images/brands/prusa.png',
    pros: ['Open-source', 'Qualidade excepcional', 'Suporte Prusa excelente', 'Input shaper'],
    cons: ['Velocidade moderada', 'Sem câmara fechada', 'Preço alto para bed slinger'],
    bestFor: ['Entusiastas open-source', 'Qualidade consistente', 'Suporte premium'],
    level: 'intermediario',
  },
  {
    name: 'Voron 2.4', brand: 'Voron', type: 'fdm', architecture: 'CoreXY',
    firmware: 'Klipper', buildVolume: '350x350x350mm', speed: '500mm/s+', price: 'R$4.000 - R$10.000 (kit)',
    priceRange: [4000, 10000], linearRails: true, autoLevel: true, directDrive: true, enclosure: true,
    multiColor: false, wifi: true, image: '/images/brands/voron.png',
    pros: ['100% open-source', 'Customizável infinitamente', 'CoreXY + Klipper', 'Câmara fechada', 'Comunidade forte'],
    cons: ['Precisa montar (DIY)', 'Curva de aprendizado alta', 'Sem suporte oficial'],
    bestFor: ['Makers avançados', 'Quem gosta de montar', 'Customização total', 'Aprendizado profundo'],
    level: 'avancado',
  },
  {
    name: 'Anycubic Kobra 3', brand: 'Anycubic', type: 'fdm', architecture: 'CoreXY',
    firmware: 'Klipper', buildVolume: '250x250x260mm', speed: '600mm/s', price: 'R$2.500 - R$3.500',
    priceRange: [2500, 3500], linearRails: true, autoLevel: true, directDrive: true, enclosure: false,
    multiColor: true, wifi: true, image: '/images/brands/anycubic.png',
    pros: ['Multi-cor ACE Pro', 'Klipper nativo', 'Guias lineares', 'Bom custo-benefício'],
    cons: ['Marca menos consolidada', 'Sem câmara fechada', 'Suporte pode demorar'],
    bestFor: ['Multi-cor acessível', 'Velocidade alta', 'Custo-benefício'],
    level: 'intermediario',
  },
  {
    name: 'Elegoo Saturn 4 Ultra', brand: 'Elegoo', type: 'resina', architecture: 'MSLA (LCD)',
    firmware: 'Proprietário', buildVolume: '218x123x260mm', speed: '150mm/h (vertical)', price: 'R$3.000 - R$5.000',
    priceRange: [3000, 5000], linearRails: true, autoLevel: false, directDrive: false, enclosure: true,
    multiColor: false, wifi: true, image: '/images/brands/elegoo.png',
    pros: ['Resolução 12K', 'Detalhes incríveis', 'Tilt release', 'Wi-Fi', 'Volume bom para resina'],
    cons: ['Resina tóxica (usar luvas)', 'Pós-processamento obrigatório', 'Cheiro forte'],
    bestFor: ['Miniaturas', 'Joias', 'Odontologia', 'Peças de alta precisão'],
    level: 'intermediario',
  },
  {
    name: 'Anycubic Photon Mono M7 Pro', brand: 'Anycubic', type: 'resina', architecture: 'MSLA (LCD)',
    firmware: 'Proprietário', buildVolume: '222x126x230mm', speed: '170mm/h (vertical)', price: 'R$2.500 - R$4.000',
    priceRange: [2500, 4000], linearRails: true, autoLevel: false, directDrive: false, enclosure: true,
    multiColor: false, wifi: true, image: '/images/brands/anycubic.png',
    pros: ['14K resolução', 'Velocidade alta', 'Tela anti-aliasing', 'Bom preço'],
    cons: ['Resina tóxica', 'Pós-processamento', 'Volume médio'],
    bestFor: ['Miniaturas de RPG', 'Joalheria', 'Protótipos de precisão'],
    level: 'intermediario',
  },
  // ===== IMPRESSORAS DISPONÍVEIS NO SITE 3DKPRINT =====
  {
    name: 'Elegoo Centauri Carbon', brand: 'Elegoo', type: 'fdm', architecture: 'CoreXY',
    firmware: 'Klipper', buildVolume: '256x256x256mm', speed: '500mm/s', price: 'R$4.360,00 + frete',
    priceRange: [4360, 4360], linearRails: true, autoLevel: true, directDrive: true, enclosure: true,
    multiColor: false, wifi: true, image: '/images/brands/elegoo.png',
    pros: ['CoreXY de fibra de carbono', '500mm/s alta velocidade', 'Nivelamento automático', 'Impressão fora da caixa', 'Estrutura em carbono leve e rígida'],
    cons: ['Volume médio (256mm)', 'Sem multi-cor nativo', 'Marca ainda crescendo em FDM'],
    bestFor: ['Alta velocidade', 'Materiais de engenharia', 'Produção rápida', 'Usuários intermediários/avançados'],
    level: 'intermediario',
    availableOnSite: true,
    sitePrice: 'R$ 4.360,00 + frete',
    buyLink: '/orcamento',
  },
  {
    name: 'Sovol SV08', brand: 'Sovol', type: 'fdm', architecture: 'CoreXY (Voron 2.4)',
    firmware: 'Klipper', buildVolume: '350x350x350mm', speed: '700mm/s', price: 'R$6.800,00',
    priceRange: [6800, 6800], linearRails: true, autoLevel: true, directDrive: true, enclosure: false,
    multiColor: false, wifi: true, image: '/images/brands/sovol.png',
    pros: ['Voron 2.4 open-source', '700mm/s velocidade extrema', 'Grande volume 350³', 'Klipper nativo', 'Guias lineares em todos os eixos'],
    cons: ['Sem câmara fechada', 'Montagem pode ser complexa', 'Marca menos conhecida no Brasil'],
    bestFor: ['Makers avançados', 'Grandes volumes', 'Alta velocidade', 'Open-source'],
    level: 'avancado',
    availableOnSite: true,
    sitePrice: 'R$ 6.800,00',
    buyLink: '/orcamento',
  },
  {
    name: 'Sovol SV08 MAX', brand: 'Sovol', type: 'fdm', architecture: 'CoreXY (Voron 2.4)',
    firmware: 'Klipper', buildVolume: '500x500x500mm', speed: '700mm/s', price: 'R$15.000,00 + frete',
    priceRange: [15000, 15000], linearRails: true, autoLevel: true, directDrive: true, enclosure: false,
    multiColor: false, wifi: true, image: '/images/brands/sovol.png',
    pros: ['Volume GIGANTE 500³mm', '700mm/s velocidade', 'Voron 2.4 open-source', 'Klipper nativo', 'Ideal para peças industriais'],
    cons: ['Preço premium', 'Ocupa muito espaço', 'Sem câmara fechada', 'Peso elevado'],
    bestFor: ['Peças grandes industriais', 'Produção em série', 'Profissionais', 'Cosplay e props'],
    level: 'profissional',
    availableOnSite: true,
    sitePrice: 'R$ 15.000,00 + frete',
    buyLink: '/orcamento',
  },
  {
    name: 'Sovol Zero', brand: 'Sovol', type: 'fdm', architecture: 'CoreXY',
    firmware: 'Klipper', buildVolume: '235x235x250mm', speed: '1200mm/s', price: 'R$4.900,00',
    priceRange: [4900, 4900], linearRails: true, autoLevel: true, directDrive: true, enclosure: true,
    multiColor: false, wifi: true, image: '/images/brands/sovol.png',
    pros: ['1200mm/s velocidade ABSURDA', 'Eddy scan + pressão', 'Bocal 350°C', 'Cama 120°C', 'CoreXY compacta e rápida'],
    cons: ['Volume médio', 'Marca menos conhecida', 'Pode exigir ajustes finos'],
    bestFor: ['Velocidade extrema', 'Materiais de alta temperatura', 'Produção rápida', 'Entusiastas de performance'],
    level: 'avancado',
    availableOnSite: true,
    sitePrice: 'R$ 4.900,00',
    buyLink: '/orcamento',
  },
  {
    name: 'Elegoo Saturn 4 Ultra 12K', brand: 'Elegoo', type: 'resina', architecture: 'MSLA (LCD)',
    firmware: 'Proprietário', buildVolume: '218.88x122.88x220mm', speed: '150mm/h (vertical)', price: 'R$4.800,00 + frete',
    priceRange: [4800, 4800], linearRails: true, autoLevel: false, directDrive: false, enclosure: true,
    multiColor: false, wifi: true, image: '/images/brands/elegoo.png',
    pros: ['Resolução 12K profissional', 'Volume generoso para resina', 'Tilt release suave', 'Wi-Fi integrado', 'Detalhes incríveis'],
    cons: ['Resina tóxica', 'Pós-processamento obrigatório', 'Preço elevado'],
    bestFor: ['Miniaturas profissionais', 'Joalheria', 'Odontologia', 'Produção de figuras'],
    level: 'avancado',
    availableOnSite: true,
    sitePrice: 'R$ 4.800,00 + frete',
    buyLink: '/orcamento',
  },
  {
    name: 'Elegoo Saturn 4 Ultra 16K', brand: 'Elegoo', type: 'resina', architecture: 'MSLA (LCD)',
    firmware: 'Proprietário', buildVolume: '218.88x122.88x220mm', speed: '150mm/h (vertical)', price: 'R$5.900,00',
    priceRange: [5900, 5900], linearRails: true, autoLevel: false, directDrive: false, enclosure: true,
    multiColor: false, wifi: true, image: '/images/brands/elegoo.png',
    pros: ['Resolução 16K TOPO DE LINHA', 'Detalhes microscópicos', 'Volume bom', 'Tilt release', 'A melhor resolução do mercado'],
    cons: ['Preço premium', 'Resina tóxica', 'Pós-processamento extenso'],
    bestFor: ['Profissionais de resina', 'Joalheria de precisão', 'Odontologia', 'Detalhes extremos'],
    level: 'profissional',
    availableOnSite: true,
    sitePrice: 'R$ 5.900,00',
    buyLink: '/orcamento',
  },
  {
    name: 'Elegoo Saturn 3 Ultra 12K', brand: 'Elegoo', type: 'resina', architecture: 'MSLA (LCD)',
    firmware: 'Proprietário', buildVolume: '219x123x260mm', speed: '150mm/h (vertical)', price: 'R$3.700,00',
    priceRange: [3700, 3700], linearRails: true, autoLevel: false, directDrive: false, enclosure: true,
    multiColor: false, wifi: true, image: '/images/brands/elegoo.png',
    pros: ['12K resolução', 'Bom custo-benefício', 'Volume generoso', 'Tela 10 polegadas', 'Velocidade até 150mm/h'],
    cons: ['Geração anterior ao Saturn 4', 'Resina tóxica', 'Pós-processamento'],
    bestFor: ['Entrada no mundo da resina', 'Miniaturas', 'Custo-benefício em resina', 'Figuras e detalhes'],
    level: 'intermediario',
    availableOnSite: true,
    sitePrice: 'R$ 3.700,00',
    buyLink: '/orcamento',
  },
];

// ===== QUESTION FLOW =====
interface Question {
  id: string;
  text: string;
  options: { label: string; value: string; emoji: string; description?: string }[];
}

const questions: Question[] = [
  {
    id: 'experience',
    text: 'Qual é o seu nível de experiência com impressão 3D?',
    options: [
      { label: 'Nunca tive uma impressora', value: 'zero', emoji: '🆕', description: 'Quero começar do zero' },
      { label: 'Iniciante', value: 'iniciante', emoji: '🌱', description: 'Já sei o básico' },
      { label: 'Intermediário', value: 'intermediario', emoji: '⚡', description: 'Já imprimo regularmente' },
      { label: 'Avançado', value: 'avancado', emoji: '🔥', description: 'Quero o melhor do melhor' },
    ],
  },
  {
    id: 'business',
    text: 'Você pretende abrir um negócio com impressão 3D? Se sim, qual área?',
    options: [
      { label: 'Não, é para uso pessoal', value: 'pessoal', emoji: '🏠', description: 'Hobby, aprendizado ou projetos pessoais' },
      { label: 'Sim, peças personalizadas', value: 'pecas', emoji: '🔧', description: 'Capinhas, suportes, peças sob demanda' },
      { label: 'Sim, miniaturas e figuras', value: 'miniaturas', emoji: '🎭', description: 'RPG, colecionáveis, action figures' },
      { label: 'Sim, protótipos industriais', value: 'industrial', emoji: '🏭', description: 'Peças técnicas, encaixes, moldes' },
      { label: 'Sim, joias e acessórios', value: 'joias', emoji: '💎', description: 'Joalheria, bijuteria, acessórios de moda' },
      { label: 'Sim, outro tipo de negócio', value: 'outro', emoji: '💡', description: 'Educação, arquitetura, saúde, etc.' },
    ],
  },
  {
    id: 'purpose',
    text: 'Qual será o principal uso da impressora?',
    options: [
      { label: 'Hobby e decoração', value: 'hobby', emoji: '🎨', description: 'Peças decorativas, brinquedos, presentes' },
      { label: 'Protótipos funcionais', value: 'prototipo', emoji: '⚙️', description: 'Peças mecânicas, encaixes, testes' },
      { label: 'Miniaturas e detalhes', value: 'miniatura', emoji: '🎭', description: 'RPG, figuras, joias, alta resolução' },
      { label: 'Produção e venda', value: 'producao', emoji: '🏭', description: 'Produzir peças para vender' },
      { label: 'Educação e aprendizado', value: 'educacao', emoji: '📚', description: 'Escola, universidade, maker space' },
    ],
  },
  {
    id: 'budget',
    text: 'Qual é o seu orçamento aproximado?',
    options: [
      { label: 'Até R$ 1.500', value: 'low', emoji: '💰' },
      { label: 'R$ 1.500 - R$ 3.000', value: 'mid', emoji: '💰💰' },
      { label: 'R$ 3.000 - R$ 6.000', value: 'high', emoji: '💰💰💰' },
      { label: 'Acima de R$ 6.000', value: 'premium', emoji: '💎' },
    ],
  },
  {
    id: 'technology',
    text: 'Qual tecnologia te interessa mais?',
    options: [
      { label: 'FDM (Filamento)', value: 'fdm', emoji: '🖨️', description: 'Peças maiores, mais resistentes, mais materiais' },
      { label: 'Resina (SLA/DLP)', value: 'resina', emoji: '💧', description: 'Alta resolução, detalhes finos, miniaturas' },
      { label: 'Não sei, me ajude!', value: 'both', emoji: '🤔', description: 'Quero ver as duas opções' },
    ],
  },
  {
    id: 'features',
    text: 'Quais recursos são mais importantes para você?',
    options: [
      { label: 'Velocidade alta', value: 'speed', emoji: '🚀', description: 'Impressões rápidas, menos tempo de espera' },
      { label: 'Qualidade máxima', value: 'quality', emoji: '✨', description: 'Detalhes finos, acabamento perfeito' },
      { label: 'Multi-cor', value: 'multicolor', emoji: '🌈', description: 'Imprimir com várias cores automaticamente' },
      { label: 'Facilidade de uso', value: 'easy', emoji: '👌', description: 'Plug and play, sem complicação' },
      { label: 'Materiais avançados', value: 'materials', emoji: '🔬', description: 'ABS, Nylon, PC, Fibra de carbono' },
    ],
  },
];

// ===== RECOMMENDATION ENGINE =====
function getRecommendations(answers: Record<string, string>): Machine[] {
  let scored = machines.map(m => {
    let score = 0;

    // Experience match
    if (answers.experience === 'zero' || answers.experience === 'iniciante') {
      if (m.level === 'iniciante') score += 30;
      if (m.level === 'intermediario') score += 15;
      if (m.level === 'avancado') score -= 10;
    } else if (answers.experience === 'intermediario') {
      if (m.level === 'intermediario') score += 30;
      if (m.level === 'avancado') score += 20;
    } else if (answers.experience === 'avancado') {
      if (m.level === 'avancado') score += 30;
      if (m.level === 'profissional') score += 25;
    }

    // Business match
    if (answers.business === 'miniaturas' && m.type === 'resina') score += 20;
    if (answers.business === 'joias' && m.type === 'resina') score += 25;
    if (answers.business === 'industrial' && m.enclosure) score += 15;
    if (answers.business === 'pecas' && m.type === 'fdm') score += 15;
    if (answers.business !== 'pessoal') {
      if (m.availableOnSite) score += 10;
      if (m.level === 'avancado' || m.level === 'profissional') score += 10;
    }

    // Purpose match
    if (answers.purpose === 'miniatura' && m.type === 'resina') score += 25;
    if (answers.purpose === 'prototipo' && m.type === 'fdm') score += 15;
    if (answers.purpose === 'producao') {
      if (m.speed.includes('500') || m.speed.includes('600')) score += 20;
      if (m.enclosure) score += 10;
    }
    if (answers.purpose === 'hobby') {
      if (m.level === 'iniciante' || m.level === 'intermediario') score += 15;
    }

    // Budget match
    const [minP] = m.priceRange;
    if (answers.budget === 'low' && minP <= 1500) score += 25;
    else if (answers.budget === 'mid' && minP >= 1500 && minP <= 3000) score += 25;
    else if (answers.budget === 'high' && minP >= 3000 && minP <= 6000) score += 25;
    else if (answers.budget === 'premium' && minP >= 6000) score += 25;

    // Technology match
    if (answers.technology === 'fdm' && m.type === 'fdm') score += 20;
    if (answers.technology === 'resina' && m.type === 'resina') score += 20;
    if (answers.technology === 'both') score += 5;

    // Features match
    if (answers.features === 'speed' && (m.speed.includes('500') || m.speed.includes('600'))) score += 20;
    if (answers.features === 'quality' && m.type === 'resina') score += 15;
    if (answers.features === 'multicolor' && m.multiColor) score += 25;
    if (answers.features === 'easy' && (m.brand === 'Bambu Lab' || m.brand === 'Prusa')) score += 20;
    if (answers.features === 'materials' && m.enclosure) score += 20;

    // Bonus for linear rails and Klipper
    if (m.linearRails) score += 5;
    if (m.firmware === 'Klipper') score += 5;

    // BONUS GRANDE para impressoras disponíveis no site 3DKPRINT
    if (m.availableOnSite) score += 15;

    return { machine: m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  
  // Garantir que pelo menos 1 impressora do site apareça no top 3
  const top3 = scored.slice(0, 3).map(s => s.machine);
  const hasOnSite = top3.some(m => m.availableOnSite);
  if (!hasOnSite) {
    const bestOnSite = scored.find(s => s.machine.availableOnSite);
    if (bestOnSite) {
      top3[2] = bestOnSite.machine;
    }
  }
  return top3;
}

// ===== CHAT MESSAGE COMPONENT =====
function ChatMessage({ isBot, children, animate = true }: { isBot: boolean; children: React.ReactNode; animate?: boolean }) {
  const content = (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isBot ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>
      <div className={`max-w-[85%] ${isBot ? 'bg-white border border-slate-200 shadow-sm' : 'bg-blue-600 text-white'} rounded-2xl px-5 py-3.5`}>
        {children}
      </div>
    </div>
  );

  if (!animate) return content;
  return (
    <motion.div initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }}>
      {content}
    </motion.div>
  );
}

// ===== MACHINE CARD =====
function MachineCard({ machine, rank }: { machine: Machine; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const medals = ['🥇', '🥈', '🥉'];
  const levelColors: Record<string, string> = {
    iniciante: 'bg-green-100 text-green-700',
    intermediario: 'bg-blue-100 text-blue-700',
    avancado: 'bg-orange-100 text-orange-700',
    profissional: 'bg-purple-100 text-purple-700',
  };
  const levelLabels: Record<string, string> = {
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
    profissional: 'Profissional',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.15 }}
      className={`bg-white rounded-2xl border-2 ${rank === 0 ? 'border-blue-500 shadow-lg ring-2 ring-blue-100' : 'border-slate-200'} overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{medals[rank]}</span>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{machine.name}</h3>
              <p className="text-sm text-slate-500">{machine.brand} — {machine.architecture}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${levelColors[machine.level]}`}>
            {levelLabels[machine.level]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <Gauge className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Velocidade</p>
            <p className="text-sm font-bold text-slate-800">{machine.speed}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <Layers className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Volume</p>
            <p className="text-sm font-bold text-slate-800">{machine.buildVolume.split('mm')[0]}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <Cpu className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Firmware</p>
            <p className="text-sm font-bold text-slate-800">{machine.firmware.split(' ')[0]}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <DollarSign className="w-4 h-4 text-orange-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Preço</p>
            <p className="text-sm font-bold text-slate-800">{machine.price.split(' - ')[0]}</p>
          </div>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {machine.linearRails && <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">Guia Linear</span>}
          {machine.autoLevel && <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">Auto-nível</span>}
          {machine.directDrive && <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">Direct Drive</span>}
          {machine.enclosure && <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium">Câmara Fechada</span>}
          {machine.multiColor && <span className="text-xs bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full font-medium">Multi-cor</span>}
          {machine.wifi && <span className="text-xs bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full font-medium">Wi-Fi</span>}
        </div>

        <button type="button" onClick={() => setExpanded(!expanded)} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700">
          {expanded ? 'Ver menos' : 'Ver detalhes completos'} <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-4 overflow-hidden">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="font-bold text-green-800 text-sm mb-2">Vantagens</p>
                  <ul className="space-y-1.5">
                    {machine.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="font-bold text-red-800 text-sm mb-2">Desvantagens</p>
                  <ul className="space-y-1.5">
                    {machine.cons.map((con, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">✗</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="font-bold text-blue-800 text-sm mb-2">Ideal para</p>
                <div className="flex flex-wrap gap-2">
                  {machine.bestFor.map((use, i) => (
                    <span key={i} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">{use}</span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-slate-600 p-4 bg-slate-50 rounded-xl">
                <p><strong>Tipo:</strong> {machine.type === 'fdm' ? 'FDM (Filamento)' : 'Resina (MSLA)'}</p>
                <p><strong>Arquitetura:</strong> {machine.architecture}</p>
                <p><strong>Volume de impressão:</strong> {machine.buildVolume}</p>
                <p><strong>Preço estimado:</strong> {machine.price}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {machine.availableOnSite && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-2.5 text-sm font-bold flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Disponível no site 3DKPRINT — {machine.sitePrice}
          <a href={machine.buyLink || '/orcamento'} className="ml-2 underline hover:no-underline">Comprar agora</a>
        </div>
      )}
      {rank === 0 && !machine.availableOnSite && (
        <div className="bg-blue-600 text-white text-center py-2.5 text-sm font-bold">
          Melhor opção para o seu perfil
        </div>
      )}
      {rank === 0 && machine.availableOnSite && (
        <div className="bg-blue-600 text-white text-center py-2.5 text-sm font-bold">
          Melhor opção para o seu perfil
        </div>
      )}
    </motion.div>
  );
}

// ===== MAIN COMPONENT =====
export default function Consultor3D() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Machine[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const quizAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll suave DENTRO da área do quiz, sem descer para fora
    if (chatEndRef.current && quizAreaRef.current) {
      const quizRect = quizAreaRef.current.getBoundingClientRect();
      const endRect = chatEndRef.current.getBoundingClientRect();
      // Só faz scroll se o chatEnd estiver abaixo da viewport
      if (endRect.top > window.innerHeight) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentQuestion, showResults]);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => {
        const recs = getRecommendations(newAnswers);
        setRecommendations(recs);
        setShowResults(true);
      }, 500);
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setRecommendations([]);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Consultor Inteligente</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Encontre a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Impressora 3D Ideal</span>
            </h1>
            <p className="text-xl text-slate-300 mb-6">
              Responda algumas perguntas e nosso consultor inteligente vai recomendar as melhores impressoras 3D para o seu perfil, com comparativos detalhados.
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-2"><Target className="w-4 h-4 text-green-400" /> 5 perguntas rápidas</span>
              <span className="flex items-center gap-2"><Printer className="w-4 h-4 text-blue-400" /> 17+ máquinas no banco</span>
              <span className="flex items-center gap-2"><Bot className="w-4 h-4 text-purple-400" /> Recomendação inteligente</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chat Area */}
      <section ref={quizAreaRef} className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Progress + Respostas Fixas no Topo */}
            {!showResults && (
              <div className="sticky top-16 z-30 bg-slate-50 pb-4 pt-2 border-b border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Progresso</span>
                  <span className="text-sm font-bold text-blue-600">{Math.min(currentQuestion + 1, questions.length)}/{questions.length}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                  <motion.div className="bg-blue-600 h-2 rounded-full" animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
                {/* Respostas já selecionadas - fixas no topo */}
                {Object.keys(answers).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {questions.filter(q => answers[q.id]).map(q => {
                      const opt = q.options.find(o => o.value === answers[q.id]);
                      return opt ? (
                        <span key={q.id} className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full">
                          <span>{opt.emoji}</span> {opt.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-6">
              {/* Welcome */}
              <ChatMessage isBot animate={false}>
                <p className="text-slate-800 font-medium">Olá! Sou o Consultor 3D da 3DKPRINT. Vou te ajudar a encontrar a impressora 3D perfeita para você!</p>
                <p className="text-slate-500 text-sm mt-2">Responda {questions.length} perguntas rápidas e eu vou recomendar as melhores opções com comparativos detalhados.</p>
              </ChatMessage>

              {/* Answered questions */}
              {questions.slice(0, currentQuestion + 1).map((q, idx) => (
                <div key={q.id} className="space-y-4">
                  <ChatMessage isBot>
                    <p className="text-slate-800 font-medium">{q.text}</p>
                    {/* Dica contextual baseada na pergunta */}
                    {q.id === 'business' && (
                      <p className="text-xs text-slate-400 mt-1">Saber o tipo de negócio nos ajuda a recomendar a impressora ideal para o seu investimento.</p>
                    )}
                    {q.id === 'technology' && answers.business && answers.business !== 'pessoal' && (
                      <p className="text-xs text-blue-500 mt-1">Para negócios de {answers.business === 'joias' ? 'joalheria' : answers.business === 'miniaturas' ? 'miniaturas' : 'produção'}, recomendamos {answers.business === 'joias' || answers.business === 'miniaturas' ? 'Resina (SLA/DLP)' : 'FDM (Filamento)'}.</p>
                    )}
                  </ChatMessage>

                  {answers[q.id] ? (
                    <ChatMessage isBot={false}>
                      <p className="font-medium">
                        {q.options.find(o => o.value === answers[q.id])?.emoji}{' '}
                        {q.options.find(o => o.value === answers[q.id])?.label}
                      </p>
                    </ChatMessage>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((option) => (
                        <button key={option.value} type="button" onClick={() => handleAnswer(q.id, option.value)}
                          className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-left transition-all group">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.emoji}</span>
                            <div>
                              <p className="font-semibold text-slate-800 group-hover:text-blue-700">{option.label}</p>
                              {option.description && <p className="text-xs text-slate-500">{option.description}</p>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Results */}
              <AnimatePresence>
                {showResults && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <ChatMessage isBot>
                      <p className="text-slate-800 font-medium">Com base nas suas respostas, aqui estão as <strong>3 melhores impressoras 3D</strong> para o seu perfil:</p>
                    </ChatMessage>

                    <div className="ml-12 space-y-4">
                      {recommendations.map((machine, index) => (
                        <MachineCard key={machine.name} machine={machine} rank={index} />
                      ))}
                    </div>

                    <ChatMessage isBot>
                      <p className="text-slate-800 font-medium mb-3">Gostou das recomendações? Posso te ajudar com mais detalhes!</p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={restart} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                          <RotateCw className="w-4 h-4" /> Refazer consulta
                        </button>
                        <a href="/orcamento" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                          <Printer className="w-4 h-4" /> Fazer orçamento
                        </a>
                        <a href="https://wa.me/5543991741518?text=Olá! Usei o consultor 3D e gostaria de mais informações sobre impressoras." target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                          <ExternalLink className="w-4 h-4" /> Falar com especialista
                        </a>
                      </div>
                    </ChatMessage>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Entenda as diferenças entre as tecnologias</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Layers className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">FDM — Filamento</h3>
                <p className="text-slate-600 mb-4">Deposita filamento plástico fundido camada por camada. É a tecnologia mais popular e versátil.</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Resolução</span><span className="font-medium">50-300 microns</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Materiais</span><span className="font-medium">PLA, PETG, ABS, Nylon, TPU</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Volume típico</span><span className="font-medium">220x220x250mm+</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Preço</span><span className="font-medium">R$800 - R$12.000</span></div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm font-bold text-blue-800 mb-2">Guia Linear vs Rodinhas</p>
                  <p className="text-xs text-slate-600"><strong>Guia Linear:</strong> Trilhos metálicos de precisão. Menos vibração, mais velocidade, maior durabilidade. Presente em máquinas modernas como Bambu Lab e Voron.</p>
                  <p className="text-xs text-slate-600 mt-1"><strong>Rodinhas (V-Slot):</strong> Rodas de policarbonato em perfis de alumínio. Mais barato, mas desgasta com o tempo e limita a velocidade. Comum em Ender 3 antigas.</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Resina — SLA/DLP/LCD</h3>
                <p className="text-slate-600 mb-4">Cura resina líquida fotossensível com luz UV. Resolução extrema para detalhes microscópicos.</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Resolução</span><span className="font-medium">10-50 microns</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Materiais</span><span className="font-medium">Standard, ABS-Like, Clear, Flex</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Volume típico</span><span className="font-medium">218x123x260mm</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Preço</span><span className="font-medium">R$1.500 - R$8.000</span></div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-sm font-bold text-purple-800 mb-2">Klipper vs Marlin</p>
                  <p className="text-xs text-slate-600"><strong>Klipper:</strong> Firmware moderno que roda no Raspberry Pi. Input shaper, pressure advance, velocidades 3-5x maiores. Usado em Voron, Ender 3 V3.</p>
                  <p className="text-xs text-slate-600 mt-1"><strong>Marlin:</strong> Firmware clássico que roda na placa da impressora. Mais estável e simples, mas limitado em velocidade. Padrão em Ender 3, Prusa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
