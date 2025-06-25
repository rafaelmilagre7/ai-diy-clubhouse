
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/auth';
import { LoggingProvider } from '@/hooks/useLogging';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Inicialização otimizada para desenvolvimento
import { securityValidator } from './utils/securityValidator';

// Validar segurança de forma não-bloqueante
if (import.meta.env.DEV) {
  // Executar validação de forma assíncrona para não bloquear inicialização
  setTimeout(() => {
    securityValidator.generateSecurityReport();
  }, 2000);
}

// Configurar QueryClient mais leve para desenvolvimento
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: import.meta.env.DEV ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 min dev, 5 min prod
      retry: import.meta.env.DEV ? 0 : 1, // Sem retry em dev
      refetchOnWindowFocus: false, // Evitar refetch desnecessário
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
