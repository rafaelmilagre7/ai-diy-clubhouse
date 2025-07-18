
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth';
import { LoggingProvider } from '@/hooks/useLogging';
import { SecurityEnforcementProvider } from '@/components/security/SecurityEnforcementProvider';

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
          <LoggingProvider>
            <SecurityEnforcementProvider>
              <div style={{ padding: 40, color: "green", fontSize: "24px" }}>
                APP funcionando com SecurityEnforcementProvider
              </div>
            </SecurityEnforcementProvider>
          </LoggingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
