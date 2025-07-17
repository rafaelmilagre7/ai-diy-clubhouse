
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth';
import { SecurityEnforcementProvider } from '@/components/security/SecurityEnforcementProvider';
import { AppRoutes } from '@/routes';
import { SEOWrapper } from '@/components/seo/SEOWrapper';
// OnboardingFixer removido - causava loops infinitos

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2
    }
  }
});

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SecurityEnforcementProvider>
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
            </SecurityEnforcementProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
