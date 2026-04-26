# Integração 3DKPRINT × Impressoras 3D (Klipper)

Documento técnico consolidando toda a integração entre o site
**3dkprint.com.br** e as impressoras 3D rodando Klipper, construída em sessão única.

> **Cliente piloto:** Sovol SV08 (firmware Klipper + Moonraker, host Sovol SPI-XI 2.3.3 Bullseye, IP local `192.168.1.129`)

---

## 1. Visão geral da arquitetura

```
┌──────────────────────┐    HTTPS POST     ┌─────────────────────────┐
│ Você (qualquer rede) │──────────────────▶│  3dkprint.com.br        │
│ celular / PC / etc.  │                    │  (Netlify + Cloudflare) │
└──────────────────────┘                    └────────────┬────────────┘
                                                         │ Supabase JS
                                                         ▼
                                            ┌─────────────────────────┐
                                            │  Supabase (eu-central)   │
                                            │  • Postgres (tabelas)    │
                                            │  • Storage (gcodes/cam)  │
                                            │  • Edge Functions (Deno) │
                                            └────────────┬────────────┘
                                                         │ HTTPS pull/push
                                                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  RPi da SV08 (~/print-convert + cloudflared) — sempre ligado       │
│                                                                    │
│  ┌──────────────────────┐   ┌──────────────────────────────┐      │
│  │ printer_agent        │──▶│ Klipper + Moonraker (:7125)  │      │
│  │ (Python systemd)     │   └──────────────────────────────┘      │
│  └──────────────────────┘                                          │
│  ┌──────────────────────┐                                          │
│  │ cloudflared          │──── tunnel HTTPS                         │
│  │ (systemd service)    │     pra cam.3dkprint.com.br              │
│  └──────────────────────┘                                          │
└────────────────────────────────────────────────────────────────────┘
                                                         ▲
                                                         │ HTTPS embed
                                                  ┌──────┴──────┐
                                                  │ Cloudflare  │
                                                  │ Tunnel CDN  │
                                                  └─────────────┘
```

**Princípio chave:** o agente e o cloudflared só **iniciam** conexões saindo
da rede local. A impressora **nunca fica exposta** publicamente. Acesso de fora
passa por Supabase (controle/telemetria) ou Cloudflare Tunnel (stream da câmera).

---

## 2. Onde tudo está hospedado

| Componente | Plataforma | Plano | URL/Console |
|---|---|---|---|
| **Site (frontend)** | Netlify | Free | https://www.3dkprint.com.br · projeto `benevolent-seahorse-dbf71d` |
| **DNS do domínio** | Cloudflare | Free | https://dash.cloudflare.com — zone `3dkprint.com.br` |
| **Banco + Storage + Edge Functions** | Supabase | Free | https://supabase.com/dashboard/project/eobysswnimpwehclcwmo |
| **Domínio `3dkprint.com.br`** | Registro.br | ~R$ 40/ano | https://registro.br/painel · usuário `JMKAZ3` |
| **Tunnel pra câmera** | Cloudflare Zero Trust | Free | tunnel `printer-3dk` (id `d65fd78e-3c39-4081-a334-932e12a3cd43`) |
| **Repositório** | GitHub | Free | https://github.com/kustermarcio789/print-convert |

### Nameservers ativos (Cloudflare)
```
perla.ns.cloudflare.com
pranab.ns.cloudflare.com
```

