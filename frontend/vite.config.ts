import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: {
      overlay: false,
    },
    allowedHosts: [
      "localhost",
      ".preview.emergentagent.com",
      ".preview.emergentcf.cloud",
      ".manus.computer"
    ],
  },
  preview: {
    host: "0.0.0.0",
    port: 4175,
    allowedHosts: [
      "localhost",
      ".manus.computer"
    ],
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Aumentar o limite de aviso de chunk para 1MB (padrão é 500KB)
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        
        // Estratégia de divisão de chunks para melhor performance
        manualChunks: {
          // Separar bibliotecas pesadas em chunks próprios
          'three': ['three'],
          'model-viewer': ['@google/model-viewer'],
          'html2canvas': ['html2canvas'],
          'framer-motion': ['framer-motion'],
          'recharts': ['recharts'],
          
          // Agrupar componentes de UI do Radix
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          
          // Agrupar dependências de formulário
          'form-libs': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],
          
          // Agrupar dependências de data
          'date-libs': [
            'date-fns',
            'react-day-picker',
          ],
          

        },
      },
    },
    
    // Otimizações adicionais
    minify: 'esbuild',
  },
}));
