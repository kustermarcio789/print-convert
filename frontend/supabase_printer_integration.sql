-- =====================================================
-- Integração com impressoras 3D (Klipper/Moonraker + Chitu)
-- =====================================================

-- 1) Registro das impressoras reais (ampliação do CRUD local atual)
CREATE TABLE IF NOT EXISTS printer_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('fdm', 'resina')),
  firmware_tipo TEXT NOT NULL DEFAULT 'klipper' CHECK (firmware_tipo IN ('klipper', 'chitu', 'marlin', 'outro')),
  status_geral TEXT NOT NULL DEFAULT 'ativa' CHECK (status_geral IN ('ativa', 'manutencao', 'inativa', 'defeito')),
  -- URL local da API (moonraker). O agente usa isso; o site NUNCA consome direto
  api_url TEXT,
  -- Token para autenticar o agente ao enviar telemetria e receber comandos
  agente_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  -- Aspectos físicos
  volume_impressao TEXT,
  potencia_watts INTEGER,
  foto TEXT,
  observacoes TEXT,
  -- Manutenção
  horas_totais NUMERIC DEFAULT 0,
  horas_desde_ultima_manutencao NUMERIC DEFAULT 0,
  intervalo_manutencao_horas INTEGER DEFAULT 200,
  data_compra DATE,
  valor_compra NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_printer_devices_status ON printer_devices(status_geral);
CREATE INDEX IF NOT EXISTS idx_printer_devices_token ON printer_devices(agente_token);

-- 2) Telemetria mais recente por impressora (1 linha por impressora, upsert pelo agente)
CREATE TABLE IF NOT EXISTS printer_telemetry (
  printer_id UUID PRIMARY KEY REFERENCES printer_devices(id) ON DELETE CASCADE,
  -- Estado geral ("standby", "printing", "paused", "error", "offline")
  state TEXT NOT NULL DEFAULT 'offline',
  -- Mensagem de estado (ex: "Printer is ready", erro, etc.)
  state_message TEXT,
  -- Temperaturas atuais (tudo float em °C)
  extruder_temp NUMERIC,
  extruder_target NUMERIC,
  bed_temp NUMERIC,
  bed_target NUMERIC,
  chamber_temp NUMERIC,
  -- Progresso do job atual (0..100)
  progress NUMERIC DEFAULT 0,
  -- Arquivo atual
  current_file TEXT,
  -- Tempo impressão
  print_duration_seconds INTEGER,
  print_time_remaining_seconds INTEGER,
  -- Posição da cabeça (mm)
  position_x NUMERIC,
  position_y NUMERIC,
  position_z NUMERIC,
  -- Campo bruto pra debugar / expor mais dados sem migração
  raw JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Fila de comandos pendentes (site cria, agente busca e executa)
CREATE TABLE IF NOT EXISTS printer_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID NOT NULL REFERENCES printer_devices(id) ON DELETE CASCADE,
  command TEXT NOT NULL CHECK (command IN (
    'print_file',     -- inicia impressão de um gcode já enviado
    'pause',
    'resume',
    'cancel',
    'emergency_stop',
    'home',
    'set_temp_extruder',
    'set_temp_bed',
    'gcode_raw'       -- envia gcode arbitrário (admin avançado)
  )),
  -- Parâmetros variáveis (gcode_file_id, temperatura, eixos, gcode string...)
  params JSONB,
  -- Ciclo de vida: pending → in_progress → done | failed
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'failed')),
  error_message TEXT,
  -- Quem criou (JWT sub do admin)
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  picked_up_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_printer_commands_pending ON printer_commands(printer_id, status)
  WHERE status = 'pending';

-- 4) Arquivos GCODE enviados pelo admin (referência ao Supabase Storage)
CREATE TABLE IF NOT EXISTS gcode_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_original TEXT NOT NULL,
  storage_path TEXT NOT NULL,          -- ex: "gcodes/{uuid}/{nome}.gcode"
  size_bytes BIGINT,
  md5 TEXT,
  material_sugerido TEXT,
  tempo_estimado_segundos INTEGER,
  filamento_estimado_g NUMERIC,
  thumbnail_base64 TEXT,               -- miniatura extraída do gcode (opcional)
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) Histórico de jobs (um job por print finalizado, sucesso ou falha)
CREATE TABLE IF NOT EXISTS printer_print_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID NOT NULL REFERENCES printer_devices(id) ON DELETE CASCADE,
  gcode_file_id UUID REFERENCES gcode_files(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  duration_seconds INTEGER,
  filament_used_g NUMERIC,
  first_layer_ok BOOLEAN,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_print_jobs_printer ON printer_print_jobs(printer_id, started_at DESC);

-- =====================================================
-- RLS: acesso total apenas pro service role (edge functions)
-- Leitura autenticada para o frontend admin
-- =====================================================
ALTER TABLE printer_devices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_telemetry    ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_commands     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcode_files          ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_print_jobs   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "printer_devices_read_all"   ON printer_devices;
DROP POLICY IF EXISTS "printer_telemetry_read_all" ON printer_telemetry;
DROP POLICY IF EXISTS "printer_commands_read_all"  ON printer_commands;
DROP POLICY IF EXISTS "gcode_files_read_all"       ON gcode_files;
DROP POLICY IF EXISTS "print_jobs_read_all"        ON printer_print_jobs;

CREATE POLICY "printer_devices_read_all"   ON printer_devices      FOR SELECT USING (true);
CREATE POLICY "printer_telemetry_read_all" ON printer_telemetry    FOR SELECT USING (true);
CREATE POLICY "printer_commands_read_all"  ON printer_commands     FOR SELECT USING (true);
CREATE POLICY "gcode_files_read_all"       ON gcode_files          FOR SELECT USING (true);
CREATE POLICY "print_jobs_read_all"        ON printer_print_jobs   FOR SELECT USING (true);

-- Escritas são via edge function (service role ignora RLS), mas deixo
-- escrita ampla até terminar a migração pro secure-crud.
CREATE POLICY "printer_devices_write"   ON printer_devices      FOR ALL USING (true);
CREATE POLICY "printer_telemetry_write" ON printer_telemetry    FOR ALL USING (true);
CREATE POLICY "printer_commands_write"  ON printer_commands     FOR ALL USING (true);
CREATE POLICY "gcode_files_write"       ON gcode_files          FOR ALL USING (true);
CREATE POLICY "print_jobs_write"        ON printer_print_jobs   FOR ALL USING (true);

-- =====================================================
-- Storage bucket para os arquivos .gcode (criação manual via painel OK,
-- este comando é idempotente e documenta o nome esperado)
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('gcodes', 'gcodes', false)
ON CONFLICT (id) DO NOTHING;
