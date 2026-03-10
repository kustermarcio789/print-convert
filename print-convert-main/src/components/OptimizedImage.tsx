import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagem otimizado com lazy loading e fallback
 * Suporta múltiplos formatos (WebP, PNG, JPG)
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Se a imagem é uma URL de dados (base64), usar diretamente
    if (src.startsWith('data:')) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // Tentar carregar em formato WebP primeiro (mais eficiente)
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    const img = new Image();
    img.onload = () => {
      setImageSrc(webpSrc);
      setIsLoading(false);
      onLoad?.();
    };
    img.onerror = () => {
      // Se WebP não funcionar, usar a imagem original
      setImageSrc(src);
      setIsLoading(false);
      onLoad?.();
    };
    img.src = webpSrc;
  }, [src, onLoad]);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Erro ao carregar imagem</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc || src}
      alt={alt}
      className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      width={width}
      height={height}
      loading={loading}
      onError={handleError}
      onLoad={() => {
        setIsLoading(false);
        onLoad?.();
      }}
    />
  );
}

export default OptimizedImage;
