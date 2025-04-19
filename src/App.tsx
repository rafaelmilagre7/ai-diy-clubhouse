
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { LoggingProvider } from './hooks/useLogging';
import AppRoutes from './components/routing/AppRoutes';
import { Toaster } from './components/ui/toaster';
import AuthSession from './components/auth/AuthSession';
import { Toaster as SonnerToaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Criando a instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoggingProvider>
          <Router>
            <AuthSession />
            <AppRoutes />
            <Toaster />
            <SonnerToaster position="top-right" richColors />
          </Router>
        </LoggingProvider>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
