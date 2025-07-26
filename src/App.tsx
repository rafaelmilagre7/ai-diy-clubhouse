
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { LoggingProvider } from "@/hooks/useLogging";
import { AppRoutes } from "@/routes";
import { PerformanceDashboard } from "@/components/dev/PerformanceDashboard";

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
      <TooltipProvider>
        <LoggingProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background font-sans antialiased">
                <AppRoutes />
                <Toaster />
                <Sonner />
                {/* Dashboard de performance apenas em desenvolvimento */}
                <PerformanceDashboard />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </LoggingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
