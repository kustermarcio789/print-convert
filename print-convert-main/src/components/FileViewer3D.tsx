import { useState } from 'react';
import { Download, Eye, File, X, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThreeViewer from '@/components/ThreeViewer';

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
    if (ext.includes('stl')) return '🔷';
    if (ext.includes('obj')) return '🟢';
    if (ext.includes('3mf')) return '🟣';
    if (ext.includes('step') || ext.includes('stp')) return '🟠';
    if (ext.includes('glb') || ext.includes('gltf')) return '🎨';
    return '📄';
  };

  const canPreview = (tipo: string): boolean => {
    const ext = tipo.toLowerCase();
    return ext.includes('stl') || ext.includes('obj') || ext.includes('3mf') || 
           ext.includes('step') || ext.includes('stp') || ext.includes('glb') || ext.includes('gltf');
  };

  const getFormatLabel = (tipo: string): string => {
    const ext = tipo.toLowerCase();
    if (ext.includes('stl')) return 'STL';
    if (ext.includes('obj')) return 'OBJ';
    if (ext.includes('3mf')) return '3MF';
    if (ext.includes('step') || ext.includes('stp')) return 'STEP';
    if (ext.includes('glb')) return 'GLB';
    if (ext.includes('gltf')) return 'GLTF';
    return tipo.toUpperCase();
  };

  const handleDownload = (arquivo: Arquivo3D) => {
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
                {getFormatLabel(arquivo.tipo)} • {formatFileSize(arquivo.tamanho)}
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
                Visualizar 3D
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

      {/* Modal de Preview 3D */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(previewFile.tipo)}</span>
                <div>
                  <h3 className="font-semibold text-lg">{previewFile.nome}</h3>
                  <p className="text-sm text-gray-500">
                    {getFormatLabel(previewFile.tipo)} • {formatFileSize(previewFile.tamanho)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Arraste para rotacionar • Scroll para zoom
                </span>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 3D Viewer Content */}
            <div className="flex-1 overflow-hidden" style={{ minHeight: '500px' }}>
              <ThreeViewer
                fileUrl={previewFile.url}
                fileName={previewFile.nome}
                fileType={previewFile.tipo}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> Rotacionar</span>
                <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Zoom</span>
                <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" /> Pan</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setPreviewFile(null)}>
                  Fechar
                </Button>
                <Button onClick={() => handleDownload(previewFile)} className="gap-2">
                  <Download className="w-4 h-4" />
                  Baixar Arquivo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
