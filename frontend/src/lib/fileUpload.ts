/**
 * Sistema de Upload de Arquivos para Orçamentos
 * Suporta: STL, OBJ, 3MF, GCODE, imagens (JPG, PNG, WEBP)
 */

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface UploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

// Tipos de arquivo permitidos
const ALLOWED_TYPES = {
  '3d_models': ['.stl', '.obj', '.3mf', '.gcode', '.step', '.stp'],
  'images': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  'documents': ['.pdf', '.doc', '.docx']
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Valida se o arquivo é permitido
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Verificar tamanho
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: 50MB`
    };
  }

  // Verificar extensão
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const allAllowedTypes = [
    ...ALLOWED_TYPES['3d_models'],
    ...ALLOWED_TYPES.images,
    ...ALLOWED_TYPES.documents
  ];

  if (!allAllowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Permitidos: ${allAllowedTypes.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Converte arquivo para Base64 para armazenamento local
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Faz upload do arquivo (simula upload, armazena em localStorage)
 */
export async function uploadFile(file: File, category: 'quote' | 'provider' | 'product'): Promise<UploadResult> {
  try {
    // Validar arquivo
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Converter para Base64
    const base64 = await fileToBase64(file);

    // Criar objeto de arquivo
    const uploadedFile: UploadedFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: base64,
      uploadedAt: new Date()
    };

    // Salvar em localStorage
    const storageKey = `uploaded_files_${category}`;
    const existingFiles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingFiles.push(uploadedFile);
    localStorage.setItem(storageKey, JSON.stringify(existingFiles));

    return {
      success: true,
      file: uploadedFile
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer upload'
    };
  }
}

/**
 * Lista arquivos enviados
 */
export function listUploadedFiles(category: 'quote' | 'provider' | 'product'): UploadedFile[] {
  const storageKey = `uploaded_files_${category}`;
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

/**
 * Remove arquivo
 */
export function deleteFile(fileId: string, category: 'quote' | 'provider' | 'product'): boolean {
  try {
    const storageKey = `uploaded_files_${category}`;
    const files = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const filtered = files.filter((f: UploadedFile) => f.id !== fileId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * Formata tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Obtém ícone baseado no tipo de arquivo
 */
export function getFileIcon(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (ALLOWED_TYPES['3d_models'].some(ext => ext.includes(extension || ''))) {
    return '🎨'; // Modelo 3D
  }
  if (ALLOWED_TYPES.images.some(ext => ext.includes(extension || ''))) {
    return '🖼️'; // Imagem
  }
  if (ALLOWED_TYPES.documents.some(ext => ext.includes(extension || ''))) {
    return '📄'; // Documento
  }
  return '📎'; // Genérico
}
