import { supabase } from "./supabase";

// Interface para produtos
export interface Product {
  id: string;
  name: string;
  brand: string;
  category_id?: string | null;
  category_name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  images: string[];
  modelo_3d?: string;
  specifications: Record<string, any>;
  tags?: string[];
  featured: boolean;
  active: boolean;
  rating?: number;
  reviews?: number;
  created_at?: string;
  updated_at?: string;
  min_stock?: number;
  cost_price?: number;
  unit?: string;
}

// Catálogo base local (fallback quando Supabase não tem dados)
const localCatalog: Product[] = [
  {
    id: 'elegoo-centauri',
    name: 'Elegoo Centauri Carbon',
    brand: 'Elegoo',
    category_name: 'FDM',
    description: 'Impressora 3D de carbono CoreXY com impressão de alta velocidade e nivelamento automático. Ideal para makers e profissionais que buscam qualidade e velocidade.',
    price: 4360,
    stock: 3,
    images: ['/images/printers/elegoo-centauri.png'],
    featured: true,
    active: true,
    specifications: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'CoreXY',
      'Velocidade Máxima': '500 mm/s',
      'Volume de Impressão': '256×256×256mm',
      'Resolução de Camada': '0.05-0.35mm',
      'Diâmetro do Bico': '0.4mm (padrão)',
      'Temperatura do Bico': 'até 300°C',
      'Temperatura da Mesa': 'até 110°C',
      'Nivelamento': 'Automático',
      'Conectividade': 'WiFi, USB, SD Card',
    }
  },
  {
    id: 'elegoo-orangestorm-giga',
    name: 'Elegoo OrangeStorm Giga',
    brand: 'Elegoo',
    category_name: 'FDM',
    description: 'Impressora 3D FDM de nível industrial com volume gigante de 800×800×1000mm. Ideal para peças de grande escala e produção profissional.',
    price: 18900,
    stock: 1,
    images: ['/images/printers/elegoo-orangestorm-giga.png'],
    featured: true,
    active: true,
    specifications: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'Cartesiana',
      'Velocidade Máxima': '300 mm/s',
      'Volume de Impressão': '800×800×1000mm',
      'Resolução de Camada': '0.1-0.4mm',
      'Estrutura': 'Alumínio industrial',
    }
  },
  {
    id: 'sovol-sv08',
    name: 'Sovol SV08',
    brand: 'Sovol',
    category_name: 'FDM',
    description: 'CoreXY de código aberto Voron 2.4 com impressão de alta velocidade. Perfeita para entusiastas que valorizam open source.',
    price: 6800,
    stock: 2,
    images: ['/images/printers/sovol-sv08.png'],
    featured: false,
    active: true,
    specifications: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'CoreXY (Voron 2.4)',
      'Velocidade Máxima': '700 mm/s',
      'Volume de Impressão': '350×350×350mm',
      'Open Source': 'Sim (Klipper)',
    }
  },
  {
    id: 'sovol-sv08-max',
    name: 'Sovol SV08 MAX',
    brand: 'Sovol',
    category_name: 'FDM',
    description: 'CoreXY de código aberto Voron 2.4 com volume de construção profissional. A maior da linha SV08.',
    price: 15000,
    stock: 1,
    images: ['/images/printers/sovol-sv08-max.png'],
    featured: true,
    active: true,
    specifications: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'CoreXY (Voron 2.4)',
      'Velocidade Máxima': '700 mm/s',
      'Volume de Impressão': '500×500×500mm',
      'Open Source': 'Sim (Klipper)',
      'Nivelamento': 'Automático com Eddy',
      'Conectividade': 'WiFi, Ethernet',
    }
  },
  {
    id: 'elegoo-saturn4-ultra-12k',
    name: 'Elegoo Saturn 4 Ultra 12K',
    brand: 'Elegoo',
    category_name: 'Resina',
    description: 'Impressora 3D de resina profissional SLA com resolução 12K. Ideal para miniaturas e peças com detalhes extremos.',
    price: 4800,
    stock: 2,
    images: ['/images/printers/elegoo-saturn4-ultra-12k.png'],
    featured: true,
    active: true,
    specifications: {
      'Tecnologia': 'MSLA (Resina)',
      'Resolução': '12K (11520×5120)',
      'Velocidade de Cura': '150 mm/h',
      'Volume de Impressão': '218.88×122.88×220mm',
      'Tamanho do Pixel': '19μm',
      'Sistema de Inclinação': 'Sim',
      'Câmera IA': 'Sim',
    }
  },
  {
    id: 'elegoo-saturn4-ultra-16k',
    name: 'Elegoo Saturn 4 Ultra 16K',
    brand: 'Elegoo',
    category_name: 'Resina',
    description: 'Impressora 3D de resina profissional SLA com resolução 16K - máxima qualidade. O topo da linha Saturn.',
    price: 5900,
    stock: 1,
    images: ['/images/printers/elegoo-saturn4-ultra-16k.png'],
    featured: true,
    active: true,
    specifications: {
      'Tecnologia': 'MSLA (Resina)',
      'Resolução': '16K (15360×8640)',
      'Velocidade de Cura': '150 mm/h',
      'Volume de Impressão': '218.88×122.88×220mm',
      'Tamanho do Pixel': '14μm',
      'Sistema de Inclinação': 'Sim',
      'Câmera IA': 'Sim',
    }
  },
  {
    id: 'sovol-zero',
    name: 'Sovol Zero',
    brand: 'Sovol',
    category_name: 'FDM',
    description: 'CoreXY ultra-rápida com digitalização Eddy, detecção de pressão, bocal 350°C. Uma das mais rápidas do mercado.',
    price: 4900,
    stock: 2,
    images: ['/images/printers/sovol-zero.png'],
    featured: true,
    active: true,
    specifications: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'CoreXY',
      'Velocidade Máxima': '1200 mm/s',
      'Aceleração': '25000 mm/s²',
      'Volume de Impressão': '235×235×250mm',
      'Temperatura do Bico': 'até 350°C',
      'Sensores': 'Eddy, Pressão',
    }
  },
  {
    id: 'elegoo-mars5-ultra',
    name: 'Elegoo Mars 5 Ultra 9K',
    brand: 'Elegoo',
    category_name: 'Resina',
    description: 'Resina compacta 9K ideal para iniciantes. Tecnologia de inclinação, câmera IA e impressão via WiFi.',
    price: 2900,
    stock: 3,
    images: ['/images/products/mars-5-ultra-9k.jpg'],
    featured: false,
    active: true,
    specifications: {
      'Tecnologia': 'MSLA (Resina)',
      'Resolução': '9K',
      'Velocidade de Cura': '150 mm/h',
      'Volume de Impressão': '153.36×77.76×165mm',
      'Conectividade': 'WiFi',
      'Câmera IA': 'Sim',
    }
  },
  {
    id: 'elegoo-saturn3-ultra-12k',
    name: 'Elegoo Saturn 3 Ultra 12K',
    brand: 'Elegoo',
    category_name: 'Resina',
    description: 'Mono MSLA 12K com LCD de 10 polegadas e alta velocidade de impressão. Excelente custo-benefício.',
    price: 3700,
    stock: 3,
    images: ['/images/printers/elegoo-saturn3-ultra.png'],
    featured: false,
    active: true,
    specifications: {
      'Tecnologia': 'MSLA (Resina)',
      'Resolução': '12K',
      'LCD': '10 polegadas',
      'Velocidade de Cura': '150 mm/h',
      'Volume de Impressão': '219×123×260mm',
    }
  },
];

