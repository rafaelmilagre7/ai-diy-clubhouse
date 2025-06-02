
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
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'chart-vendor': ['recharts'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],
          // Feature chunks
          'admin': [/src\/components\/admin/, /src\/pages\/admin/],
          'learning': [/src\/components\/learning/, /src\/pages\/member\/learning/],
          'community': [/src\/components\/community/, /src\/pages\/member\/community/],
          'networking': [/src\/components\/networking/, /src\/pages\/member\/networking/],
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
