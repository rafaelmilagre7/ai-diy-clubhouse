
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoggingProvider } from './hooks/useLogging';
import { AuthProvider } from './contexts/auth';
import { AppRoutes } from './routes';

// Criar uma instância do QueryClient fora do componente para evitar recriação a cada render
// Com configurações otimizadas para melhor caching e performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false, // Desativado para reduzir chamadas desnecessárias
      refetchOnMount: true, // Ativo apenas no primeiro mount
    },
  },
});

const App = () => {
  // Removido console.log que afeta performance em produção
  
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
            {/* Devtools disponível apenas em dev */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </AuthProvider>
        </LoggingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
