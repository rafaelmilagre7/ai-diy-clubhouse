
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/auth";
import { LoggingProvider } from "@/hooks/useLogging";
import { AppRoutes } from "@/routes";
import { RealtimeWrapper } from "@/components/auth/RealtimeWrapper";
import { PerformanceDashboard } from "@/components/dev/PerformanceDashboard";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { RealtimeProviderV2 } from "@/contexts/RealtimeProviderV2";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutos (aumentado)
      gcTime: 30 * 60 * 1000, // 30 minutos (aumentado)
      refetchOnWindowFocus: false, // Desabilitar refetch no foco
      retry: 1, // Reduzir tentativas
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <AuthProvider>
            <SecurityProvider>
              <RealtimeProviderV2
                enableNotifications={true}  // Fase 1: ✅ ATIVA
                enablePresence={true}       // Fase 2: ✅ ATIVA
                enableChat={true}           // Fase 3: ✅ ATIVA
                enableSound={true}
                enableDesktopNotifications={true}
              >
                <RealtimeWrapper>
                  <LoggingProvider>
                    <BrowserRouter>
                      <div className="min-h-screen bg-background font-sans antialiased">
                        <AppRoutes />
                        <Sonner />
                        {/* Dashboard de performance apenas em desenvolvimento */}
                        <PerformanceDashboard />
                      </div>
                    </BrowserRouter>
                  </LoggingProvider>
                </RealtimeWrapper>
              </RealtimeProviderV2>
            </SecurityProvider>
          </AuthProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
