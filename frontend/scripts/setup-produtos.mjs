#!/usr/bin/env node
/**
 * Importa o catalogoEstatico do frontend/src/lib/productStore.ts
 * para a tabela `products` do Supabase.
 *
 * Rode com:
 *   SUPABASE_URL="https://eobysswnimpwehclcwmo.supabase.co" \
 *   SUPABASE_SECRET="sb_secret_..." \
 *   node scripts/setup-produtos.mjs
 *
 * Primeiro cole o SQL abaixo no SQL Editor do Supabase pra criar a tabela:
 *
 *   CREATE TABLE IF NOT EXISTS products (
 *     id             TEXT PRIMARY KEY,
 *     name           TEXT NOT NULL,
 *     brand          TEXT,
 *     category_name  TEXT,
 *     description    TEXT,
 *     specifications JSONB DEFAULT '{}'::jsonb,
 *     price          NUMERIC(12,2) DEFAULT 0,
 *     cost_price     NUMERIC(12,2),
 *     stock          INTEGER DEFAULT 0,
 *     active         BOOLEAN DEFAULT true,
 *     featured       BOOLEAN DEFAULT false,
 *     images         JSONB DEFAULT '[]'::jsonb,
 *     modelo_3d      TEXT,
 *     created_at     TIMESTAMPTZ DEFAULT NOW(),
 *     updated_at     TIMESTAMPTZ DEFAULT NOW()
 *   );
 *
 *   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
 *   DROP POLICY IF EXISTS "products_select" ON products;
 *   CREATE POLICY "products_select" ON products FOR SELECT USING (true);
 *   DROP POLICY IF EXISTS "products_all"    ON products;
 *   CREATE POLICY "products_all"    ON products FOR ALL USING (true) WITH CHECK (true);
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET;
if (!url || !key) {
  console.error('faltando SUPABASE_URL/SUPABASE_SECRET');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const productStorePath = resolve(__dirname, '../src/lib/productStore.ts');
const content = readFileSync(productStorePath, 'utf-8');

// Extrai o array catalogoEstatico: do primeiro `[` após a declaração até o `];` fechador
const marker = 'const catalogoEstatico: Product[] = [';
const start = content.indexOf(marker);
if (start < 0) throw new Error('catalogoEstatico não encontrado');
const arrStart = start + marker.length - 1;
// Avança com controle de balanceamento (ingênuo) ignorando strings
let depth = 0;
let i = arrStart;
let inStr = false;
let strCh = '';
for (; i < content.length; i++) {
  const c = content[i];
  if (inStr) {
    if (c === '\\') { i++; continue; }
    if (c === strCh) inStr = false;
    continue;
  }
  if (c === "'" || c === '"' || c === '`') { inStr = true; strCh = c; continue; }
  if (c === '[') depth++;
  else if (c === ']') { depth--; if (depth === 0) break; }
}
const arrText = content.slice(arrStart, i + 1);

// Avalia o array como JS (é código válido)
const produtos = eval(arrText);
console.log(`Encontrados ${produtos.length} produtos no catálogo estático`);

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = produtos.map((p) => ({
  id: p.id,
  name: p.nome,
  brand: p.marca || null,
  category_name: p.categoria || null,
  description: p.descricao || null,
  specifications: {
    tipo: p.tipo,
    velocidade: p.velocidade,
    volume: p.volume,
    resolucao: p.resolucao,
    firmware: p.firmware,
    base: p.base,
    garantia: p.garantia,
    suporte: p.suporte,
    envio: p.envio,
    badge: p.badge,
    specs: p.specs,
  },
  price: p.preco || 0,
  stock: p.estoque ?? 0,
  active: p.ativo !== false,
  featured: !!p.destaque,
  images: p.imagens && p.imagens.length ? p.imagens : (p.imagem ? [p.imagem] : []),
  modelo_3d: p.modelo3d || null,
}));

console.log(`Inserindo/atualizando ${rows.length} linhas...`);
const { data, error } = await db.from('products').upsert(rows, { onConflict: 'id' }).select('id,name');
if (error) {
  console.error('Falhou:', error);
  process.exit(1);
}
console.log(`✓ ${data.length} produto(s) no Supabase:`);
data.forEach((r) => console.log('  -', r.name));
