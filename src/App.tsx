
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoggingProvider } from './hooks/useLogging';
import { AuthProvider } from './contexts/auth/AuthProvider'; // Usar apenas este provider
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/sonner';

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
  console.log("App.tsx renderizando - versão unificada");
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LoggingProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" richColors closeButton />
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </LoggingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
