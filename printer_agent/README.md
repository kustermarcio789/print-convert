# 3dkprint — Agente de impressora

Pequeno daemon Python que roda no Raspberry Pi da impressora (onde o
Klipper/Moonraker já está instalado). Ele faz a ponte entre a impressora
local e o site **3dkprint.com.br** sem precisar expor a impressora na internet.

## O que o agente faz

- A cada **5 segundos** coleta telemetria do Moonraker (`/printer/objects/query`)
  — estado, temperaturas, progresso, arquivo atual, posição — e envia pro site
  via HTTPS POST.
- A cada **3 segundos** verifica se o site postou algum comando para a
  impressora (pausar, retomar, cancelar, imprimir arquivo, set temp etc.)
  e executa via Moonraker.
- Quando o site pede **"imprimir arquivo X"**, o agente baixa o `.gcode` do
  Supabase Storage e sobe pro Moonraker com `print=true`, iniciando o job.

Nenhum tráfego entra na sua rede — o agente sempre **inicia** as conexões.

## Instalação no Raspberry Pi

1. Clone (ou copie) a pasta `printer_agent/` para o RPi, por exemplo em `/home/pi/printer_agent`.
2. Crie o venv e instale deps:
   ```bash
   cd /home/pi/printer_agent
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Copie o config de exemplo e preencha com os dados reais:
   ```bash
   cp config.example.json config.json
   nano config.json
   ```
   Você vai precisar:
   - **`site_base_url`**: URL do seu Supabase (ex: `https://xxxx.supabase.co`) —
     o agente fala com as Edge Functions, não com o Vercel.
   - **`id`** e **`agente_token`** de cada impressora: pegue no admin do
     site `/admin/impressoras` depois de cadastrar a impressora (esses valores
     são mostrados no card de configuração do agente).
   - **`api_url`** da impressora: `http://IP_DO_RPI:7125` (Moonraker).
4. Teste rodando no terminal:
   ```bash
   python agent.py
   ```
   Você deve ver logs tipo:
   ```
   Agente iniciado — 1 impressora(s) configurada(s).
     • Sovol SV08 [8f9e12a3] http://192.168.1.129:7125
   ```
5. Se tudo estiver OK, instale como serviço systemd:
   ```bash
   sudo cp printer_agent.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now printer_agent
   sudo systemctl status printer_agent
   ```
   Logs ao vivo:
   ```bash
   journalctl -u printer_agent -f
   ```

## Rodar com várias impressoras

Se mais de um RPi está na mesma rede (Voron, KP3S, etc.), tem duas opções:

- **Agente centralizado** (recomendado): um único agente num RPi que consegue
  acessar todos os IPs das impressoras. Basta adicionar mais entradas na lista
  `printers` do `config.json`.
- **Um agente por impressora**: instale o mesmo pacote em cada RPi. Cada um
  fica responsável só pela sua impressora.

## Troubleshooting

- **"Moonraker offline"** no log: confirme `curl http://localhost:7125/printer/info`
  no RPi responde JSON. Se não, verifique se Moonraker está rodando
  (`systemctl status moonraker`).
- **401 Unauthorized** do site: o `agente_token` no config não bate com o
  cadastrado no DB. Gere um novo no admin do site e atualize o config.json.
- **Comandos não chegam**: reduza `COMMAND_POLL_INTERVAL_SECONDS` no `agent.py`
  ou abra um issue — o próximo passo é migrar pra WebSocket pra latência menor.
