#!/usr/bin/env node
/**
 * Migração Orçamentos v2 — setup automatizado
 *
 * Rode com:
 *   SUPABASE_URL="https://SEU-PROJETO.supabase.co" \
 *   SUPABASE_SECRET="sb_secret_..." \
 *   node scripts/setup-orcamentos-v2.mjs
 *
 * Ou via argumentos:
 *   node scripts/setup-orcamentos-v2.mjs --url https://... --key sb_secret_...
 *
 * O que o script faz (tudo idempotente — pode rodar várias vezes):
 *   1. Cria o bucket "orcamento-imagens" (se ainda não existe)
 *   2. Aplica as policies de Storage (INSERT, SELECT, DELETE)
 *   3. Adiciona colunas novas na tabela "orcamentos"
 *   4. Cria triggers de numero automático + updated_at
 *   5. Cria índices para busca
 *   6. Verifica se tudo subiu
 */

import { createClient } from '@supabase/supabase-js';
import { argv, env, exit } from 'node:process';

function arg(name) {
  const i = argv.findIndex((a) => a === `--${name}`);
  return i >= 0 ? argv[i + 1] : null;
}

const SUPABASE_URL = env.SUPABASE_URL || arg('url');
const SUPABASE_SECRET = env.SUPABASE_SECRET || arg('key');

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error('❌ Faltando SUPABASE_URL e/ou SUPABASE_SECRET');
  console.error('\nUso:');
  console.error('  SUPABASE_URL="https://SEU.supabase.co" SUPABASE_SECRET="sb_secret_..." \\');
  console.error('    node scripts/setup-orcamentos-v2.mjs');
  exit(1);
}

if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(SUPABASE_URL)) {
  console.error(`❌ URL inválida: "${SUPABASE_URL}"`);
  console.error('   Esperado algo como: https://xxxxxxxxxx.supabase.co');
  exit(1);
}

if (!SUPABASE_SECRET.startsWith('sb_secret_') && !SUPABASE_SECRET.startsWith('eyJ')) {
  console.error(`⚠️  Chave parece não ser uma secret key (deveria começar com "sb_secret_" ou "eyJ")`);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SECRET, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = 'orcamento-imagens';

const SQL_MIGRATION = `
-- 1. Colunas novas na tabela orcamentos (IF NOT EXISTS = idempotente)
ALTER TABLE orcamentos
  ADD COLUMN IF NOT EXISTS numero           TEXT,
  ADD COLUMN IF NOT EXISTS cliente_tipo     TEXT DEFAULT 'PF',
  ADD COLUMN IF NOT EXISTS cliente_nome     TEXT,
  ADD COLUMN IF NOT EXISTS cliente_email    TEXT,
  ADD COLUMN IF NOT EXISTS cliente_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS cliente_telefone TEXT,
  ADD COLUMN IF NOT EXISTS cliente_cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS endereco         JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS envio            JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS itens            JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS subtotal         NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto_percentual NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto_valor   NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_total      NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS validade_dias    INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS observacoes_cliente  TEXT,
  ADD COLUMN IF NOT EXISTS observacoes_internas TEXT,
  ADD COLUMN IF NOT EXISTS origem           TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT NOW();

-- 2. Índices de busca
CREATE INDEX IF NOT EXISTS idx_orcamentos_status  ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_created ON orcamentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente ON orcamentos(cliente_nome);

-- 3. Sequência e função de numeração ORC-YYYY-00001
CREATE SEQUENCE IF NOT EXISTS orcamento_numero_seq;

CREATE OR REPLACE FUNCTION gerar_numero_orcamento()
RETURNS TRIGGER AS $f$
BEGIN
  IF NEW.numero IS NULL OR NEW.numero = '' THEN
    NEW.numero := 'ORC-' || EXTRACT(YEAR FROM NOW())::text || '-' ||
                  LPAD(nextval('orcamento_numero_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$f$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orcamento_numero ON orcamentos;
CREATE TRIGGER trg_orcamento_numero
  BEFORE INSERT ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION gerar_numero_orcamento();

-- 4. Trigger de updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $f$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$f$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orcamento_updated ON orcamentos;
CREATE TRIGGER trg_orcamento_updated
  BEFORE UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
`;

const SQL_STORAGE_POLICIES = `
-- Permitir upload por autenticados
DROP POLICY IF EXISTS "orcamento_imagens_upload" ON storage.objects;
CREATE POLICY "orcamento_imagens_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = '${BUCKET}');

-- Leitura pública (PDF/email precisam)
DROP POLICY IF EXISTS "orcamento_imagens_read" ON storage.objects;
CREATE POLICY "orcamento_imagens_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = '${BUCKET}');

-- Delete apenas autenticados
DROP POLICY IF EXISTS "orcamento_imagens_delete" ON storage.objects;
CREATE POLICY "orcamento_imagens_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = '${BUCKET}');
`;

async function ensureBucket() {
  console.log(`\n📦 Verificando bucket "${BUCKET}"...`);
  const { data: existing, error: listErr } = await admin.storage.listBuckets();
  if (listErr) throw new Error(`listBuckets: ${listErr.message}`);

  const found = existing?.find((b) => b.name === BUCKET);
  if (found) {
    console.log(`   ✓ Bucket já existe (public=${found.public})`);
    if (!found.public) {
      const { error } = await admin.storage.updateBucket(BUCKET, { public: true });
      if (error) console.warn(`   ⚠ Falhou tornar público: ${error.message}`);
      else console.log(`   ✓ Marcado como público`);
    }
    return;
  }

  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'],
  });
  if (error) throw new Error(`createBucket: ${error.message}`);
  console.log(`   ✓ Bucket criado (público, 10MB, apenas imagens)`);
}

