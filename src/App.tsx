
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth';
import { LoggingProvider } from '@/hooks/useLogging';
import { AuthenticatedSessionManager } from '@/components/auth/AuthenticatedSessionManager';
import { AppRoutes } from '@/routes';
import { SEOWrapper } from '@/components/seo/SEOWrapper';
import EmergencyFallback from '@/components/debug/EmergencyFallback';
import EmergencyLoginFallback from '@/components/common/EmergencyLoginFallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2
    }
  }
});

function App() {
  console.log("🚀 [APP] Iniciando aplicação sem dependências circulares...");
  
  // DETECTOR DE LOOP - Se a app não renderizar em 5 segundos, forçar fallback
  React.useEffect(() => {
    const loopDetector = setTimeout(() => {
      console.error("🚨 [APP] DETECTOR DE LOOP - App não renderizou em 5s - forçando fallback");
      // Criar um elemento de fallback e anexar ao DOM diretamente
      const fallbackDiv = document.createElement('div');
      fallbackDiv.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; color: white; font-family: system-ui;">
          <div style="text-align: center; padding: 2rem; border: 1px solid #333; border-radius: 8px;">
            <h2 style="color: #ef4444; margin-bottom: 1rem;">Loop Detectado</h2>
            <p style="margin-bottom: 1rem;">A aplicação travou em um loop de redirecionamento.</p>
            <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.href='/login';" 
                    style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
              Ir para Login
            </button>
          </div>
        </div>
      `;
      document.body.innerHTML = '';
      document.body.appendChild(fallbackDiv);
    }, 5000);
    
    return () => clearTimeout(loopDetector);
  }, []);
  
  try {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LoggingProvider>
              <AuthenticatedSessionManager />
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
  } catch (error) {
    console.error("🚨 [APP] Erro crítico na renderização:", error);
    // Se for erro relacionado a autenticação, mostrar fallback de login
    if (error?.message?.includes('auth') || error?.message?.includes('redirect')) {
      return <EmergencyLoginFallback />;
    }
    return <EmergencyFallback />;
  }
}

export default App;
