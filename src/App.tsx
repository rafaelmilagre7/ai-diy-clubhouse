
import AppRoutes from './routes';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import { LoggingProvider } from './hooks/useLogging.tsx';
import { AuthProvider } from './contexts/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';

function App() {
  console.log("App renderizando");
  
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
