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
  const cmd = await enviarComando(printerId, 'read_config');
  const start = Date.now();
  while (Date.now() - start < timeoutSeconds * 1000) {
    await new Promise((r) => setTimeout(r, 1000));
    const { data } = await supabase
      .from('printer_commands')
      .select('status, result, error_message')
      .eq('id', cmd.id)
      .maybeSingle();
    if (data?.status === 'done' && (data.result as any)?.content !== undefined) {
      return (data.result as any).content as string;
    }
    if (data?.status === 'failed') {
      throw new Error(data.error_message || 'falha ao ler printer.cfg');
    }
  }
  throw new Error('timeout esperando o agente responder');
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
