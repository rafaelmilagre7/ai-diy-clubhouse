
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/auth';
import ErrorBoundary from './components/ErrorBoundary';
import { LoggingProvider } from './hooks/useLogging.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
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
            <Toaster 
              position="bottom-right"
              expand={false}
              closeButton={false}
              richColors
              duration={2000}
              visibleToasts={1}
              className="!bg-transparent"
              toastOptions={{
                style: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '0.875rem',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }
              }}
            />
          </AuthProvider>
        </LoggingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
