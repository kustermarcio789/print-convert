'''
import { supabase } from "./supabase";

// Interface atualizada para corresponder à tabela 'products' do Supabase
export interface Product {
  id: string;
  name: string;
  brand: string;
  category_id: string | null;
  category_name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  images: string[];
  modelo_3d?: string;
  specifications: Record<string, any>;
  tags: string[];
  featured: boolean;
  active: boolean;
  rating: number;
  reviews: number;
  created_at: string;
  updated_at: string;
  min_stock: number;
  cost_price: number;
  unit: string;
}

/**
 * Obter produto por ID do Supabase
 */
export const getProductById = async (id: string): Promise<Product | undefined> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar produto por ID do Supabase:", error);
    return undefined;
  }
  return data as Product;
};

/**
 * Obter todos os produtos ativos do Supabase
 */
export const getActiveProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true);

  if (error) {
    console.error("Erro ao buscar produtos ativos do Supabase:", error);
    return [];
  }
  return data as Product[];
};

/**
 * Obter produtos por marca do Supabase
 */
export const getProductsByBrand = async (brand: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("brand", brand)
    .eq("active", true);

  if (error) {
    console.error("Erro ao buscar produtos por marca do Supabase:", error);
    return [];
  }
  return data as Product[];
};

/**
 * Obter produtos por categoria do Supabase
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_name", category.toUpperCase())
    .eq("active", true);

  if (error) {
    console.error("Erro ao buscar produtos por categoria do Supabase:", error);
    return [];
  }
  return data as Product[];
};

/**
 * Obter todas as marcas únicas do Supabase
 */
export const getBrands = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("brand")
    .eq("active", true);

  if (error) {
    console.error("Erro ao buscar marcas do Supabase:", error);
    return [];
  }
  const brands = new Set(data.map((p) => p.brand));
  return Array.from(brands).sort();
};

/**
 * Obter contagem de produtos por marca do Supabase
 */
export const getProductCountByBrand = async (brand: string): Promise<number> => {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand", brand)
    .eq("active", true);

  if (error) {
    console.error("Erro ao buscar contagem de produtos por marca do Supabase:", error);
    return 0;
  }
  return count || 0;
};

/**
 * Obter produtos relacionados (mesma marca ou categoria) do Supabase
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

export const getRelatedProducts = async (productId: string, limit: number = 3): Promise<Product[]> => {
  const product = await getProductById(productId);
  if (!product) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .neq("id", productId)
    .or(`brand.eq.${product.brand},category_name.eq.${product.category_name}`)
    .eq("active", true)
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar produtos relacionados do Supabase:", error);
    return [];
  }
  return data as Product[];
};
'''
