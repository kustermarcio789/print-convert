import React, { useState, useRef } from 'react';
import { Upload, X, File, Check, AlertCircle } from 'lucide-react';
import { uploadFile, deleteFile, formatFileSize, getFileIcon, type UploadedFile } from '@/lib/fileUpload';

interface FileUploaderProps {
  category: 'quote' | 'provider' | 'product';
  onFilesChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  label?: string;
}

export default function FileUploader({ 
  category, 
  onFilesChange, 
  maxFiles = 5,
  label = 'Enviar Arquivos'
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const uploadedFiles: UploadedFile[] = [];

    for (const file of selectedFiles) {
      const result = await uploadFile(file, category);
      
      if (result.success && result.file) {
        uploadedFiles.push(result.file);
      } else {
        setError(result.error || 'Erro ao fazer upload');
        setUploading(false);
        return;
      }
    }

    const newFiles = [...files, ...uploadedFiles];
    setFiles(newFiles);
    setUploading(false);
    setSuccess(`${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`);
    
    if (onFilesChange) {
      onFilesChange(newFiles);
    }

    // Limpar mensagem de sucesso após 3 segundos
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRemoveFile = (fileId: string) => {
    deleteFile(fileId, category);
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    
    if (onFilesChange) {
      onFilesChange(newFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".stl,.obj,.3mf,.gcode,.step,.stp,.jpg,.jpeg,.png,.webp,.gif,.pdf"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold text-blue-600">Clique para enviar</span> ou arraste arquivos
          </p>
          
          <p className="text-xs text-gray-500">
            STL, OBJ, 3MF, GCODE, imagens ou PDF (máx. 50MB)
          </p>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Arquivos enviados ({files.length}/{maxFiles})
          </p>
          
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileIcon(file.name)}</span>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleRemoveFile(file.id)}
                className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                title="Remover arquivo"
              >
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 p-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Enviando arquivos...</span>
        </div>
      )}
    </div>
  );
}
