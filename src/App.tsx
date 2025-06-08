import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Impersonate } from "./pages/Impersonate";
import { Admin } from "./pages/Admin";
import { SolutionPage } from "./pages/SolutionPage";
import { ImplementationPage } from "./pages/ImplementationPage";
import { PricingPage } from "./pages/PricingPage";
import { ModulePage } from "./pages/ModulePage";
import { OnboardingPage } from "@/pages/OnboardingPage";

const queryClient = new QueryClient();

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Oops! Algo deu errado</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Recarregar Página
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/impersonate/:id" element={<Impersonate />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/solution/:id" element={<SolutionPage />} />
              <Route path="/implementation/:solutionId" element={<ImplementationPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/module/:moduleId" element={<ModulePage />} />
              
              {/* Nova rota de onboarding */}
              <Route path="/onboarding" element={<OnboardingPage />} />
              
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
