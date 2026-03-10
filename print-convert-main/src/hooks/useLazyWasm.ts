import { useEffect, useState } from 'react';

/**
 * Hook para carregar o arquivo WASM de forma assíncrona
 * Evita bloquear o carregamento inicial da página
 */
export function useLazyWasm() {
  const [wasmLoaded, setWasmLoaded] = useState(false);
  const [wasmError, setWasmError] = useState<string | null>(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        // Carregar o arquivo WASM dinamicamente
        const response = await fetch('/occt-import-js.wasm');
        if (!response.ok) {
          throw new Error(`Erro ao carregar WASM: ${response.statusText}`);
        }
        
        // Aguardar o carregamento completo
        await response.arrayBuffer();
        setWasmLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar WASM:', error);
        setWasmError(error instanceof Error ? error.message : 'Erro desconhecido');
      }
    };

    // Usar requestIdleCallback para não bloquear o thread principal
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadWasm());
    } else {
      // Fallback para navegadores que não suportam requestIdleCallback
      setTimeout(loadWasm, 2000);
    }
  }, []);

  return { wasmLoaded, wasmError };
}
