
import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ToasterProvider } from "@/components/layout/ToasterProvider";
import { AuthProvider } from "@/contexts/auth";
import { LoggingProvider } from "@/hooks/useLogging";
import LoadingScreen from "@/components/common/LoadingScreen";
import RootRedirect from "@/components/routing/RootRedirect";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import ResetPassword from "@/pages/auth/ResetPassword";
import SetNewPassword from "@/pages/auth/SetNewPassword";
import NotFound from "@/pages/NotFound";

// Routes
import AppRoutes from "@/components/routing/AppRoutes";

// Criação do cliente QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <LoggingProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Landing e redirecionamento de raiz */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="/index" element={<Index />} />
                
                {/* Rotas de Autenticação */}
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/update" element={<SetNewPassword />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Todas as outras rotas são gerenciadas pelo AppRoutes */}
                <Route path="*" element={<AppRoutes />} />
              </Routes>
            </Suspense>
          </Router>
          <Toaster />
          <ToasterProvider />
        </QueryClientProvider>
      </LoggingProvider>
    </AuthProvider>
  );
}

export default App;
