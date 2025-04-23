
import { Toaster } from 'sonner';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/auth';
import ErrorBoundary from './components/ErrorBoundary';
import { LoggingProvider } from './hooks/useLogging.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Criar uma instância do QueryClient para toda a aplicação
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000, // 1 minuto antes de considerar os dados obsoletos
      gcTime: 5 * 60 * 1000, // 5 minutos antes de remover dados do cache
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LoggingProvider>
          <AuthProvider>
            <AppRoutes />
            {/* Usando apenas um toaster para toda a aplicação */}
            <Toaster 
              position="top-right" 
              richColors 
              closeButton 
              duration={3000} // 3 segundos de duração padrão
              toastOptions={{
                className: 'toast-custom-class',
                style: {
                  background: 'white',
                  color: 'black',
                }
              }}
              visibleToasts={2}
              pauseWhenPageIsHidden
            />
          </AuthProvider>
        </LoggingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
