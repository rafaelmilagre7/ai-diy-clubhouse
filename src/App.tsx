
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OptimizedAuthProvider } from "@/contexts/auth/OptimizedAuthContext";
import AppRoutes from "@/routes/AppRoutes";
import LayoutProvider from "@/components/layout/LayoutProvider";

// OTIMIZAÇÃO: Query client com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000,   // 10 minutos
      retry: 1,                 // Menos tentativas para carregamento mais rápido
      refetchOnWindowFocus: false, // Não refetch ao focar janela
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OptimizedAuthProvider>
          <TooltipProvider>
            <LayoutProvider>
              <AppRoutes />
            </LayoutProvider>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </OptimizedAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
