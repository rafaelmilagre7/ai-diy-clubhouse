
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner'; // Usando Sonner para toasts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoggingProvider } from './hooks/useLogging';
import { AuthProvider } from './contexts/auth';
import { AppRoutes } from './routes';

// Criar uma instância do QueryClient fora do componente para evitar recriação a cada render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

const App = () => {
  console.log("Renderizando App.tsx");
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LoggingProvider>
          <AuthProvider>
            <AppRoutes />
            {/* Configuração do Toaster do Sonner para não bloquear cliques */}
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: { zIndex: 1000 },
                className: 'z-50 pointer-events-auto'
              }}
              closeButton
              richColors
              expand={false}
              visibleToasts={1}
              duration={3000}
            />
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </LoggingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
