import { supabase } from './supabase';

export interface PrinterDevice {
  id: string;
  nome: string;
  marca: string | null;
  modelo: string | null;
  tipo: 'fdm' | 'resina';
  firmware_tipo: 'klipper' | 'chitu' | 'marlin' | 'outro';
  status_geral: 'ativa' | 'manutencao' | 'inativa' | 'defeito';
  api_url: string | null;
  agente_token: string;
  volume_impressao: string | null;
  potencia_watts: number | null;
  foto: string | null;
  observacoes: string | null;
  horas_totais: number;
  horas_desde_ultima_manutencao: number;
  intervalo_manutencao_horas: number;
  data_compra: string | null;
  valor_compra: number | null;
  created_at: string;
  updated_at: string;
}

export interface PrinterTelemetry {
  printer_id: string;
  state: 'standby' | 'printing' | 'paused' | 'error' | 'offline';
  state_message: string | null;
  extruder_temp: number | null;
  extruder_target: number | null;
  bed_temp: number | null;
  bed_target: number | null;
  chamber_temp: number | null;
  progress: number | null;
  current_file: string | null;
  print_duration_seconds: number | null;
  print_time_remaining_seconds: number | null;
  position_x: number | null;
  position_y: number | null;
  position_z: number | null;
  updated_at: string;
}

export type PrinterCommandName =
  | 'print_file'
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'emergency_stop'
  | 'home'
  | 'set_temp_extruder'
  | 'set_temp_bed'
  | 'gcode_raw'
  | 'jog'
  | 'baby_step'
  | 'load_filament'
  | 'unload_filament'
  | 'run_macro'
  | 'firmware_restart'
  | 'klipper_restart';

export interface PrinterCommand {
  id: string;
  printer_id: string;
  command: PrinterCommandName;
  params: Record<string, unknown> | null;
  status: 'pending' | 'in_progress' | 'done' | 'failed';
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export async function listarImpressorasConectadas(): Promise<PrinterDevice[]> {
  const { data, error } = await supabase
    .from('printer_devices')
    .select('*')
    .order('nome', { ascending: true });
  if (error) throw error;
  return data as PrinterDevice[];
}

export async function getTelemetry(printerId: string): Promise<PrinterTelemetry | null> {
  const { data, error } = await supabase
    .from('printer_telemetry')
    .select('*')
    .eq('printer_id', printerId)
    .maybeSingle();
  if (error) throw error;
  return data as PrinterTelemetry | null;
}

export async function criarImpressora(payload: Partial<PrinterDevice>): Promise<PrinterDevice> {
  const { data, error } = await supabase
    .from('printer_devices')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as PrinterDevice;
}

export async function atualizarImpressora(id: string, payload: Partial<PrinterDevice>): Promise<void> {
  const { error } = await supabase.from('printer_devices').update(payload).eq('id', id);
  if (error) throw error;
}

export async function enviarComando(
  printerId: string,
  command: PrinterCommandName,
  params?: Record<string, unknown>,
): Promise<PrinterCommand> {
  const { data, error } = await supabase
    .from('printer_commands')
    .insert({
      printer_id: printerId,
      command,
      params: params ?? null,
      status: 'pending',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as PrinterCommand;
}

export async function listarComandosRecentes(printerId: string, limit = 20): Promise<PrinterCommand[]> {
  const { data, error } = await supabase
    .from('printer_commands')
    .select('*')
    .eq('printer_id', printerId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as PrinterCommand[];
}

export interface GcodeFile {
  id: string;
  nome_original: string;
  storage_path: string;
  size_bytes: number | null;
  created_at: string;
}

/**
 * Faz upload do .gcode para o Supabase Storage (bucket "gcodes") e
 * registra em gcode_files. Não dispara print — chame enviarComando('print_file')
 * depois para iniciar.
 */
export async function uploadGcode(file: File): Promise<GcodeFile> {
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
  const storagePath = `${id}/${safeName}`;

  const { error: upErr } = await supabase.storage
    .from('gcodes')
    .upload(storagePath, file, {
      contentType: 'application/octet-stream',
      upsert: false,
    });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from('gcode_files')
    .insert({
      id,
      nome_original: file.name,
      storage_path: storagePath,
      size_bytes: file.size,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as GcodeFile;
}

/**
 * Gera URL temporária (1h) para o agente baixar o .gcode do Storage.
 * O Supabase Storage por padrão é privado; signed URL resolve sem precisar
 * deixar o bucket público.
 */
export async function signedGcodeUrl(storagePath: string, expiresInSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from('gcodes')
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function listarGcodes(): Promise<GcodeFile[]> {
  const { data, error } = await supabase
    .from('gcode_files')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as GcodeFile[];
}

// Helpers de formatação para a UI
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m`;
}

export function stateColor(state: PrinterTelemetry['state'] | undefined): string {
  switch (state) {
    case 'printing':
      return 'bg-green-500';
    case 'paused':
      return 'bg-yellow-500';
    case 'error':
      return 'bg-red-500';
    case 'standby':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

export function stateLabel(state: PrinterTelemetry['state'] | undefined): string {
  switch (state) {
    case 'printing':
      return 'Imprimindo';
    case 'paused':
      return 'Pausada';
    case 'error':
      return 'Erro';
    case 'standby':
      return 'Pronta';
    case 'offline':
      return 'Offline';
    default:
      return 'Desconhecido';
  }
}
