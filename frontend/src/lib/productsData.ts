import { supabase } from "./supabase";

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

// ==================== FUNÇÕES DO SUPABASE (ÚNICA FONTE) ====================

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) return data as Product;
  } catch (e) {
    console.log("Erro ao buscar produto:", e);
  }
  return undefined;
};

export const getActiveProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true);
    if (!error && data) return data as Product[];
  } catch (e) {
    console.log("Erro ao buscar produtos:", e);
  }
  return [];
};

export const getProductsByBrand = async (brand: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("brand", brand)
      .eq("active", true);
    if (!error && data) return data as Product[];
  } catch (e) {
    console.log("Erro ao buscar por marca:", e);
  }
  return [];
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("category_name", category)
      .eq("active", true);
    if (!error && data) return data as Product[];
  } catch (e) {
    console.log("Erro ao buscar por categoria:", e);
  }
  return [];
};

export const getBrands = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("brand")
      .eq("active", true);
    if (!error && data) {
      return Array.from(new Set(data.map((p: any) => p.brand))).sort();
    }
  } catch (e) {
    console.log("Erro ao buscar marcas:", e);
  }
  return [];
};

export const getProductCountByBrand = async (brand: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .ilike("brand", brand)
      .eq("active", true);
    if (!error && count !== null) return count;
  } catch (e) {}
  return 0;
};

export const getProductCountsByBrand = async (): Promise<{ brand: string; count: number }[]> => {
  const brands = await getBrands();
  const counts = await Promise.all(
    brands.map(async (brand) => ({ brand, count: await getProductCountByBrand(brand) }))
  );
  return counts.sort((a, b) => b.count - a.count);
};

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
    if (!error && data) return data as Product[];
  } catch (e) {}
  return [];
};
