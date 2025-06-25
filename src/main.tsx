
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/auth';
import { LoggingProvider } from '@/hooks/useLogging';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// CORREÇÃO: Inicialização com limpeza de cache em caso de erro
import { checkAndFixAssets } from './utils/authCleanup';

// Verificar assets na inicialização
const initializeApp = () => {
  console.log('[MAIN] Verificando integridade da aplicação');
  
  // Verificar se há problemas de assets
  const assetsOk = checkAndFixAssets();
  
  if (!assetsOk) {
    console.log('[MAIN] Problemas de assets detectados, correção automática iniciada');
    return; // checkAndFixAssets já força reload se necessário
  }
  
  console.log('[MAIN] Assets OK, iniciando aplicação');
};

// Executar verificação inicial
initializeApp();

// Configurar QueryClient otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: import.meta.env.DEV ? 1 * 60 * 1000 : 5 * 60 * 1000,
      retry: import.meta.env.DEV ? 0 : 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LoggingProvider>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </LoggingProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