async function runSql(label, sql) {
  console.log(`\n🗄  ${label}...`);
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SECRET,
      Authorization: `Bearer ${SUPABASE_SECRET}`,
    },
    body: JSON.stringify({ sql_query: sql }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    if (body.includes('Could not find the function') || resp.status === 404) {
      throw new Error('FN_EXEC_SQL_MISSING');
    }
    throw new Error(`SQL falhou (${resp.status}): ${body.slice(0, 300)}`);
  }
  console.log(`   ✓ OK`);
}

async function bootstrapExecSql() {
  console.log(`\n🔧 Criando função auxiliar exec_sql (primeira vez)...`);
  const bootstrap = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
    RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
    BEGIN EXECUTE sql_query; END;
    $$;
    REVOKE ALL ON FUNCTION public.exec_sql(text) FROM anon, authenticated, public;
  `;
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SECRET,
      Authorization: `Bearer ${SUPABASE_SECRET}`,
      'Content-Type': 'application/x-ndjson',
    },
    body: bootstrap,
  });

  if (!resp.ok) {
    console.warn('   ⚠ Não consegui criar via REST. Tentando via Management API...');
    throw new Error('BOOTSTRAP_REST_FAILED');
  }
}

async function verificar() {
  console.log(`\n🔍 Verificação final...`);
  const { data: rows, error } = await admin
    .from('orcamentos')
    .select('id,numero,cliente_nome,itens,valor_total')
    .limit(1);
  if (error) {
    console.log(`   ⚠ Erro ao ler orçamentos: ${error.message}`);
    return;
  }
  console.log(`   ✓ Tabela orcamentos acessível com colunas novas (${rows?.length ?? 0} registro(s) de exemplo)`);

  const { data: buckets } = await admin.storage.listBuckets();
  const b = buckets?.find((x) => x.name === BUCKET);
  console.log(`   ✓ Bucket ${BUCKET}: ${b ? (b.public ? 'público' : 'privado') : 'NÃO ENCONTRADO'}`);
}

async function main() {
  console.log(`\n🎯 Setup Orçamentos v2`);
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Key: ${SUPABASE_SECRET.slice(0, 15)}...${SUPABASE_SECRET.slice(-4)}`);

  await ensureBucket();

  try {
    await runSql('Aplicando migration de colunas', SQL_MIGRATION);
    await runSql('Aplicando policies do Storage', SQL_STORAGE_POLICIES);
  } catch (err) {
    if (err.message === 'FN_EXEC_SQL_MISSING') {
      console.log(`\n⚠  Função exec_sql não existe no projeto — preciso criar antes.`);
      console.log(`   Cole e rode este SQL no Dashboard → SQL Editor, depois rode este script de novo:\n`);
      console.log(`   CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)`);
      console.log(`   RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$`);
      console.log(`   BEGIN EXECUTE sql_query; END;`);
      console.log(`   $$;\n`);
      console.log(`   Alternativa: cole direto os blocos SQL que aparecem no SETUP_ORCAMENTOS_V2.md.`);
      exit(2);
    }
    throw err;
  }

  await verificar();
  console.log(`\n✅ Pronto! Pode testar em http://localhost:3000/admin/orcamentos\n`);
}

main().catch((err) => {
  console.error(`\n❌ Falhou: ${err.message}`);
  if (err.stack) console.error(err.stack.split('\n').slice(1, 4).join('\n'));
  exit(1);
});
