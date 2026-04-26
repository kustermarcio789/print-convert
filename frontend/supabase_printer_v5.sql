-- =====================================================
-- Patch v5 — Fase H: arquivos da impressora, sliders, sistema, bed mesh
-- =====================================================

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
    'set_pressure_advance','set_velocity_limits'
  ));

-- Fila de impressões: lista ordenada de gcodes pra rodar em sequência
CREATE TABLE IF NOT EXISTS printer_print_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID NOT NULL REFERENCES printer_devices(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,                  -- nome do gcode na SD da impressora
  gcode_file_id UUID REFERENCES gcode_files(id) ON DELETE SET NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','printing','done','cancelled','failed')),
  added_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_queue_printer_pending
  ON printer_print_queue (printer_id, ordem)
  WHERE status = 'pending';

ALTER TABLE printer_print_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "queue_all" ON printer_print_queue;
CREATE POLICY "queue_all" ON printer_print_queue FOR ALL USING (true);
