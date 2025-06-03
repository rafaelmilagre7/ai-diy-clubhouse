
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth';
import { LayoutProvider } from '@/components/layout/LayoutProvider';
import { AppRoutes } from '@/routes/index';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/common/ErrorFallback';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PerformanceProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <BrowserRouter>
              <AuthProvider>
                <LayoutProvider>
                  <AppRoutes />
                  <Toaster position="top-right" />
                </LayoutProvider>
              </AuthProvider>
            </BrowserRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}

export default App;
