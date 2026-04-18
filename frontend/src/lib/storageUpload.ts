import { supabase } from './supabase';

export const BUCKET_ORCAMENTOS = 'orcamento-imagens';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'];

export interface UploadedImage {
  url: string;
  path: string;
  name: string;
  size: number;
}

export interface UploadOptions {
  orcamentoId?: string;
  folder?: string;
}

function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
}

function sanitizeFilename(filename: string): string {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
}

export function validateImage(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Imagem acima de ${MAX_IMAGE_SIZE / 1024 / 1024}MB` };
  }
  const ext = getExtension(file.name);
  if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
    return { valid: false, error: `Formato não aceito. Use: ${ALLOWED_IMAGE_EXTS.join(', ')}` };
  }
  return { valid: true };
}

export async function uploadImage(file: File, opts: UploadOptions = {}): Promise<UploadedImage> {
  const validation = validateImage(file);
  if (!validation.valid) throw new Error(validation.error);

  const ext = getExtension(file.name);
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const folder = opts.folder || (opts.orcamentoId ? `orcamentos/${opts.orcamentoId}` : 'orcamentos/temp');
  const path = `${folder}/${uniqueName}`;

  const { error } = await supabase.storage
    .from(BUCKET_ORCAMENTOS)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

  if (error) throw new Error(`Falha no upload: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET_ORCAMENTOS).getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    name: sanitizeFilename(file.name),
    size: file.size,
  };
}

export async function uploadMultipleImages(files: File[], opts: UploadOptions = {}): Promise<UploadedImage[]> {
  const results = await Promise.allSettled(files.map(f => uploadImage(f, opts)));
  const uploaded: UploadedImage[] = [];
  const errors: string[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') uploaded.push(r.value);
    else errors.push(`${files[i].name}: ${r.reason?.message || 'erro'}`);
  });
  if (errors.length && uploaded.length === 0) throw new Error(errors.join('; '));
  return uploaded;
}

export async function deleteImage(path: string): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET_ORCAMENTOS).remove([path]);
  if (error) throw new Error(`Falha ao deletar: ${error.message}`);
}

export function extractPathFromUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : null;
}
