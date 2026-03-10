import { useEffect, useRef } from 'react';
import '@google/model-viewer';

interface ModelViewer3DProps {
  src: string;
  alt?: string;
  poster?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export default function ModelViewer3D({
  src,
  alt = 'Modelo 3D',
  poster,
  autoRotate = true,
  cameraControls = true,
  className = '',
  style = {}
}: ModelViewer3DProps) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    // Garantir que o model-viewer está carregado
    if (viewerRef.current) {
      viewerRef.current.addEventListener('load', () => {
        console.log('Modelo 3D carregado com sucesso');
      });

      viewerRef.current.addEventListener('error', (event: any) => {
        console.error('Erro ao carregar modelo 3D:', event);
      });
    }
  }, []);

  return (
    <model-viewer
      ref={viewerRef}
      src={src}
      alt={alt}
      poster={poster}
      auto-rotate={autoRotate}
      camera-controls={cameraControls}
      shadow-intensity="1"
      exposure="1"
      shadow-softness="0.5"
      environment-image="neutral"
      className={`w-full h-full ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        ...style
      }}
    >
      <div slot="progress-bar" className="progress-bar">
        <div className="update-bar"></div>
      </div>
    </model-viewer>
  );
}
