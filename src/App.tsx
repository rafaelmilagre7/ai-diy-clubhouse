
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth';
import { LoggingProvider } from '@/contexts/logging';
import { AppRoutes } from '@/routes';

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoggingProvider>
          <Router>
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
          </Router>
        </LoggingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
