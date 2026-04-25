-- =====================================================
-- Patch v2 — adiciona novos comandos suportados pelo agente
-- =====================================================

ALTER TABLE printer_commands DROP CONSTRAINT IF EXISTS printer_commands_command_check;

ALTER TABLE printer_commands
  ADD CONSTRAINT printer_commands_command_check CHECK (command IN (
    'print_file',
    'pause',
    'resume',
    'cancel',
    'emergency_stop',
    'home',
    'set_temp_extruder',
    'set_temp_bed',
    'gcode_raw',
    'jog',
    'baby_step',
    'load_filament',
    'unload_filament',
    'run_macro',
    'firmware_restart',
    'klipper_restart'
  ));