/**
 * Obter produto por ID - tenta Supabase primeiro, depois catálogo local
 */
export const getProductById = async (id: string): Promise<Product | undefined> => {
  // Primeiro tenta buscar do Supabase
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      return data as Product;
    }
  } catch (e) {
    console.log("Supabase não disponível, usando catálogo local");
  }

  // Fallback para catálogo local
  return localCatalog.find(p => p.id === id);
};

/**
 * Obter todos os produtos ativos
 */
export const getActiveProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true);

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch (e) {
    console.log("Supabase não disponível, usando catálogo local");
  }

  return localCatalog.filter(p => p.active);
};

/**
 * Obter produtos por marca
 */
export const getProductsByBrand = async (brand: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("brand", brand)
      .eq("active", true);

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch (e) {
    console.log("Supabase não disponível, usando catálogo local");
  }

  return localCatalog.filter(p => p.brand.toLowerCase() === brand.toLowerCase() && p.active);
};

/**
 * Obter produtos por categoria
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_name", category.toUpperCase())
      .eq("active", true);

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch (e) {
    console.log("Supabase não disponível, usando catálogo local");
  }

  return localCatalog.filter(p => p.category_name.toUpperCase() === category.toUpperCase() && p.active);
};

/**
 * Obter todas as marcas únicas
 */
export const getBrands = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("brand")
      .eq("active", true);

    if (!error && data && data.length > 0) {
      const brands = new Set(data.map((p) => p.brand));
      return Array.from(brands).sort();
    }
  } catch (e) {
    console.log("Supabase não disponível, usando catálogo local");
  }

  const brands = new Set(localCatalog.filter(p => p.active).map(p => p.brand));
  return Array.from(brands).sort();
};

/**
 * Obter contagem de produtos por marca
 */
export const getProductCountByBrand = async (brand: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("brand", brand)
      .eq("active", true);

    if (!error && count !== null) {
      return count;
    }
  } catch (e) {
    console.log("Supabase não disponível, usando catálogo local");
  }

  return localCatalog.filter(p => p.brand.toLowerCase() === brand.toLowerCase() && p.active).length;
};

/**
 * Obter contagem de produtos por marca (todas as marcas)
 */
export const getProductCountsByBrand = async (): Promise<{ brand: string; count: number }[]> => {
  const brands = await getBrands();
  const counts = await Promise.all(
    brands.map(async (brand) => ({
      brand,
      count: await getProductCountByBrand(brand),
    }))
  );
  return counts.sort((a, b) => b.count - a.count);
};

/**
 * Obter produtos relacionados (mesma marca ou categoria)
 */
export const getRelatedProducts = async (productId: string, limit: number = 3): Promise<Product[]> => {
  const product = await getProductById(productId);
  if (!product) return [];

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .neq("id", productId)
      .or(`brand.eq.${product.brand},category_name.eq.${product.category_name}`)
      .eq("active", true)
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch (e) {
    console.log("Supabase não disponível, usando catálogo local");
  }

  return localCatalog
    .filter(p => p.id !== productId && p.active && (p.brand === product.brand || p.category_name === product.category_name))
    .slice(0, limit);
};
