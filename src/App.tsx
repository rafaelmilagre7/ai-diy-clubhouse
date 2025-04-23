
import { Toaster } from 'sonner';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/auth';
import ErrorBoundary from './components/ErrorBoundary';
import { LoggingProvider } from './hooks/useLogging.tsx';

function App() {
  return (
    <ErrorBoundary>
      <LoggingProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </LoggingProvider>
    </ErrorBoundary>
  );
}

export default App;
