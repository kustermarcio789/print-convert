# Setup — Cloudflare Tunnel pra ver câmera ao vivo de qualquer lugar

Cloudflare Tunnel cria um endereço HTTPS público fixo (tipo `https://printer1.cfargotunnel.com`)
que aponta pra sua impressora local **sem expor IP público, sem mexer no roteador, sem custo**.
Funciona pra qualquer rede onde você esteja — celular 4G, escritório, qualquer wifi.

Tempo total: ~10-15 minutos.

---

## Passo 1 — Conta Cloudflare gratuita (2 min)

1. Acessa https://dash.cloudflare.com/sign-up
2. Cria conta com email/senha (gratuita, sem cartão)
3. Pula a etapa de "adicionar site" — não precisa adicionar o `3dkprint.com.br` lá

---

## Passo 2 — Criar o tunnel no painel Cloudflare (5 min)

1. No dashboard Cloudflare, menu lateral → **Zero Trust**
2. (Se aparecer "Choose a plan", escolhe **Free** — pula a tela do cartão clicando em "Skip" no fim)
3. Menu → **Networks** → **Tunnels** → **Create a tunnel**
4. Tipo: **Cloudflared** → Next
5. Nome do tunnel: `printer-3dk` (ou qualquer nome)
6. Save

Vai aparecer uma tela com um **comando de instalação**. Copie o comando inteiro (vai ser tipo `cloudflared service install eyJhI...TOKEN_GIGANTE...`).

**Não feche essa aba** — vamos voltar nela.

---

## Passo 3 — Instalar cloudflared no RPi do Klipper (5 min)

SSH no RPi (`ssh pi@192.168.1.129` ou similar):

```bash
# Detecta arquitetura (provavelmente arm64 no RPi 3/4/5)
ARCH=$(dpkg --print-architecture)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb
sudo dpkg -i cloudflared-linux-${ARCH}.deb

# Cola aqui o comando que o Cloudflare te deu na tela do passo 2
sudo cloudflared service install eyJhI...TOKEN_GIGANTE...
```

Confirma que ficou rodando:
```bash
sudo systemctl status cloudflared
```
Status deve ser `active (running)` em verde.

---

## Passo 4 — Apontar uma rota pública pro Mainsail (3 min)

Volta na tela do Cloudflare onde estava (Tunnel → Configure):

1. Aba **Public Hostname** → **Add a public hostname**
2. **Subdomain**: `printer1` (ou o nome que quiser)
3. **Domain**: deixa o `cfargotunnel.com` (que é gratuito e fixo)
4. **Service type**: HTTP
5. **URL**: `localhost:80` (o nginx do MainsailOS atende aí)
6. Save hostname

Pronto — agora `https://printer1.cfargotunnel.com` aponta pro Mainsail no RPi.

Testa abrindo essa URL no navegador (de qualquer rede): você deve ver o Mainsail completo, com webcam, controles, tudo.

---

## Passo 5 — Configurar no painel 3dkprint (1 min)

1. Acessa `https://www.3dkprint.com.br/admin/impressoras`
2. Card da SV08 → **Detalhes & análise** → aba **Webcam**
3. Botão **⚙ Configurar acesso remoto**
4. Cola em "URL base do Mainsail":
   ```
   https://printer1.cfargotunnel.com
   ```
   (Use a URL que o seu Cloudflare gerou — não copia literal essa.)
5. Deixa o campo "URL do stream MJPEG" em branco (a gente deduz de
   `BASE/webcam/?action=stream`).
6. **Salvar**.

A página recarrega e o painel passa a mostrar o stream ao vivo do RPi via Cloudflare,
com indicador verde "ao vivo" pulsando. Funciona em qualquer rede.

---

## Segurança (opcional mas recomendado)

A URL `printer1.cfargotunnel.com` fica acessível pra qualquer pessoa que descobrir.
Pra restringir acesso só a você:

1. Cloudflare Zero Trust → **Access** → **Applications** → Add an application
2. Self-hosted, hostname = sua URL do tunnel
3. Policy → "Allow my email" (envia código de 6 dígitos pro seu email pra liberar)

Opcional. Sem isso, qualquer pessoa com a URL acessa o Mainsail (que tem controle da impressora).

---

## Troubleshooting

- **Painel mostra "Stream público não está respondendo"**: SSH no RPi e roda
  `sudo systemctl status cloudflared` — deve estar `active (running)`. Se não, `sudo systemctl restart cloudflared`.
- **URL do tunnel abre mas Mainsail não carrega**: confere o "Service URL" no Cloudflare
  é `localhost:80` (não `localhost:7125` — esse é o Moonraker direto, sem nginx). Se trocar
  pra `localhost:7125`, o stream da webcam não funciona.
- **Stream embedded no painel não aparece** mas Mainsail funciona: pode ser bloqueio de iframe.
  Abra o console do navegador (F12) e veja se tem erro de "X-Frame-Options" ou CORS. Soluções
  no SETUP_CLOUDFLARE_TUNNEL_TROUBLESHOOTING.md.
