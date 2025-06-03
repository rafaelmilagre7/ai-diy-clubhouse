
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth/AuthProvider';
import { ErrorBoundary } from 'react-error-boundary';
import RouteErrorBoundary from '@/components/common/RouteErrorBoundary';
import AppRoutes from '@/routes/AppRoutes';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Fallback para erros gerais
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
      <p className="text-muted-foreground mb-4">Ocorreu um erro inesperado na aplicação.</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        Tentar novamente
      </button>
    </div>
  </div>
);

function App() {
  console.log('App: Inicializando aplicação principal');

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <RouteErrorBoundary>
              <AppRoutes />
            </RouteErrorBoundary>
            
            <Toaster 
              position="top-right" 
              expand={true}
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
        
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