### Registros DNS preservados (importados do Vercel-DNS antigo)
- `A *.3dkprint.com.br` → `64.29.17.65`, `216.198.79.65` (Netlify)
- `A 3dkprint.com.br` → `64.29.17.65`, `216.198.79.1`
- `A www` → `64.29.17.1`, `216.198.79.1`
- `CAA` × 3 (Sectigo, pki.goog, Let's Encrypt — autorizam emissão de SSL)
- `CNAME _domainconnect`

---

## 3. Componentes implementados

### 3.1 Agente Python (`printer_agent/agent.py`)

Daemon de ~600 linhas rodando no RPi como **serviço systemd**
(`printer_agent.service`). Faz:

- **Telemetria** (a cada 5s): coleta status do Moonraker via
  `/printer/objects/query?print_stats,display_status,extruder,heater_bed,toolhead,virtual_sdcard,idle_timeout,pause_resume,webhooks,gcode_move,fan,motion_report`
  e POSTa em `/functions/v1/printer-telemetry`.
- **Comandos pendentes** (a cada 3s): pega da fila, executa via Moonraker,
  reporta resultado via PATCH em `/functions/v1/printer-commands`.
- **Eventos de job**: detecta transições printing→standby/error e POSTa
  em `/functions/v1/printer-job` (cria/finaliza linhas em `printer_print_jobs`).
- **Auto-discovery de webcam**: busca em `/server/webcams/list` na primeira
  inicialização.
- **Snapshots opcionais**: se `snapshot_interval > 0`, captura JPEG e
  POSTa pra `/functions/v1/printer-snapshot`.

**31 handlers de comando suportados:**

| Categoria | Comandos |
|---|---|
| Print control | `print_file`, `pause`, `resume`, `cancel`, `emergency_stop` |
| Movimento | `home`, `jog`, `baby_step` |
| Temperatura | `set_temp_extruder`, `set_temp_bed` |
| Filamento | `load_filament`, `unload_filament` |
| Macros & GCODE | `gcode_raw`, `run_macro`, `list_macros` |
| Sistema | `firmware_restart`, `klipper_restart`, `klipper_save_config`, `system_info` |
| Config | `read_config`, `save_config` |
| Webcam | `capture_snapshot` |
| Arquivos da SD | `list_gcodes`, `delete_gcode`, `start_print_local` |
| Sliders ao vivo | `set_velocity_factor`, `set_extrude_factor`, `set_fan` |
| Calibração | `get_bed_mesh`, `set_pressure_advance`, `set_velocity_limits` |

### 3.2 Edge Functions (Supabase Deno)

Em `frontend/supabase/functions/`:

| Function | Método | Uso | Auth |
|---|---|---|---|
| `printer-telemetry` | POST | Agente envia status atual da impressora (upsert em `printer_telemetry` por `printer_id`) | Bearer = `printer_devices.agente_token` |
| `printer-commands` | GET / PATCH | GET retorna pendentes (e marca `in_progress`); PATCH agente reporta done/failed + result | Bearer agente |
| `printer-job` | POST | Início/fim de job (cria/atualiza `printer_print_jobs`) | Bearer agente |
| `printer-snapshot` | POST | Recebe JPEG base64, salva no bucket `webcam`, registra em `printer_snapshots` (mantém últimos 50) | Bearer agente |

### 3.3 Frontend (React/TypeScript)

**Página dedicada**: `/admin/impressoras/:id` — painel full-screen estilo
Mainsail com 3 colunas:

- **Esquerda**: Câmera (stream HTTPS público se Cloudflare ativo, ou
  snapshot sob demanda + links pro Mainsail local/público), Job atual com
  barra de progresso, Temperaturas Bico+Mesa com input + presets + Off
- **Centro**: Movimento (Home All/X/Y/Z + jog cross 0.1/1/10/100mm),
  Sliders ao vivo (Velocidade %, Extrusão %, Fan % — só durante print),
  Z baby step com offset atual visível
- **Direita**: Arquivos da SD com Play/Delete inline, Macros customizadas
  + Carregar/Descarregar filamento, Console GCODE com histórico

**Modal "Detalhes & Análise"** (acessado por botão secundário) — 11 abas
pra coisas avançadas:

1. Histórico de jobs (sucesso/falha automaticamente do agente)
2. Manutenção (CRUD de manutenções com custo + horas paradas)
3. Precificação (custo/hora, custo/kg filamento, margem, calculadora ao vivo)
4. Webcam (snapshot atual + Mainsail link)
5. Macros (CRUD com gcode multi-linha)
6. Bed Mesh (visualização colorida da malha + perfis salvos + calibrar)
7. Tuning (Pressure Advance, limites de velocidade, SAVE_CONFIG)
8. Sistema (CPU temp/uso, RAM, OS, lista de services systemd)
9. printer.cfg editor (lê via agente, edita, salva com FIRMWARE_RESTART opcional)
10. Arquivos (lista completa de gcodes da SD com filtros)
11. Fila (manual queue de prints)

**Listagem em `/admin/impressoras`**: cards compactos com bolinha de
status, telemetria ao vivo + botão "Abrir painel completo" (azul) e
botão "Histórico, manutenção, ROI" (modal).

**ROI Dashboard** abaixo dos cards (view `printer_kpis`): tabela
agregando jobs OK/falha, taxa de sucesso, horas impressas vs paradas,
custo de manutenção, custo/hora real.

---

## 4. Tabelas no Postgres (Supabase)

| Tabela | Descrição | Migrations |
|---|---|---|
| `printer_devices` | Cadastro das impressoras (nome, marca, IP, agente_token, valor compra, URLs públicas) | v1, v4 |
| `printer_telemetry` | Estado atual de cada impressora (1 linha por printer_id, upsert pelo agente) | v1, v3 |
| `printer_commands` | Fila + histórico de comandos (status: pending → in_progress → done/failed, com `result` JSONB) | v1, v2, v3, v5 |
| `printer_print_jobs` | Histórico automático de prints (status, duração, filamento, motivo de falha) | v1, v3 |
| `printer_maintenance_logs` | Manutenções (tipo, custo, horas paradas, técnico) | v3 |
| `printer_pricing` | Custo/hora + custo/kg + margem por máquina | v3 |
| `printer_macros` | CRUD de macros customizadas | v3 |
| `printer_snapshots` | Snapshots da webcam (path no bucket `webcam`) | v3 |
| `printer_print_queue` | Fila ordenada de prints | v5 |
| `gcode_files` | Metadados de gcodes uploaded (path no bucket `gcodes`) | v1 |
| **View `printer_kpis`** | KPIs agregados pra ROI dashboard | v3 |

### Buckets do Storage
- `gcodes` (privado) — uploads de .gcode pra impressão remota, signed URLs de 2h
- `webcam` (público) — snapshots da câmera

### Migrations aplicadas (em ordem)
1. `frontend/supabase_printer_integration.sql` (v1)
2. `frontend/supabase_printer_v2.sql` (CHECK ampliado pros novos comandos)
3. `frontend/supabase_printer_v3.sql` (manutenção, pricing, macros, snapshots, KPIs)
4. `frontend/supabase_printer_v4.sql` (campos `public_base_url` e `webcam_public_url` em devices)
5. `frontend/supabase_printer_v5.sql` (printer_print_queue + 11 comandos novos)

---

## 5. Layout dos arquivos no repositório

```
print-convert/
├── printer_agent/                          ← Roda no RPi
│   ├── agent.py                              (~600 linhas, daemon principal)
│   ├── config.example.json                   (template)
│   ├── config.json                           (no RPi: token + IP + URLs)
│   ├── requirements.txt                      (apenas requests)
│   ├── printer_agent.service                 (template systemd)
│   └── README.md
│
├── frontend/
│   ├── supabase/
│   │   ├── functions/
│   │   │   ├── printer-telemetry/index.ts
│   │   │   ├── printer-commands/index.ts
│   │   │   ├── printer-job/index.ts
│   │   │   └── printer-snapshot/index.ts
│   │   └── (functions deployadas via npx supabase functions deploy)
│   │
│   ├── supabase_printer_integration.sql    (v1)
│   ├── supabase_printer_v2.sql
│   ├── supabase_printer_v3.sql
│   ├── supabase_printer_v4.sql
│   ├── supabase_printer_v5.sql
│   │
│   └── src/
│       ├── lib/
│       │   └── printerControl.ts            (helpers + tipos do frontend)
│       ├── components/admin/impressora/
│       │   ├── PainelImpressorasConectadas.tsx  (lista de cards)
│       │   ├── PrinterLiveCard.tsx              (card compacto)
│       │   ├── PrinterAdvancedControls.tsx      (modal antigo, ainda existe)
│       │   ├── PrinterDetailModal.tsx           (modal 11 abas)
│       │   ├── UploadGcodeDialog.tsx            (upload + imprimir)
│       │   └── ROIDashboard.tsx                 (tabela KPIs)
│       └── pages/admin/
│           ├── AdminImpressoras.tsx             (listagem, /admin/impressoras)
│           └── AdminImpressoraPainel.tsx        (painel dedicado, /admin/impressoras/:id)
│
└── INTEGRACAO_IMPRESSORA_3D.md              (este arquivo)
```

---

## 6. Endereços importantes pro dia a dia

### Painel admin
- Listagem: https://www.3dkprint.com.br/admin/impressoras
- Painel SV08: https://www.3dkprint.com.br/admin/impressoras/dddfa35a-eaba-4532-aca9-9e270bc1ee8d

### Mainsail nativo (Klipper)
- Local (rede de casa): http://192.168.1.129/
- Público (após Cloudflare ativar): https://cam.3dkprint.com.br

### SSH no RPi da SV08
```bash
ssh sovol@192.168.1.129
# senha: sovol
```

### Logs
```bash
journalctl -u printer_agent -f       # agente
journalctl -u cloudflared -f         # tunnel
sudo systemctl status printer_agent  # status
sudo systemctl status cloudflared
sudo systemctl status moonraker
```

---

## 7. Como adicionar uma nova impressora

### Cenário: cadastrar Voron 2.4 (IP `192.168.1.130`)

**1) Criar no banco** (SQL Editor do Supabase):
```sql
INSERT INTO printer_devices (nome, marca, modelo, tipo, firmware_tipo, api_url)
VALUES ('Voron 2.4 460', 'Voron Design', '2.4 460x460', 'fdm', 'klipper',
        'http://192.168.1.130:7125')
RETURNING id, agente_token;
```

