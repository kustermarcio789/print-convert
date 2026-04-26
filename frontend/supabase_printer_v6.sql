-- =====================================================
-- Patch v6 — AI Failure Detection
-- =====================================================

-- 1) Configurações de IA por impressora (1 linha por printer)
CREATE TABLE IF NOT EXISTS printer_ai_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID UNIQUE NOT NULL REFERENCES printer_devices(id) ON DELETE CASCADE,
  ai_enabled BOOLEAN NOT NULL DEFAULT false,
  pause_on_failure BOOLEAN NOT NULL DEFAULT true,
  confidence_threshold NUMERIC NOT NULL DEFAULT 0.75 CHECK (confidence_threshold BETWEEN 0 AND 1),
  snapshot_interval_seconds INTEGER NOT NULL DEFAULT 60 CHECK (snapshot_interval_seconds >= 10),
  -- Provider: openai | anthropic | roboflow | stub (default sem chave)
  provider TEXT NOT NULL DEFAULT 'stub',
  -- Tipos habilitados (se vazio = todos)
  enabled_types TEXT[] DEFAULT ARRAY['spaghetti_failure','bed_detachment','layer_shift','extrusion_failure','unknown_failure'],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_settings_enabled ON printer_ai_settings(printer_id) WHERE ai_enabled = true;

-- 2) Eventos de falha detectados pela IA
CREATE TABLE IF NOT EXISTS printer_failure_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID NOT NULL REFERENCES printer_devices(id) ON DELETE CASCADE,
  job_id UUID REFERENCES printer_print_jobs(id) ON DELETE SET NULL,
  failure_type TEXT NOT NULL CHECK (failure_type IN (
    'spaghetti_failure','bed_detachment','layer_shift','extrusion_failure','unknown_failure'
  )),
  confidence NUMERIC NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  snapshot_url TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action_taken TEXT, -- ex: 'paused', 'cancelled', 'logged_only'
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','false_positive','resolved')),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_failure_events_printer_time
  ON printer_failure_events (printer_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_failure_events_open
  ON printer_failure_events (printer_id) WHERE status = 'open';

-- 3) Liberar comandos novos no CHECK constraint
ALTER TABLE printer_commands DROP CONSTRAINT IF EXISTS printer_commands_command_check;
ALTER TABLE printer_commands
  ADD CONSTRAINT printer_commands_command_check CHECK (command IN (
    'print_file','pause','resume','cancel','emergency_stop','home',
    'set_temp_extruder','set_temp_bed','gcode_raw',
    'jog','baby_step','load_filament','unload_filament','run_macro',
    'firmware_restart','klipper_restart',
    'read_config','save_config','list_macros','capture_snapshot',
    'list_gcodes','delete_gcode','start_print_local',
    'set_velocity_factor','set_extrude_factor','set_fan',
    'klipper_save_config','system_info','get_bed_mesh',
    'set_pressure_advance','set_velocity_limits',
    'ai_analyze','sync_ai_settings'
  ));

-- 4) RLS
ALTER TABLE printer_ai_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_failure_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_settings_all" ON printer_ai_settings;
DROP POLICY IF EXISTS "failure_events_all" ON printer_failure_events;
CREATE POLICY "ai_settings_all"   ON printer_ai_settings   FOR ALL USING (true);
CREATE POLICY "failure_events_all" ON printer_failure_events FOR ALL USING (true);

-- 5) View agregada pra dashboards (falhas por impressora nas últimas 24h)
CREATE OR REPLACE VIEW printer_failure_kpis AS
SELECT
  pd.id AS printer_id,
  pd.nome,
  COUNT(fe.id) FILTER (WHERE fe.detected_at >= now() - interval '24 hours')::int AS falhas_24h,
  COUNT(fe.id) FILTER (WHERE fe.detected_at >= now() - interval '7 days')::int AS falhas_7d,
  COUNT(fe.id) FILTER (WHERE fe.status = 'open')::int AS falhas_abertas,
  COUNT(fe.id) FILTER (WHERE fe.status = 'false_positive')::int AS falsos_positivos,
  AVG(fe.confidence) FILTER (WHERE fe.detected_at >= now() - interval '7 days')::numeric AS confianca_media_7d,
  MAX(fe.detected_at) AS ultima_falha
FROM printer_devices pd
LEFT JOIN printer_failure_events fe ON fe.printer_id = pd.id
GROUP BY pd.id, pd.nome;
