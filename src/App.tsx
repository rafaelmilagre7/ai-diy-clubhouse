
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ToasterProvider } from "@/components/layout/ToasterProvider";
import { AuthProvider } from "@/contexts/auth";
import { LoggingProvider } from "@/contexts/logging";
import LoadingScreen from "@/components/common/LoadingScreen";
import RootRedirect from "@/components/routing/RootRedirect";
import Auth from "@/pages/Auth";

// Lazy loading de páginas
const NotFound = lazy(() => import("@/pages/NotFound"));
const Index = lazy(() => import("@/pages/Index"));

// Member Routes
const Dashboard = lazy(() => import("@/pages/member/Dashboard"));
const Solutions = lazy(() => import("@/pages/member/Solutions"));
const SolutionDetails = lazy(() => import("@/pages/member/SolutionDetails"));
const SolutionImplementation = lazy(() => import("@/pages/member/SolutionImplementation"));
const Profile = lazy(() => import("@/pages/member/Profile"));
const Tools = lazy(() => import("@/pages/member/Tools"));
const ToolDetails = lazy(() => import("@/pages/member/ToolDetails"));
const Suggestions = lazy(() => import("@/pages/member/Suggestions"));
const SuggestionDetails = lazy(() => import("@/pages/member/SuggestionDetails"));
const NewSuggestion = lazy(() => import("@/pages/member/NewSuggestion"));
const Achievements = lazy(() => import("@/pages/member/Achievements"));

// Admin Routes
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));

// Importação de arquivos de rotas
import AppRoutes from "@/components/routing/AppRoutes";
import { AdminRoutes } from "@/components/routing/AdminRoutes";

// Create a client
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
                
                {/* Auth Routes */}
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/reset-password" element={<Auth />} />
                <Route path="/reset-password/update" element={<Auth />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminRoutes />
                  </Suspense>
                } />
                
                {/* Member Routes */}
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
