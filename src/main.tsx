
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SimpleAuthProvider } from '@/contexts/auth/SimpleAuthProvider';
import { LoggingProvider } from '@/hooks/useLogging';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Validação de segurança - apenas em desenvolvimento
import { securityValidator } from './utils/securityValidator';

if (import.meta.env.DEV) {
  try {
    securityValidator.generateSecurityReport();
  } catch (error) {
    console.warn('Erro na validação de segurança:', error);
  }
}

// Criar QueryClient com configuração otimizada
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LoggingProvider>
          <SimpleAuthProvider>
            <App />
            <Toaster />
          </SimpleAuthProvider>
        </LoggingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
