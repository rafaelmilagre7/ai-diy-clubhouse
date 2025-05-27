import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoggingProvider } from './hooks/useLogging';
import { AuthProvider } from './contexts/auth';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/sonner';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/common/ErrorBoundary';
import AuthErrorBoundary from './components/common/AuthErrorBoundary';
import RouteErrorBoundary from './components/common/RouteErrorBoundary';
import AsyncErrorBoundary from './components/common/AsyncErrorBoundary';
import { PerformanceProvider } from './contexts/performance/PerformanceProvider';

// Criar uma instância do QueryClient fora do componente para evitar recriação a cada render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function App() {
  // Handler para erros de autenticação
  const handleAuthError = () => {
    // Limpar dados de auth local se necessário
    localStorage.removeItem('supabase.auth.token');
  };

  // Handler para erros de rota
  const handleRouteError = (error: Error) => {
    console.error('Erro de roteamento capturado:', error);
  };

  // Handler para erros assíncronos
  const handleAsyncError = (error: Error) => {
    console.error('Erro assíncrono capturado:', error);
  };

  return (
    <HelmetProvider>
      <ErrorBoundary
        maxRetries={3}
        showDetails={import.meta.env.DEV}
        resetOnLocationChange={true}
      >
        <QueryClientProvider client={queryClient}>
          <PerformanceProvider
            enableAutoAlerts={true}
            alertThresholds={{
              slowQueryMs: 3000,
              highErrorRate: 10,
              lowCacheHitRate: 50
            }}
          >
            <AsyncErrorBoundary
              onAsyncError={handleAsyncError}
              maxRetries={2}
              autoRetry={true}
              retryDelay={3000}
            >
              <BrowserRouter>
                <RouteErrorBoundary
                  onRouteError={handleRouteError}
                  fallbackRoute="/dashboard"
                >
                  <AuthErrorBoundary
                    onAuthError={handleAuthError}
                    redirectToLogin={true}
                  >
                    <LoggingProvider>
                      <AuthProvider>
                        <AppRoutes />
                        <Toaster position="top-right" richColors closeButton />
                        <ReactQueryDevtools initialIsOpen={false} />
                      </AuthProvider>
                    </LoggingProvider>
                  </AuthErrorBoundary>
                </RouteErrorBoundary>
              </BrowserRouter>
            </AsyncErrorBoundary>
          </PerformanceProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
