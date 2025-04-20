
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ToasterProvider } from "@/components/layout/ToasterProvider";
import { AuthProvider } from "@/contexts/auth";
import { LoggingProvider } from "@/hooks/useLogging";
import LoadingScreen from "@/components/common/LoadingScreen";
import RootRedirect from "@/components/routing/RootRedirect";
import Auth from "@/pages/Auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy loading de páginas
const NotFound = lazy(() => import("@/pages/NotFound"));
const Index = lazy(() => import("@/pages/Index"));
const EditProfile = lazy(() => import("@/pages/member/EditProfile"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const SetNewPassword = lazy(() => import("@/pages/auth/SetNewPassword"));

// Admin Routes
const AdminRoutes = lazy(() => import("@/components/routing/AdminRoutes").then(module => ({
  default: module.AdminRoutes
})));

// Member Routes
import { MemberRoutes } from "@/components/routing/MemberRoutes";

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
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/update" element={<SetNewPassword />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <Suspense fallback={<LoadingScreen />}>
                        <AdminRoutes />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Member Routes */}
                <Route 
                  path="/*" 
                  element={
                    <ProtectedRoute>
                      <MemberRoutes />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
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
