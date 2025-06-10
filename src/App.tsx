
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { LoadingProvider } from "./contexts/LoadingContext";
import OptimizedLoadingScreen from "@/components/common/OptimizedLoadingScreen";
import RootRedirect from "@/components/routing/RootRedirect";
import AuthLayout from "@/components/auth/AuthLayout";
import MemberDashboard from "@/pages/member/Dashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminSolutions from "@/pages/admin/AdminSolutions";
import SolutionDetails from "@/pages/member/SolutionDetails";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import FormacaoDashboard from "@/pages/formacao/FormacaoDashboard";
import OptimizedDashboard from "@/pages/member/OptimizedDashboard";
import AdminLayout from "@/components/layout/admin/AdminLayout";

// Query client otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<OptimizedLoadingScreen />}>
                <Routes>
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/login" element={<AuthLayout />} />
                  <Route path="/onboarding" element={<OnboardingWizard />} />
                  
                  {/* Rotas de Membro */}
                  <Route path="/dashboard" element={<OptimizedDashboard />} />
                  <Route path="/solution/:id" element={<SolutionDetails />} />
                  
                  {/* Rota de Formacao */}
                  <Route path="/formacao" element={<FormacaoDashboard />} />
                  
                  {/* Rotas de Admin - Agora com AdminLayout */}
                  <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                  <Route path="/admin/solutions" element={<AdminLayout><AdminSolutions /></AdminLayout>} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
