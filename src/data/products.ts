export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: 'bestseller' | 'fast' | 'premium';
  category: string;
  material: string;
  description?: string;
  stock?: number;
  active?: boolean;
  featured?: boolean;
  model3d?: string;
}

// Produtos iniciais do site
export const archivedProducts: Product[] = [
  {
    id: '1',
    name: 'Suporte de Headset Premium',
    price: 89.90,
    originalPrice: 119.90,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 47,
    badge: 'bestseller',
    category: 'Acessórios',
    material: 'PETG',
    description: 'Suporte premium para headset com design ergonômico',
    stock: 15,
    active: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Vaso Geométrico Moderno',
    price: 59.90,
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 32,
    badge: 'fast',
    category: 'Decoração',
    material: 'PLA',
    description: 'Vaso decorativo com design geométrico moderno',
    stock: 20,
    active: true,
    featured: false,
  },
  {
    id: '3',
    name: 'Action Figure Personalizado',
    price: 249.90,
    image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 18,
    badge: 'premium',
    category: 'Colecionáveis',
    material: 'Resina',
    description: 'Action figure personalizado em resina de alta qualidade',
    stock: 5,
    active: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Organizador de Mesa',
    price: 79.90,
    originalPrice: 99.90,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 56,
    category: 'Organização',
    material: 'PLA',
    description: 'Organizador de mesa com compartimentos múltiplos',
    stock: 25,
    active: true,
    featured: false,
  },
  {
    id: '5',
    name: 'Luminária Low Poly',
    price: 149.90,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 23,
    badge: 'bestseller',
    category: 'Decoração',
    material: 'PLA',
    description: 'Luminária decorativa com design low poly',
    stock: 10,
    active: true,
    featured: true,
  },
  {
    id: '6',
    name: 'Protótipo Industrial',
    price: 399.90,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 8,
    category: 'Protótipos',
    material: 'ABS',
    description: 'Protótipo industrial de alta precisão',
    stock: 3,
    active: true,
    featured: false,
  },
  {
    id: '7',
    name: 'Porta-Celular Articulado',
    price: 39.90,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 89,
    badge: 'fast',
    category: 'Acessórios',
    material: 'PETG',
    description: 'Porta-celular com articulação ajustável',
    stock: 30,
    active: true,
    featured: false,
  },
  {
    id: '8',
    name: 'Estatueta Dragão',
    price: 189.90,
    image: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 12,
    badge: 'premium',
    category: 'Colecionáveis',
    material: 'Resina',
    description: 'Estatueta de dragão em resina com detalhes incríveis',
    stock: 7,
    active: true,
    featured: true,
  },
  {
    id: '9',
    name: 'PEI Magnética Ender 3',
    price: 89.90,
    originalPrice: 119.90,
    image: '/images/products/pei-magnetico.jpg',
    rating: 4.8,
    reviews: 32,
    badge: 'bestseller',
    category: 'Peças de Impressora 3D',
    material: 'PEI',
    description: 'Mesa PEI magnética compatível com Ender 3',
    stock: 18,
    active: true,
    featured: true,
  },
  {
    id: '10',
    name: 'Hotend All Metal CR-10',
    price: 149.90,
    image: '/images/products/hotend-all-metal.png',
    rating: 4.9,
    reviews: 18,
    category: 'Peças de Impressora 3D',
    material: 'Metal',
    description: 'Hotend all metal para impressora CR-10',
    stock: 12,
    active: true,
    featured: false,
  },
  {
    id: '11',
    name: 'Kit Correias GT2 6mm',
    price: 29.90,
    image: '/images/products/correia-gt2.jpg',
    rating: 4.7,
    reviews: 45,
    category: 'Peças de Impressora 3D',
    material: 'Borracha',
    description: 'Kit completo de correias GT2 6mm',
    stock: 40,
    active: true,
    featured: false,
  },
  {
    id: '12',
    name: 'Motor Nema 17 42-40',
    price: 59.90,
    image: '/images/products/motor-nema17.jpg',
    rating: 4.6,
    reviews: 22,
    category: 'Peças de Impressora 3D',
    material: 'Metal',
    description: 'Motor de passo Nema 17 para impressoras 3D',
    stock: 22,
    active: true,
    featured: false,
    

 
  
},
];
export const initialProducts: Product[] = [];

// Funções para gerenciar produtos no localStorage
const PRODUCTS_KEY = 'produtos_site';

export function getProducts(): Product[] {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Se não houver produtos salvos, inicializar com produtos padrão
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
  return initialProducts;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Product): void {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

export function updateProduct(id: string, updates: Partial<Product>): void {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveProducts(products);
  }
}

export function deleteProduct(id: string): void {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  saveProducts(filtered);
}

export function duplicateProduct(id: string): void {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (product) {
    const newProduct = {
      ...product,
      id: `${Date.now()}`,
      name: `${product.name} (Cópia)`,
    };
    products.push(newProduct);
    saveProducts(products);
  }
}
