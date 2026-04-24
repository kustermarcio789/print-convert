# Setup — Integração das impressoras 3D (Klipper/Moonraker)

Guia passo-a-passo pra ativar o controle remoto da SV08 (e futuras Voron/KP3S)
via site **3dkprint.com.br**. Zero custo extra, tudo nos serviços que você já usa.

Arquitetura em 1 linha: **o RPi da impressora envia status pro Supabase e puxa comandos de lá — o site nunca enxerga sua rede local.**

---

## 1) Rodar a migration SQL no Supabase

No dashboard do Supabase (https://supabase.com/dashboard → seu projeto):

1. Menu lateral → **SQL Editor** → **New query**
2. Cole o conteúdo de [`frontend/supabase_printer_integration.sql`](frontend/supabase_printer_integration.sql)
3. Rode (`Ctrl+Enter` ou botão RUN)

Isso cria 5 tabelas (`printer_devices`, `printer_telemetry`, `printer_commands`, `gcode_files`, `printer_print_jobs`) e o bucket `gcodes` no Storage.

---

## 2) Deploy das Edge Functions

As duas functions (`printer-telemetry` e `printer-commands`) são o endpoint que o agente chama.

Se já tem Supabase CLI instalado:
```bash
cd frontend
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy printer-telemetry
supabase functions deploy printer-commands
```

Se **não** tem o CLI: no dashboard do Supabase, menu **Edge Functions** → **Create a new function** → cole o conteúdo do `index.ts` de cada uma das pastas em `frontend/supabase/functions/printer-telemetry/` e `frontend/supabase/functions/printer-commands/`.

As functions já usam as env vars padrão `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` — não precisa configurar nada.

---

## 3) Cadastrar a SV08 no banco

No SQL Editor, rode:
```sql
INSERT INTO printer_devices (nome, marca, modelo, tipo, firmware_tipo, api_url)
VALUES ('Sovol SV08', 'Sovol', 'SV08', 'fdm', 'klipper', 'http://192.168.1.129:7125')
RETURNING id, agente_token;
```

Anote os dois valores que o Postgres retornar: `id` (UUID) e `agente_token` (hex). Vai usar no próximo passo.

---

## 4) Subir o agente no RPi da SV08

No RPi onde o Klipper roda (acesso SSH):

```bash
# Copie a pasta printer_agent pro RPi (via scp, git clone, ou qualquer método)
cd ~/printer_agent

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp config.example.json config.json
nano config.json
```

Edite o `config.json`:
```json
{
  "site_base_url": "https://SEU_PROJETO.supabase.co",
  "printers": [
    {
      "id": "UUID_QUE_VOCE_ANOTOU_NO_PASSO_3",
      "nome": "Sovol SV08",
      "api_url": "http://localhost:7125",
      "agente_token": "TOKEN_QUE_VOCE_ANOTOU_NO_PASSO_3"
    }
  ]
}
```

**Atenção ao `site_base_url`**: é o domínio do Supabase (algo tipo `https://abcxyz.supabase.co`), *não* o 3dkprint.com.br. Você encontra em: Supabase Dashboard → **Project Settings** → **API** → **Project URL**.

Teste rodando manualmente:
```bash
python agent.py
```

Se aparecer `Agente iniciado — 1 impressora(s) configurada(s).` e os logs não vêm com erro, está funcionando. Ctrl+C pra parar.

Instale como serviço:
```bash
sudo cp printer_agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now printer_agent
sudo systemctl status printer_agent
```

Ver logs ao vivo:
```bash
journalctl -u printer_agent -f
```

---

## 5) Verificar no site

1. Abra `https://www.3dkprint.com.br/admin/impressoras`
2. No topo da página deve aparecer uma seção **"Impressoras Conectadas"** com o card da SV08
3. O card atualiza a cada 5 segundos: estado, temperaturas, progresso
4. Botões disponíveis: Pausar / Retomar / Cancelar / Home / Emergency Stop / Enviar GCODE & Imprimir

Se aparecer "offline" no card mesmo com o RPi ligado:
- `journalctl -u printer_agent -n 50` — veja erros do agente
- Confirme que o Moonraker responde: `curl http://localhost:7125/printer/info`
- Confirme que o token e o ID estão corretos no `config.json`

---

## 6) Adicionar as outras impressoras (Voron, KP3S)

Quando essas saírem de manutenção, basta:
1. INSERT novo em `printer_devices` (passo 3)
2. Adicionar mais uma entrada na lista `printers` do `config.json` do agente
3. Restart: `sudo systemctl restart printer_agent`

O mesmo agente cuida de todas (já suporta múltiplas impressoras no array).

Pra Saturno (resina), vamos fazer uma **Fase 2** separada com um adapter pra API Chitu — a arquitetura base está pronta pra receber isso.

---

## Segurança — o que é bom saber

- A impressora nunca é exposta na internet. O RPi só **inicia** conexões saindo.
- Cada impressora tem seu próprio `agente_token` (hex 24 bytes). Pode rotacionar a qualquer momento com:
  ```sql
  UPDATE printer_devices SET agente_token = encode(gen_random_bytes(24), 'hex') WHERE id = '...';
  ```
  (depois atualize o `config.json` do agente e reinicie.)
- O comando `gcode_raw` permite executar gcode arbitrário — por padrão desabilitado no UI, só pode ser disparado via SQL insert direto ou quando você construir um terminal avançado.
- Uploads de `.gcode` vão pro bucket privado `gcodes` do Storage. O agente recebe URLs assinadas (2h de validade) pra baixar.

---

## Se algo quebrar — rollback

Se precisar remover tudo e voltar ao estado anterior:
```sql
DROP TABLE IF EXISTS printer_print_jobs CASCADE;
DROP TABLE IF EXISTS printer_commands CASCADE;
DROP TABLE IF EXISTS printer_telemetry CASCADE;
DROP TABLE IF EXISTS gcode_files CASCADE;
DROP TABLE IF EXISTS printer_devices CASCADE;
DELETE FROM storage.buckets WHERE id = 'gcodes';
```

E no frontend, basta remover a linha `<PainelImpressorasConectadas />` do `AdminImpressoras.tsx`.