**2) Adicionar ao `config.json` do agente** (no RPi onde o agente já roda):
```bash
ssh sovol@192.168.1.129
nano ~/print-convert/printer_agent/config.json
```
Acrescenta no array `"printers"`:
```json
{
  "id": "UUID_RETORNADO_NO_SQL",
  "nome": "Voron 2.4 460",
  "api_url": "http://192.168.1.130:7125",
  "agente_token": "TOKEN_RETORNADO_NO_SQL"
}
```

**3) Reiniciar agente:**
```bash
sudo systemctl restart printer_agent
```

**4) Acessa o painel** — a Voron já aparece na listagem.

---

## 8. Rodar o agente num NOVO computador (mini-PC Linux, futuro)

```bash
# 1. Clona o repo
git clone https://github.com/kustermarcio789/print-convert.git
cd print-convert/printer_agent

# 2. Instala dependências
sudo apt install -y python3 python3-pip
pip3 install requests

# 3. Cria config.json (cola o JSON de configuração)
nano config.json

# 4. Testa rodando manual
python3 agent.py
# ✓ se aparecer "Agente iniciado", Ctrl+C e instala como serviço

# 5. Cria serviço systemd
sudo tee /etc/systemd/system/printer_agent.service > /dev/null <<'EOF'
[Unit]
Description=3dkprint - Agente de impressora
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=USUARIO_DO_SEU_LINUX
WorkingDirectory=/home/USUARIO/print-convert/printer_agent
ExecStart=/usr/bin/python3 /home/USUARIO/print-convert/printer_agent/agent.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now printer_agent
sudo systemctl status printer_agent
```

