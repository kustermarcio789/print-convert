import React, { useEffect, useRef } from 'react';
import { Maximize2, RotateCw, Move, ZoomIn, Info } from 'lucide-react';

interface Model3DViewerProps {
  modelUrl: string;
  alt?: string;
  poster?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
  className?: string;
}

export default function Model3DViewer({
  modelUrl,
  alt = 'Modelo 3D',
  poster,
  autoRotate = true,
  cameraControls = true,
  ar = true,
  className = ''
}: Model3DViewerProps) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    // Carregar script do model-viewer se ainda não estiver carregado
    if (!customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  const handleFullscreen = () => {
    if (viewerRef.current) {
      if (viewerRef.current.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      }
    }
  };

  const handleResetCamera = () => {
    if (viewerRef.current) {
      viewerRef.current.resetTurntableRotation();
      viewerRef.current.cameraOrbit = '0deg 75deg 105%';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* @ts-ignore */}
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        alt={alt}
        poster={poster}
        shadow-intensity="1"
        camera-controls={cameraControls}
        auto-rotate={autoRotate}
        ar={ar}
        ar-modes="webxr scene-viewer quick-look"
        environment-image="neutral"
        exposure="1"
        shadow-softness="0.5"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          backgroundColor: '#f3f4f6'
        }}
      >
        {/* Controles personalizados */}
        <div 
          slot="progress-bar" 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '4px',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              height: '100%',
              backgroundColor: '#3b82f6',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Botões de controle */}
        <div 
          className="absolute top-4 right-4 flex flex-col gap-2"
          style={{ zIndex: 10 }}
        >
          <button
            onClick={handleFullscreen}
            className="p-2 bg-white rounded-md shadow-md hover:bg-gray-100 transition-colors"
            title="Tela cheia"
          >
            <Maximize2 className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={handleResetCamera}
            className="p-2 bg-white rounded-md shadow-md hover:bg-gray-100 transition-colors"
            title="Resetar câmera"
          >
            <RotateCw className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Instruções */}
        <div 
          className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-md shadow-md p-3 max-w-xs"
          style={{ zIndex: 10 }}
        >
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700">
              <p className="font-medium mb-1">Como usar:</p>
              <ul className="space-y-1">
                <li>• Arraste para rotacionar</li>
                <li>• Scroll para zoom</li>
                <li>• Dois dedos para mover</li>
                {ar && <li>• Clique no ícone AR para ver em seu espaço</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Botão AR (se suportado) */}
        {ar && (
          <button
            slot="ar-button"
            className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            style={{ zIndex: 10 }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Ver em AR
          </button>
        )}
      </model-viewer>
    </div>
  );
}

// Componente alternativo para quando não há modelo 3D
export function Model3DPlaceholder({ message = 'Modelo 3D não disponível' }: { message?: string }) {
  return (
    <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg flex flex-col items-center justify-center p-8">
      <div className="w-24 h-24 mb-4 rounded-full bg-gray-200 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      <p className="text-gray-600 text-center">{message}</p>
      <p className="text-sm text-gray-500 text-center mt-2">
        Formatos suportados: GLB, GLTF
      </p>
    </div>
  );
}
