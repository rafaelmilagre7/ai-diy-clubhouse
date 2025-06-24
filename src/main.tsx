
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/auth';
import { LoggingProvider } from '@/hooks/useLogging';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Inicialização com validação de segurança
import { securityValidator } from './utils/securityValidator';

// Validar segurança antes de inicializar a aplicação
if (import.meta.env.DEV) {
  securityValidator.generateSecurityReport();
}

// Criar QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
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
