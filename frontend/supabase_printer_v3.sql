-- =====================================================
-- Patch v3 — Histórico, manutenção, precificação, macros, snapshots, ROI
-- =====================================================

-- B) Histórico de prints — colunas extras em printer_print_jobs
ALTER TABLE printer_print_jobs
  ADD COLUMN IF NOT EXISTS gcode_filename  TEXT,
  ADD COLUMN IF NOT EXISTS failure_reason  TEXT,
  ADD COLUMN IF NOT EXISTS extruder_max_temp NUMERIC,
  ADD COLUMN IF NOT EXISTS bed_max_temp      NUMERIC;

CREATE INDEX IF NOT EXISTS idx_print_jobs_status_started
  ON printer_print_jobs (printer_id, status, started_at DESC);

-- C) Manutenções e downtime
CREATE TABLE IF NOT EXISTS printer_maintenance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID NOT NULL REFERENCES printer_devices(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL DEFAULT 'preventiva' CHECK (tipo IN ('preventiva','corretiva','upgrade','calibracao')),
  descricao TEXT NOT NULL,
  componentes TEXT,
  custo NUMERIC DEFAULT 0,
  tecnico TEXT,
  horas_paradas NUMERIC DEFAULT 0,
  proxima_em_dias INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maint_printer ON printer_maintenance_logs (printer_id, data DESC);

-- D) Precificação (1 linha por impressora — upsert)
CREATE TABLE IF NOT EXISTS printer_pricing (
  printer_id UUID PRIMARY KEY REFERENCES printer_devices(id) ON DELETE CASCADE,
  custo_hora NUMERIC NOT NULL DEFAULT 0,        -- R$/hora de operação (energia + depreciação + mão de obra)
  custo_filamento_kg NUMERIC NOT NULL DEFAULT 0, -- R$/kg padrão (pode override por orçamento)
  custo_setup NUMERIC NOT NULL DEFAULT 0,       -- R$ fixo por job (limpeza, calibração, atendimento)
  margem_percentual NUMERIC NOT NULL DEFAULT 30,-- margem desejada %
  tempo_minimo_horas NUMERIC NOT NULL DEFAULT 0.5,
  observacoes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- E) Macros customizadas (CRUD via UI)
CREATE TABLE IF NOT EXISTS printer_macros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID REFERENCES printer_devices(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  gcode TEXT NOT NULL,            -- conteúdo da macro (linhas separadas por \n)
  cor TEXT DEFAULT '#3b82f6',
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_macros_printer ON printer_macros (printer_id, ordem);

-- F) Snapshots de webcam (URL no Storage)
CREATE TABLE IF NOT EXISTS printer_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID NOT NULL REFERENCES printer_devices(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  job_id UUID REFERENCES printer_print_jobs(id) ON DELETE SET NULL,
  taken_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_printer ON printer_snapshots (printer_id, taken_at DESC);

-- Bucket pra snapshots (público pra simplificar; URLs assinadas seriam mais seguro)
INSERT INTO storage.buckets (id, name, public)
VALUES ('webcam', 'webcam', true)
ON CONFLICT (id) DO NOTHING;

-- G) Reload da telemetria com filament_used
ALTER TABLE printer_telemetry
  ADD COLUMN IF NOT EXISTS filament_used_mm NUMERIC,
  ADD COLUMN IF NOT EXISTS filament_total_mm NUMERIC;

-- E') Suporte a novos comandos do agente (read/save config, capture snapshot)
ALTER TABLE printer_commands DROP CONSTRAINT IF EXISTS printer_commands_command_check;
ALTER TABLE printer_commands
  ADD CONSTRAINT printer_commands_command_check CHECK (command IN (
    'print_file','pause','resume','cancel','emergency_stop','home',
    'set_temp_extruder','set_temp_bed','gcode_raw',
    'jog','baby_step','load_filament','unload_filament','run_macro',
    'firmware_restart','klipper_restart',
    'read_config','save_config','capture_snapshot','list_macros'
  ));

-- Resultado dos comandos read_config / list_macros (agente preenche)
ALTER TABLE printer_commands
  ADD COLUMN IF NOT EXISTS result JSONB;

-- =====================================================
-- RLS para as novas tabelas
-- =====================================================
ALTER TABLE printer_maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_pricing          ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_macros           ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_snapshots        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maint_all"     ON printer_maintenance_logs;
DROP POLICY IF EXISTS "pricing_all"   ON printer_pricing;
DROP POLICY IF EXISTS "macros_all"    ON printer_macros;
DROP POLICY IF EXISTS "snapshots_all" ON printer_snapshots;

CREATE POLICY "maint_all"     ON printer_maintenance_logs FOR ALL USING (true);
CREATE POLICY "pricing_all"   ON printer_pricing          FOR ALL USING (true);
CREATE POLICY "macros_all"    ON printer_macros           FOR ALL USING (true);
CREATE POLICY "snapshots_all" ON printer_snapshots        FOR ALL USING (true);

-- =====================================================
-- View de uso/contabilidade por máquina (alimenta dashboard ROI)
-- =====================================================
CREATE OR REPLACE VIEW printer_kpis AS
SELECT
  pd.id AS printer_id,
  pd.nome,
  COALESCE(pd.valor_compra, 0) AS valor_compra,
  COALESCE(SUM(CASE WHEN ppj.status = 'completed' THEN 1 ELSE 0 END), 0)::int AS jobs_ok,
  COALESCE(SUM(CASE WHEN ppj.status IN ('failed','cancelled') THEN 1 ELSE 0 END), 0)::int AS jobs_falha,
  COALESCE(SUM(ppj.duration_seconds), 0) / 3600.0 AS horas_impressao,
  COALESCE((SELECT SUM(custo) FROM printer_maintenance_logs m WHERE m.printer_id = pd.id), 0) AS custo_manutencao,
  COALESCE((SELECT SUM(horas_paradas) FROM printer_maintenance_logs m WHERE m.printer_id = pd.id), 0) AS horas_paradas
FROM printer_devices pd
LEFT JOIN printer_print_jobs ppj ON ppj.printer_id = pd.id
GROUP BY pd.id, pd.nome, pd.valor_compra;
