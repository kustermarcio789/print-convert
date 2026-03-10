import { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModelViewer3D from './ModelViewer3D';

interface FileUpload3DProps {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  showPreview?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function FileUpload3D({
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 50,
  acceptedFormats = ['.stl', '.obj', '.3mf', '.gcode', '.glb', '.gltf'],
  showPreview = true
}: FileUpload3DProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    Array.from(files).forEach((file) => {
      // Verificar tamanho
      if (file.size > maxSizeBytes) {
        newFiles.push({
          file,
          id: Math.random().toString(36),
          status: 'error',
          progress: 0,
          error: `Arquivo muito grande (máx: ${maxSizeMB}MB)`
        });
        return;
      }

      // Verificar formato
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedFormats.includes(extension)) {
        newFiles.push({
          file,
          id: Math.random().toString(36),
          status: 'error',
          progress: 0,
          error: 'Formato não suportado'
        });
        return;
      }

      // Criar preview para GLB/GLTF
      let preview: string | undefined;
      if (extension === '.glb' || extension === '.gltf') {
        preview = URL.createObjectURL(file);
      }

      const uploadedFile: UploadedFile = {
        file,
        id: Math.random().toString(36),
        preview,
        status: 'uploading',
        progress: 0
      };

      newFiles.push(uploadedFile);

      // Simular upload
      simulateUpload(uploadedFile);
    });

    setUploadedFiles((prev) => {
      const updated = [...prev, ...newFiles].slice(0, maxFiles);
      if (onFilesChange) {
        onFilesChange(updated.filter(f => f.status === 'success').map(f => f.file));
      }
      return updated;
    });
  };

  const simulateUpload = (uploadedFile: UploadedFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, progress, status: progress >= 100 ? 'success' : 'uploading' }
            : f
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        if (onFilesChange) {
          setUploadedFiles((current) => {
            onFilesChange(current.filter(f => f.status === 'success').map(f => f.file));
            return current;
          });
        }
      }
    }, 200);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      const updated = prev.filter((f) => f.id !== id);
      if (onFilesChange) {
        onFilesChange(updated.filter(f => f.status === 'success').map(f => f.file));
      }
      return updated;
    });
    if (previewFile?.id === id) {
      setPreviewFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      stl: '📐',
      obj: '🎯',
      '3mf': '📦',
      gcode: '⚙️',
      glb: '🎨',
      gltf: '🎨'
    };
    return icons[ext || ''] || '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        <h3 className="text-lg font-semibold mb-2">
          Arraste arquivos 3D aqui
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          ou clique para selecionar
        </p>

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="mb-4"
        >
          Selecionar Arquivos
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Formatos aceitos: {acceptedFormats.join(', ')}</p>
          <p>Tamanho máximo: {maxSizeMB}MB por arquivo</p>
          <p>Máximo de {maxFiles} arquivos</p>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">
            Arquivos ({uploadedFiles.length}/{maxFiles})
          </h4>
          
          {uploadedFiles.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="text-2xl flex-shrink-0">
                {getFileIcon(uploadedFile.file.name)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedFile.file.size)}
                </p>

                {uploadedFile.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadedFile.error && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {uploadedFile.error}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {uploadedFile.status === 'success' && (
                  <div className="text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                {uploadedFile.status === 'error' && (
                  <div className="text-red-600">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}

                {uploadedFile.preview && showPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewFile(uploadedFile)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadedFile.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && previewFile.preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">{previewFile.file.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewFile(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="h-[600px]">
              <ModelViewer3D
                src={previewFile.preview}
                alt={previewFile.file.name}
                autoRotate={true}
                cameraControls={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
