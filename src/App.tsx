
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth';
import { LoggingProvider } from '@/hooks/useLogging';
import { AppRoutes } from '@/routes';
import { SEOWrapper } from '@/components/seo/SEOWrapper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2
    }
  }
});

function App() {
  console.log("🚀 [APP] Iniciando aplicação...");
  
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoggingProvider>
            {/* SecurityEnforcementProvider temporariamente removido para debug de loop */}
            <Router>
              <SEOWrapper>
                <div className="App">
                  <AppRoutes />
                  <Toaster 
                    position="top-right"
                    theme="dark"
                    richColors
                    expand
                    visibleToasts={3}
                  />
                  <ReactQueryDevtools initialIsOpen={false} />
                </div>
              </SEOWrapper>
            </Router>
          </LoggingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
