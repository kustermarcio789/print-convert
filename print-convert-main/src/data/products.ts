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

export const products: Product[] = [];
