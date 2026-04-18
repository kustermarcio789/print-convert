# Setup — Orçamentos v2 (multi-produto + fotos)

Passos para ativar a nova tela de orçamentos. **Rode na ordem.**

---

## 1. Criar bucket no Supabase Storage

No painel do Supabase → **Storage** → **New bucket**:

| Campo | Valor |
|---|---|
| Name | `orcamento-imagens` |
| Public | ✅ **Sim (habilitado)** |
| File size limit | `10 MB` |
| Allowed MIME types | `image/*` |

Depois que criar, vá em **Policies** desse bucket e cole:

```sql
-- Permite upload apenas de usuários autenticados
CREATE POLICY "orcamento_imagens_upload_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'orcamento-imagens');

-- Permite ler publicamente (porque o PDF/e-mail precisa mostrar)
CREATE POLICY "orcamento_imagens_read_public"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'orcamento-imagens');

-- Permite deletar apenas autenticados
CREATE POLICY "orcamento_imagens_delete_authenticated"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'orcamento-imagens');
```

---

## 2. Atualizar tabela `orcamentos`

No painel do Supabase → **SQL Editor** → New query, cole e rode:

```sql
-- Adiciona colunas novas (seguro: IF NOT EXISTS)
ALTER TABLE orcamentos
  ADD COLUMN IF NOT EXISTS numero         TEXT,
  ADD COLUMN IF NOT EXISTS cliente_tipo   TEXT DEFAULT 'PF',
  ADD COLUMN IF NOT EXISTS cliente_nome   TEXT,
  ADD COLUMN IF NOT EXISTS cliente_email  TEXT,
  ADD COLUMN IF NOT EXISTS cliente_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS cliente_telefone TEXT,
  ADD COLUMN IF NOT EXISTS cliente_cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS endereco       JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS envio          JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS itens          JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS subtotal       NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto_percentual NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto_valor NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_total    NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS validade_dias  INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS observacoes_cliente TEXT,
  ADD COLUMN IF NOT EXISTS observacoes_internas TEXT,
  ADD COLUMN IF NOT EXISTS origem         TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- Index pra busca
CREATE INDEX IF NOT EXISTS idx_orcamentos_status    ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_created   ON orcamentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente   ON orcamentos(cliente_nome);

-- Gera numero automático tipo ORC-2026-0001
CREATE SEQUENCE IF NOT EXISTS orcamento_numero_seq;

CREATE OR REPLACE FUNCTION gerar_numero_orcamento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero IS NULL THEN
    NEW.numero := 'ORC-' || EXTRACT(YEAR FROM NOW())::text || '-' ||
                  LPAD(nextval('orcamento_numero_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orcamento_numero ON orcamentos;
CREATE TRIGGER trg_orcamento_numero
  BEFORE INSERT ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION gerar_numero_orcamento();

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orcamento_updated ON orcamentos;
CREATE TRIGGER trg_orcamento_updated
  BEFORE UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
```

> **Observação:** os itens do orçamento ficam no campo `itens JSONB`. Fica mais simples do que uma tabela separada e atende o volume atual. Se no futuro passar de algumas dezenas de milhares de orçamentos ou precisar fazer relatórios complexos por item, dá pra migrar pra tabela `orcamento_itens` depois sem mexer na UI.

---

## 3. Testar o fluxo

1. Rode `npm run dev` na pasta `frontend/`
2. Acesse `http://localhost:5173/admin/orcamentos`
3. Clique **"Novo Orçamento"**
4. Preencha o wizard (Cliente → Itens → Envio → Total)
5. Experimente:
   - Adicionar 2+ itens — 1 do catálogo, 1 manual
   - Fazer upload de foto em cada item
   - Preencher CEP e clicar na lupa (deve buscar via ViaCEP)
   - Ver subtotal recalculando em tempo real
6. Salvar e verificar na lista se o orçamento aparece com **miniatura da foto** e **badge "2 itens"**
7. Testar cada ação: **Baixar PDF**, **WhatsApp**, **E-mail**, **Copiar mensagem**

---

## 4. Deploy

```bash
cd frontend
npm run build
git push origin orcamentos-v2
```

Abra PR no GitHub: `orcamentos-v2` → `main`.

---

## 5. Pendências conhecidas (não bloqueiam uso)

- **Token Melhor Envio vazou** (`frontend/src/lib/melhorEnvio.ts:6`) — rotacionar e mover pro backend. Chip de tarefa foi aberto no Claude.
- **E-mail** — o endpoint `/api/send-orcamento-email` já recebe `itens[]` como array. Se o backend ainda espera o formato antigo (com `descricao`/`material` no root), atualizar template do backend pra iterar a lista de itens e incluir as imagens.
- **PDF** — funciona standalone com jsPDF. Para imagens, depende de o bucket estar público (passo 1 acima).
- **Editor de orçamento** (`AdminOrcamentoEditor.tsx`) — ainda usa shape antigo. Se precisar editar orçamentos v2 criados agora, dá pra atualizar depois; por ora, recria.
