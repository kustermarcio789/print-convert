export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  modelo3D?: string;
  specifications: { [key: string]: string };
  tags: string[];
  featured: boolean;
  active: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  rating?: number;
  reviews?: number;
}

// Lista de produtos arquivados (vazia para limpeza)
export const archivedProducts: Product[] = [];

// Lista de produtos iniciais (vazia para limpeza)
export const initialProducts: Product[] = [];

// Funções para gerenciar produtos no localStorage
const PRODUCTS_KEY = 'produtos_site';

export function getProducts(): Product[] {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Erro ao ler produtos do localStorage:', e);
      return initialProducts;
    }
  }
  // Se não houver produtos salvos, inicializar com lista vazia
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

export function duplicateProduct(id: string): Product | null {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (product) {
    const newProduct = {
      ...product,
      id: `prod_${Date.now()}`,
      name: `${product.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    saveProducts(products);
    return newProduct;
  }
  return null;
}
