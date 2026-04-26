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
  public_base_url: string | null;
  webcam_public_url: string | null;
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
  | 'klipper_restart'
  | 'read_config'
  | 'save_config'
  | 'list_macros'
  | 'capture_snapshot'
  | 'list_gcodes'
  | 'delete_gcode'
  | 'start_print_local'
  | 'set_velocity_factor'
  | 'set_extrude_factor'
  | 'set_fan'
  | 'klipper_save_config'
  | 'system_info'
  | 'get_bed_mesh'
  | 'set_pressure_advance'
  | 'set_velocity_limits';

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

// =====================================================
// Fase B — Histórico de jobs
// =====================================================
export interface PrintJob {
  id: string;
  printer_id: string;
  gcode_file_id: string | null;
  gcode_filename: string | null;
  started_at: string;
  finished_at: string | null;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  duration_seconds: number | null;
  filament_used_g: number | null;
  failure_reason: string | null;
  notes: string | null;
}

export async function listarPrintJobs(printerId: string, limit = 20): Promise<PrintJob[]> {
  const { data, error } = await supabase
    .from('printer_print_jobs')
    .select('*')
    .eq('printer_id', printerId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as PrintJob[];
}

// =====================================================
// Fase C — Manutenção
// =====================================================
export interface MaintenanceLog {
  id: string;
  printer_id: string;
  data: string;
  tipo: 'preventiva' | 'corretiva' | 'upgrade' | 'calibracao';
  descricao: string;
  componentes: string | null;
  custo: number;
  tecnico: string | null;
  horas_paradas: number;
  proxima_em_dias: number | null;
  created_at: string;
}

export async function listarManutencoes(printerId: string): Promise<MaintenanceLog[]> {
  const { data, error } = await supabase
    .from('printer_maintenance_logs')
    .select('*')
    .eq('printer_id', printerId)
    .order('data', { ascending: false });
  if (error) throw error;
  return data as MaintenanceLog[];
}

export async function criarManutencao(payload: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
  const { data, error } = await supabase
    .from('printer_maintenance_logs')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as MaintenanceLog;
}

export async function deletarManutencao(id: string): Promise<void> {
  const { error } = await supabase.from('printer_maintenance_logs').delete().eq('id', id);
  if (error) throw error;
}

// =====================================================
// Fase D — Precificação
// =====================================================
export interface PrinterPricing {
  printer_id: string;
  custo_hora: number;
  custo_filamento_kg: number;
  custo_setup: number;
  margem_percentual: number;
  tempo_minimo_horas: number;
  observacoes: string | null;
  updated_at: string;
}

export async function getPricing(printerId: string): Promise<PrinterPricing | null> {
  const { data, error } = await supabase
    .from('printer_pricing')
    .select('*')
    .eq('printer_id', printerId)
    .maybeSingle();
  if (error) throw error;
  return data as PrinterPricing | null;
}

export async function upsertPricing(p: PrinterPricing): Promise<void> {
  const { error } = await supabase
    .from('printer_pricing')
    .upsert(p, { onConflict: 'printer_id' });
  if (error) throw error;
}

export interface PrecificacaoInput {
  printer_id: string;
  tempo_horas: number;
  filamento_g: number;
  quantidade: number;
}
export interface PrecificacaoResultado {
  custo_operacao: number;     // tempo * custo_hora
  custo_filamento: number;    // (filamento_g / 1000) * custo_filamento_kg
  custo_setup: number;
  custo_total: number;
  margem_valor: number;
  preco_unitario: number;
  preco_total: number;
}

export async function calcularPrecificacao(
  input: PrecificacaoInput
): Promise<PrecificacaoResultado | null> {
  const pricing = await getPricing(input.printer_id);
  if (!pricing) return null;
  const tempo = Math.max(input.tempo_horas, pricing.tempo_minimo_horas);
  const custo_operacao = tempo * pricing.custo_hora;
  const custo_filamento = (input.filamento_g / 1000) * pricing.custo_filamento_kg;
  const custo_setup = pricing.custo_setup;
  const custo_total = custo_operacao + custo_filamento + custo_setup;
  const margem_valor = custo_total * (pricing.margem_percentual / 100);
  const preco_unitario = custo_total + margem_valor;
  return {
    custo_operacao,
    custo_filamento,
    custo_setup,
    custo_total,
    margem_valor,
    preco_unitario,
    preco_total: preco_unitario * Math.max(1, input.quantidade),
  };
}

// =====================================================
// Fase E — Macros (CRUD) e config
// =====================================================
export interface PrinterMacro {
  id: string;
  printer_id: string | null;
  nome: string;
  descricao: string | null;
  gcode: string;
  cor: string | null;
  icone: string | null;
  ordem: number;
  created_at: string;
}

export async function listarMacros(printerId: string): Promise<PrinterMacro[]> {
  const { data, error } = await supabase
    .from('printer_macros')
    .select('*')
    .or(`printer_id.eq.${printerId},printer_id.is.null`)
    .order('ordem', { ascending: true });
  if (error) throw error;
  return data as PrinterMacro[];
}

export async function salvarMacro(m: Partial<PrinterMacro>): Promise<PrinterMacro> {
  if (m.id) {
    const { data, error } = await supabase
      .from('printer_macros')
      .update(m)
      .eq('id', m.id)
      .select('*')
      .single();
    if (error) throw error;
    return data as PrinterMacro;
  }
  const { data, error } = await supabase
    .from('printer_macros')
    .insert(m)
    .select('*')
    .single();
  if (error) throw error;
  return data as PrinterMacro;
}

export async function deletarMacro(id: string): Promise<void> {
  const { error } = await supabase.from('printer_macros').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Cria comando read_config e fica esperando o agente preencher result.
 * Long polling simples — checa a cada 1s por até 30s.
 */
export async function lerPrinterCfg(printerId: string, timeoutSeconds = 30): Promise<string> {
  const r = await enviarComandoComResultado<{ content: string }>(printerId, 'read_config', undefined, timeoutSeconds);
  return r.content;
}

/**
 * Helper genérico: envia comando, faz long polling até o agente responder com result.
 * Útil pra qualquer comando que retorna dados (list_gcodes, system_info, etc).
 */
export async function enviarComandoComResultado<T = unknown>(
  printerId: string,
  command: PrinterCommandName,
  params?: Record<string, unknown>,
  timeoutSeconds = 30,
): Promise<T> {
  const cmd = await enviarComando(printerId, command, params);
  const start = Date.now();
  while (Date.now() - start < timeoutSeconds * 1000) {
    await new Promise((r) => setTimeout(r, 1000));
    const { data } = await supabase
      .from('printer_commands')
      .select('status, result, error_message')
      .eq('id', cmd.id)
      .maybeSingle();
    if (data?.status === 'done') {
      return (data.result as T) ?? ({} as T);
    }
    if (data?.status === 'failed') {
      throw new Error(data.error_message || `falha em ${command}`);
    }
  }
  throw new Error(`timeout esperando o agente em ${command}`);
}

export async function salvarPrinterCfg(
  printerId: string,
  content: string,
  restart = false,
): Promise<void> {
  await enviarComando(printerId, 'save_config', { content, restart });
}

// =====================================================
// Fase F — Webcam snapshots
// =====================================================
export interface PrinterSnapshot {
  id: string;
  printer_id: string;
  storage_path: string;
  taken_at: string;
}

export async function ultimoSnapshot(printerId: string): Promise<PrinterSnapshot | null> {
  const { data, error } = await supabase
    .from('printer_snapshots')
    .select('*')
    .eq('printer_id', printerId)
    .order('taken_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as PrinterSnapshot | null;
}

export function publicSnapshotUrl(storagePath: string): string {
  const url = supabase.storage.from('webcam').getPublicUrl(storagePath);
  return url.data.publicUrl;
}

// =====================================================
// Fase G — KPIs (view)
// =====================================================
export interface PrinterKpi {
  printer_id: string;
  nome: string;
  valor_compra: number;
  jobs_ok: number;
  jobs_falha: number;
  horas_impressao: number;
  custo_manutencao: number;
  horas_paradas: number;
}

export async function listarKpis(): Promise<PrinterKpi[]> {
  const { data, error } = await supabase.from('printer_kpis').select('*');
  if (error) throw error;
  return data as PrinterKpi[];
}

// =====================================================
// Fase H — Arquivos da impressora (gcodes na SD via Moonraker)
// =====================================================
export interface GcodeOnPrinter {
  path: string;       // ex: "Benchy.gcode" ou "subdir/peca.gcode"
  modified: number;   // unix timestamp
  size: number;       // bytes
  permissions?: string;
}

export async function listarGcodesImpressora(printerId: string): Promise<GcodeOnPrinter[]> {
  const r = await enviarComandoComResultado<{ files: GcodeOnPrinter[] }>(
    printerId, 'list_gcodes', undefined, 30
  );
  return r.files || [];
}

export async function deletarGcodeImpressora(printerId: string, filename: string): Promise<void> {
  await enviarComandoComResultado(printerId, 'delete_gcode', { filename }, 30);
}

export async function iniciarPrintLocal(printerId: string, filename: string): Promise<void> {
  await enviarComandoComResultado(printerId, 'start_print_local', { filename }, 60);
}

// =====================================================
// Fase H — Sliders ao vivo (velocidade, extrusão, fan)
// =====================================================
export async function definirVelocityFactor(printerId: string, percent: number): Promise<void> {
  await enviarComando(printerId, 'set_velocity_factor', { percent });
}

export async function definirExtrudeFactor(printerId: string, percent: number): Promise<void> {
  await enviarComando(printerId, 'set_extrude_factor', { percent });
}

export async function definirFan(printerId: string, percent: number): Promise<void> {
  await enviarComando(printerId, 'set_fan', { percent });
}

export async function klipperSaveConfig(printerId: string): Promise<void> {
  await enviarComando(printerId, 'klipper_save_config');
}

// =====================================================
// Fase H — Sistema (RAM, CPU, disco, services)
// =====================================================
export interface SystemInfoResult {
  system?: {
    cpu_info?: { cpu_count?: number; bits?: string; processor?: string; cpu_desc?: string; serial_number?: string; hardware_desc?: string; model?: string; total_memory?: number; memory_units?: string };
    distribution?: { name?: string; id?: string; version?: string; like?: string; codename?: string };
    network?: Record<string, unknown>;
    instance_ids?: { moonraker?: string; klipper?: string };
    service_state?: Record<string, { active_state?: string; sub_state?: string }>;
    virtualization?: { virt_type?: string; virt_identifier?: string };
    canonical_id?: string;
  };
  proc?: {
    moonraker_stats?: { time?: number; cpu_usage?: number; memory?: number };
    cpu_temp?: number;
    network?: Record<string, unknown>;
    system_cpu_usage?: { cpu?: number };
    system_memory?: { total?: number; available?: number; used?: number };
  };
  updates?: Record<string, unknown>;
}

export async function pegarSystemInfo(printerId: string): Promise<SystemInfoResult> {
  return enviarComandoComResultado<SystemInfoResult>(printerId, 'system_info', undefined, 20);
}

// =====================================================
// Fase H — Bed mesh
// =====================================================
export interface BedMeshResult {
  profile_name?: string;
  mesh_max?: [number, number];
  mesh_min?: [number, number];
  probed_matrix?: number[][];
  mesh_matrix?: number[][];
  profiles?: Record<string, unknown>;
}

export async function pegarBedMesh(printerId: string): Promise<BedMeshResult> {
  return enviarComandoComResultado<BedMeshResult>(printerId, 'get_bed_mesh', undefined, 15);
}

export async function definirPressureAdvance(printerId: string, advance: number, smooth_time?: number): Promise<void> {
  await enviarComando(printerId, 'set_pressure_advance', { advance, smooth_time });
}

export async function definirVelocityLimits(printerId: string, params: { velocity?: number; accel?: number; accel_to_decel?: number; square_corner_velocity?: number }): Promise<void> {
  await enviarComando(printerId, 'set_velocity_limits', params);
}

// =====================================================
// Fase H — Fila de impressões (printer_print_queue)
// =====================================================
export interface PrintQueueItem {
  id: string;
  printer_id: string;
  filename: string;
  gcode_file_id: string | null;
  ordem: number;
  status: 'pending' | 'printing' | 'done' | 'cancelled' | 'failed';
  added_at: string;
  started_at: string | null;
  finished_at: string | null;
  notes: string | null;
}

export async function listarFila(printerId: string): Promise<PrintQueueItem[]> {
  const { data, error } = await supabase
    .from('printer_print_queue')
    .select('*')
    .eq('printer_id', printerId)
    .order('ordem', { ascending: true })
    .limit(100);
  if (error) throw error;
  return data as PrintQueueItem[];
}

export async function adicionarNaFila(printerId: string, filename: string, gcodeFileId?: string): Promise<PrintQueueItem> {
  // Pega maior ordem atual
  const { data: ult } = await supabase
    .from('printer_print_queue')
    .select('ordem')
    .eq('printer_id', printerId)
    .order('ordem', { ascending: false })
    .limit(1);
  const proximaOrdem = ult && ult.length > 0 ? (ult[0].ordem || 0) + 1 : 0;

  const { data, error } = await supabase
    .from('printer_print_queue')
    .insert({ printer_id: printerId, filename, gcode_file_id: gcodeFileId ?? null, ordem: proximaOrdem })
    .select('*')
    .single();
  if (error) throw error;
  return data as PrintQueueItem;
}

export async function removerDaFila(id: string): Promise<void> {
  const { error } = await supabase.from('printer_print_queue').delete().eq('id', id);
  if (error) throw error;
}

export async function atualizarFilaItem(id: string, patch: Partial<PrintQueueItem>): Promise<void> {
  const { error } = await supabase.from('printer_print_queue').update(patch).eq('id', id);
  if (error) throw error;
}

// =====================================================
// AI Failure Detection
// =====================================================
export type FailureType =
  | 'spaghetti_failure'
  | 'bed_detachment'
  | 'layer_shift'
  | 'extrusion_failure'
  | 'unknown_failure';

export interface PrinterAISettings {
  id: string;
  printer_id: string;
  ai_enabled: boolean;
  pause_on_failure: boolean;
  confidence_threshold: number;
  snapshot_interval_seconds: number;
  provider: 'openai' | 'anthropic' | 'roboflow' | 'stub';
  enabled_types: FailureType[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrinterFailureEvent {
  id: string;
  printer_id: string;
  job_id: string | null;
  failure_type: FailureType;
  confidence: number;
  snapshot_url: string | null;
  detected_at: string;
  action_taken: string | null;
  status: 'open' | 'acknowledged' | 'false_positive' | 'resolved';
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface PrinterFailureKpi {
  printer_id: string;
  nome: string;
  falhas_24h: number;
  falhas_7d: number;
  falhas_abertas: number;
  falsos_positivos: number;
  confianca_media_7d: number | null;
  ultima_falha: string | null;
}

export async function getAISettings(printerId: string): Promise<PrinterAISettings | null> {
  const { data, error } = await supabase
    .from('printer_ai_settings')
    .select('*')
    .eq('printer_id', printerId)
    .maybeSingle();
  if (error) throw error;
  return data as PrinterAISettings | null;
}

export async function upsertAISettings(s: Partial<PrinterAISettings> & { printer_id: string }): Promise<void> {
  const { error } = await supabase
    .from('printer_ai_settings')
    .upsert({ ...s, updated_at: new Date().toISOString() }, { onConflict: 'printer_id' });
  if (error) throw error;
}

export async function listarFailureEvents(printerId: string, limit = 50): Promise<PrinterFailureEvent[]> {
  const { data, error } = await supabase
    .from('printer_failure_events')
    .select('*')
    .eq('printer_id', printerId)
    .order('detected_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as PrinterFailureEvent[];
}

export async function atualizarFailureStatus(id: string, status: PrinterFailureEvent['status'], notes?: string): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (notes !== undefined) patch.notes = notes;
  const { error } = await supabase.from('printer_failure_events').update(patch).eq('id', id);
  if (error) throw error;
}

export async function getFailureKpis(): Promise<PrinterFailureKpi[]> {
  const { data, error } = await supabase.from('printer_failure_kpis').select('*');
  if (error) throw error;
  return data as PrinterFailureKpi[];
}

export const FAILURE_LABELS: Record<FailureType, string> = {
  spaghetti_failure: 'Spaghetti (extrusão no ar)',
  bed_detachment: 'Descolamento da mesa',
  layer_shift: 'Layer shift',
  extrusion_failure: 'Falha de extrusão',
  unknown_failure: 'Falha desconhecida',
};

export const FAILURE_COLORS: Record<FailureType, string> = {
  spaghetti_failure: 'text-orange-400',
  bed_detachment: 'text-red-400',
  layer_shift: 'text-yellow-400',
  extrusion_failure: 'text-purple-400',
  unknown_failure: 'text-gray-400',
};

// =====================================================
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
