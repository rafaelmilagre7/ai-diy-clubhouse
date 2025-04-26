
import React, { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoggingProvider } from './hooks/useLogging';
import { AuthProvider } from './contexts/auth';
import { AppRoutes } from './routes';

// Criar uma instância do QueryClient fora do componente com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      // Novas configurações para melhorar a performance
      refetchOnReconnect: 'always',
      gcTime: 1000 * 60 * 30, // 30 minutos (substituindo cacheTime que está obsoleto)
    },
  },
});

// Lazy loading do ReactQueryDevtools para reduzir o bundle principal
const ReactQueryDevToolsLazy = lazy(() => 
  process.env.NODE_ENV === 'development' 
    ? import('@tanstack/react-query-devtools').then(({ ReactQueryDevtools }) => ({
        default: ReactQueryDevtools,
      }))
    : Promise.resolve({ default: () => null })
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LoggingProvider>
          <AuthProvider>
            <AppRoutes />
            
            {/* Configuração simplificada do Toaster */}
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: { zIndex: 9999 },
                className: "z-50"
              }}
              closeButton
              richColors
              expand={false}
              visibleToasts={3}
              duration={3000}
            />
            
            {/* Carregamento condicional e lazy do ReactQueryDevtools */}
            {process.env.NODE_ENV === 'development' && (
              <Suspense fallback={null}>
                <ReactQueryDevToolsLazy initialIsOpen={false} />
              </Suspense>
            )}
          </AuthProvider>
        </LoggingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