⚠️ **Apenas 1 agente por impressora ativa.** Se rodar 2 simultaneamente,
vão duplicar telemetria e brigar pelos comandos.

---

## 9. Cloudflare Tunnel (câmera ao vivo de qualquer lugar)

### Estado atual
- **Tunnel `printer-3dk`** criado (id `d65fd78e-3c39-4081-a334-932e12a3cd43`)
- **`cloudflared`** rodando 24/7 no RPi como systemd
- **4 conexões ativas** com data centers Cloudflare em São Paulo
  (gru11, gru13, gru19) — latência mínima
- **Domínio `3dkprint.com.br`** já está no DNS Cloudflare (nameservers
  trocados no Registro.br)

### Pendente: ativar Public Hostname
Quando o Cloudflare detectar a propagação DNS (geralmente <1h), vai mandar
email pra `3dk.print.br@gmail.com` confirmando "Your domain is now active
on Cloudflare". Aí basta:

1. Dashboard Cloudflare → Networks → Connectors → `printer-3dk` → aba
   **Published application routes** → **Add a published application route**
2. Subdomain: `cam` · Domain: `3dkprint.com.br` · Service: `HTTP localhost:80`
3. Salvar
4. Atualizar `printer_devices.public_base_url` = `https://cam.3dkprint.com.br`
   (pelo painel: aba Webcam → "⚙ Configurar acesso remoto")
