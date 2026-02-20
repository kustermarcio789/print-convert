import { useState } from 'react';
import { Download, Eye, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModelViewer3D from '@/components/ModelViewer3D';

interface Arquivo3D {
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
}

interface FileViewer3DProps {
  arquivos: Arquivo3D[];
  showPreview?: boolean;
}

export default function FileViewer3D({ arquivos, showPreview = true }: FileViewer3DProps) {
  const [previewFile, setPreviewFile] = useState<Arquivo3D | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (tipo: string) => {
    const ext = tipo.toLowerCase();
    if (ext.includes('stl') || ext.includes('obj') || ext.includes('3mf') || ext.includes('gcode')) {
      return '🔷';
    }
    if (ext.includes('glb') || ext.includes('gltf')) {
      return '🎨';
    }
    return '📄';
  };

  const canPreview = (tipo: string): boolean => {
    const ext = tipo.toLowerCase();
    return ext.includes('glb') || ext.includes('gltf');
  };

  const handleDownload = (arquivo: Arquivo3D) => {
    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = arquivo.url;
    link.download = arquivo.nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (arquivos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum arquivo anexado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {arquivos.map((arquivo, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="text-3xl">{getFileIcon(arquivo.tipo)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{arquivo.nome}</p>
              <p className="text-sm text-gray-500">
                {arquivo.tipo.toUpperCase()} • {formatFileSize(arquivo.tamanho)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showPreview && canPreview(arquivo.tipo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewFile(arquivo)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(arquivo)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar
            </Button>
          </div>
        </div>
      ))}

      {/* Modal de Preview */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{previewFile.nome}</h3>
                <p className="text-sm text-gray-500">
                  {previewFile.tipo.toUpperCase()} • {formatFileSize(previewFile.tamanho)}
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <ModelViewer3D
                src={previewFile.url}
                alt={previewFile.nome}
                autoRotate={true}
                cameraControls={true}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewFile(null)}
              >
                Fechar
              </Button>
              <Button
                onClick={() => handleDownload(previewFile)}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Arquivo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
