import { useState } from 'react';
import { Maximize2, Minimize2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import ModelViewer3D from './ModelViewer3D';
import { Button } from '@/components/ui/button';

interface ProductViewer3DProps {
  modelUrl: string;
  productName: string;
  images?: string[];
  poster?: string;
}

export default function ProductViewer3D({
  modelUrl,
  productName,
  images = [],
  poster
}: ProductViewer3DProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <div className={`${isFullscreen ? 'h-screen' : 'h-[500px]'} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden`}>
        {/* Controles */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {images.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowModel(!showModel)}
              className="bg-white/90 hover:bg-white"
            >
              {showModel ? '🖼️ Fotos' : '🎨 Modelo 3D'}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-white/90 hover:bg-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Visualizador */}
        {showModel && modelUrl ? (
          <div className="w-full h-full">
            <ModelViewer3D
              src={modelUrl}
              alt={productName}
              poster={poster}
              autoRotate={true}
              cameraControls={true}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {images.length > 0 ? (
              <div className="relative w-full h-full">
                <img
                  src={images[currentImageIndex]}
                  alt={`${productName} - Imagem ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white w-8'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-lg">Nenhum modelo 3D ou imagem disponível</p>
              </div>
            )}
          </div>
        )}

        {/* Informações */}
        {showModel && modelUrl && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <p className="text-sm font-semibold text-gray-800">{productName}</p>
            <p className="text-xs text-gray-600 mt-1">
              🖱️ Arraste para rotacionar • 🔍 Scroll para zoom
            </p>
          </div>
        )}
      </div>

      {/* Miniaturas de imagens */}
      {images.length > 1 && !isFullscreen && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setShowModel(false);
              }}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                !showModel && index === currentImageIndex
                  ? 'border-primary scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {modelUrl && (
            <button
              onClick={() => setShowModel(true)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 ${
                showModel
                  ? 'border-primary scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">🎨</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
