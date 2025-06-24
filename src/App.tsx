
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";

import SolutionDetails from "./pages/member/SolutionDetails";
import SolutionImplementation from "./pages/member/SolutionImplementation";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/common/LoadingScreen";

import { useAuth } from "./contexts/auth";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";

const queryClient = new QueryClient();

function AppRouter() {
  const { user, isLoading } = useAuth();
  const { log } = useLogging();
  const location = useLocation();

  useEffect(() => {
    log("Route changed", { path: location.pathname });
  }, [location.pathname, log]);

  if (isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <>
      <PageTransition>
        <Routes>
          <Route path="/solution/:id" element={<SolutionDetails />} />
          <Route path="/implement/:id" element={<SolutionImplementation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
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