5. Stream ao vivo aparece embedded no painel automaticamente

### Comando útil (verificar tunnel)
```bash
# No RPi
sudo systemctl status cloudflared
journalctl -u cloudflared -n 20
```

---

## 10. Troubleshooting comum

| Sintoma | Causa provável | Solução |
|---|---|---|
| Card mostra "Offline" | Agente parado ou RPi desligado | `ssh sovol@... && sudo systemctl restart printer_agent` |
| Comandos não chegam na impressora | Klipper desconectou (Klippy_state ≠ ready) | Aba Tuning → FIRMWARE_RESTART, ou no Mainsail "Restart" |
| Telemetria com timeout 5s | Klipper travado num G-code longo | Aumenta `MOONRAKER_TIMEOUT` no `agent.py` (atualmente 5s) |
| "list_gcodes": permission denied | Token invalidado | Pega novo token: `SELECT agente_token FROM printer_devices WHERE id='...'` e atualiza `config.json` |
| Stream remoto quebra | `cloudflared` parou | `sudo systemctl restart cloudflared` |
| Snapshot antigo no painel | Auto-snapshot desativado (`snapshot_interval: 0`) | Clica em "Capturar foto agora" no painel |
| 503 nas Edge Functions | Cold start do Deno | Esperar ~10s e tentar de novo |

---

## 11. Histórico de versões / commits relevantes

| Commit | O que entregou |
|---|---|
| inicial | Infra base: tabelas, edge functions telemetry/commands, agente, painel |
| `aab94a0` | Qualidade do PDF (não é parte deste doc) |
| `c3d7cca` | Auto-discovery de webcam pelo agente via `/server/webcams/list` |
| `38cd1bc` | Stream remoto via Cloudflare Tunnel + DB v4 |
| `499bd33` | Fase H: arquivos da SD, fila de prints, sliders ao vivo, sistema |
| `36a6b0a` | Fase I: Bed Mesh visualization + Tuning (PA, limites) |
| `6309a73` | Painel dedicado `/admin/impressoras/:id` (estilo Mainsail) |

---

## 12. Próximos passos planejados

- [ ] **Cloudflare ativar `3dkprint.com.br`** → ativar `cam.3dkprint.com.br` Public Hostname
- [ ] **Auto-execução da fila**: quando print termina, agente pega próximo da
  `printer_print_queue` automaticamente
- [ ] **Visualizador 3D do GCODE** (preview da peça antes de imprimir)
- [ ] **Cloudflare Access** com email auth na URL `cam.3dkprint.com.br`
  (proteção extra)
- [ ] **Migrar agente** do RPi da SV08 pra um mini-PC Linux dedicado quando
  você tiver
- [ ] **Cadastrar Voron 2.4, KP3S, Saturno** quando saírem da manutenção
  (Saturno é resina/Chitu — precisa adapter separado, não-Klipper)

---

## 13. Custos atuais (recorrentes)

| Item | Mensal |
|---|---|
| Netlify (site) | R$ 0 |
| Supabase (DB + Storage + Functions) | R$ 0 |
| Cloudflare (DNS + Tunnel + Zero Trust Free) | R$ 0 |
| Domínio `3dkprint.com.br` | ~R$ 3,50 (R$ 40/ano) |
| Energia do RPi 24/7 (~3W) | ~R$ 0,80 |
| **TOTAL** | **~R$ 4,30/mês** |

---

_Documento gerado a partir da sessão de implementação 25-26/04/2026._
