
import React from 'react';
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
      refetchOnMount: false, // Não buscar novamente ao montar, usar o cache
      refetchOnReconnect: false, // Não buscar novamente ao reconectar, evitar recarregamentos
      gcTime: 1000 * 60 * 60, // 60 minutos (substituindo cacheTime que está obsoleto)
    },
  },
});

// ReactQueryDevtools será carregado apenas no ambiente de desenvolvimento
const ReactQueryDevToolsLazy = process.env.NODE_ENV === 'development' 
  ? React.lazy(() => import('@tanstack/react-query-devtools').then(
      ({ ReactQueryDevtools }) => ({ default: ReactQueryDevtools })
    ))
  : null;

// Pré-carregar dados comuns que serão usados em várias páginas
const prefetchCommonData = () => {
  // Pré-carregar dados comuns aqui
  console.log('Pré-carregando dados comuns para a aplicação...');
};

const App = () => {
  // Executar prefetch ao iniciar a aplicação
  React.useEffect(() => {
    prefetchCommonData();
  }, []);

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
            
            {/* Carregamento condicional do ReactQueryDevtools apenas em desenvolvimento */}
            {ReactQueryDevToolsLazy && process.env.NODE_ENV === 'development' && (
              <React.Suspense fallback={null}>
                <ReactQueryDevToolsLazy initialIsOpen={false} />
              </React.Suspense>
            )}
          </AuthProvider>
        </LoggingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
