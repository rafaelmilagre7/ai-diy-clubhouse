
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Otimizações de bundle
    rollupOptions: {
      output: {
        // Divisão manual de chunks para melhor cache
        manualChunks: (id: string) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('yup')) {
              return 'form-vendor';
            }
          }
          
          // Feature chunks
          if (id.includes('src/components/admin') || id.includes('src/pages/admin')) {
            return 'admin';
          }
          if (id.includes('src/components/learning') || id.includes('src/pages/member/learning')) {
            return 'learning';
          }
          if (id.includes('src/components/community') || id.includes('src/pages/member/community')) {
            return 'community';
          }
          if (id.includes('src/components/networking') || id.includes('src/pages/member/networking')) {
            return 'networking';
          }
          
          return undefined;
        },
        // Nomeação consistente para melhor cache
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'chunk';
            return `assets/${fileName}-[hash].js`;
          }
          return 'assets/chunk-[hash].js';
        },
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Compressão e minificação
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.warn'] : [],
      },
    },
    // Tamanho do chunk
    chunkSizeWarningLimit: 1000,
    // Source maps apenas em desenvolvimento
    sourcemap: mode === 'development',
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
}));
