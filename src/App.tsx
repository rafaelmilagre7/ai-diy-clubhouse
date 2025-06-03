
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth';
import { LoggingProvider } from '@/contexts/logging';
import { PerformanceProvider } from '@/contexts/performance/PerformanceProvider';
import LayoutProviderNew from '@/components/layout/LayoutProviderNew';
import { useServiceWorker } from '@/hooks/common/useServiceWorker';
import { useBundleAnalyzer } from '@/utils/bundleAnalyzer';
import { initializeBrandAssetsBucket } from '@/utils/storage/initStorage';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import './App.css';

// Configuração otimizada do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (novo nome para cacheTime)
      retry: (failureCount, error: any) => {
        // Não tentar novamente para erros 4xx
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Componente interno que usa os hooks
const AppContent: React.FC = () => {
  useServiceWorker();
  const { analyzePerformance } = useBundleAnalyzer();

  useEffect(() => {
    // Inicializar storage bucket para brand assets
    initializeBrandAssetsBucket();
    
    // Analisar performance após carregamento
    const timer = setTimeout(() => {
      if (import.meta.env.DEV) {
        analyzePerformance();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [analyzePerformance]);

  return <LayoutProviderNew />;
};

function App() {
  return (
    <ErrorBoundary>
      <PerformanceProvider>
        <LoggingProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Router>
                <AppContent />
                <Toaster />
                {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
              </Router>
            </AuthProvider>
          </QueryClientProvider>
        </LoggingProvider>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}

export default App;
