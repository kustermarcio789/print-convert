import React, { useState } from 'react';
import { 
  FileText, Image as ImageIcon, File, Download, X, 
  ZoomIn, ZoomOut, RotateCw, Maximize2
} from 'lucide-react';

interface FileViewerProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string; // Base64 or URL
    uploadedAt: Date;
  };
  onClose?: () => void;
}

export default function FileViewer({ file, onClose }: FileViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-6 w-6" />;
    } else {
      return <File className="h-6 w-6" />;
    }
  };

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const isSTL = file.name.toLowerCase().endsWith('.stl');
  const isOBJ = file.name.toLowerCase().endsWith('.obj');
  const is3DModel = isSTL || isOBJ || file.name.toLowerCase().endsWith('.3mf') || 
                    file.name.toLowerCase().endsWith('.gcode');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-600">
                {(file.size / 1024).toFixed(2)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  title="Diminuir zoom"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  title="Girar"
                >
                  <RotateCw className="h-5 w-5" />
                </button>
              </>
            )}

            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {isImage && (
            <div className="flex items-center justify-center min-h-full">
              <img
                src={file.url}
                alt={file.name}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                className="object-contain"
              />
            </div>
          )}

          {isPDF && (
            <iframe
              src={file.url}
              className="w-full h-full min-h-[600px] border-0"
              title={file.name}
            />
          )}

          {is3DModel && (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-white rounded-lg border-2 border-dashed border-gray-300">
              <File className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Modelo 3D</p>
              <p className="text-sm text-gray-600 mb-4">{file.name}</p>
              <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
                Para visualizar este modelo 3D, faça o download e abra em um software compatível 
                (ex: Cura, PrusaSlicer, Meshmixer)
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-5 w-5" />
                Baixar Modelo
              </button>
            </div>
          )}

          {!isImage && !isPDF && !is3DModel && (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <File className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Arquivo</p>
              <p className="text-sm text-gray-600 mb-6">{file.name}</p>
              <p className="text-sm text-gray-500 mb-6">
                Pré-visualização não disponível para este tipo de arquivo
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-5 w-5" />
                Baixar Arquivo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Tipo:</span> {file.type || 'Desconhecido'}
            </div>
            <div>
              <span className="font-medium">Enviado em:</span>{' '}
              {new Date(file.uploadedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
