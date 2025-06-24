import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Toaster } from "@/components/ui/toaster";

import Home from "./pages/Home";
import Solutions from "./pages/Solutions";
import SolutionDetails from "./pages/member/SolutionDetails";
import Implementation from "./pages/Implementation";
import Module from "./pages/Module";
import Pricing from "./pages/Pricing";
import Legal from "./pages/Legal";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/common/LoadingScreen";

import { useAuth } from "./contexts/auth";
import { useProfile } from "./hooks/useProfile";
import { useLogging } from "@/hooks/useLogging";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { PageTransition } from "@/components/transitions/PageTransition";
import SolutionImplementation from "@/pages/member/SolutionImplementation";

const queryClient = new QueryClient();

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { log } = useLogging();
  const location = useLocation();

  useEffect(() => {
    log("Route changed", { path: location.pathname });
  }, [location.pathname, log]);

  if (isLoading || profileLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  const isAdmin = profile?.user_roles?.name === "admin" || profile?.role === "admin";

  return (
    <>
      <SiteHeader />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/solution/:id" element={<SolutionDetails />} />
          <Route path="/implement/:id/:moduleIdx" element={<Module />} />
          <Route path="/implementation/:id/:moduleIdx" element={<Module />} /> {/* Deprecated route */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/implement/:id" element={<SolutionImplementation />} />

          {isAuthenticated && isAdmin && (
            <Route path="/admin/*" element={<Admin />} />
          )}
        </Routes>
      </PageTransition>
      <SiteFooter />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRouter />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
