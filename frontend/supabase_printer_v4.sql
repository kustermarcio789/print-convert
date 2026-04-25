-- =====================================================
-- Patch v4 — URLs públicas (Cloudflare Tunnel) pra acesso remoto
-- =====================================================

-- Quando o Cloudflare Tunnel estiver rodando no RPi e expor o Mainsail
-- num subdomínio HTTPS público (ex: cam-3dk.cfargotunnel.com), basta
-- preencher esses campos em printer_devices que o painel do site começa
-- a embedar o stream ao vivo de qualquer rede.
ALTER TABLE printer_devices
  ADD COLUMN IF NOT EXISTS public_base_url TEXT,
  ADD COLUMN IF NOT EXISTS webcam_public_url TEXT;

COMMENT ON COLUMN printer_devices.public_base_url
  IS 'URL HTTPS pública do Mainsail (ex: https://printer1.cfargotunnel.com). Usada pelo botão "Abrir Mainsail" e como fallback do stream.';
COMMENT ON COLUMN printer_devices.webcam_public_url
  IS 'URL HTTPS pública do stream MJPEG da webcam (ex: https://printer1.cfargotunnel.com/webcam/?action=stream). Embedda no painel.';
