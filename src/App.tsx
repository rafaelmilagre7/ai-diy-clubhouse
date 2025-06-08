
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/contexts/auth";
import { Toaster } from "@/components/ui/sonner";
import { memberRoutes } from "@/routes/MemberRoutes";
import { adminRoutes } from "@/routes/AdminRoutes";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rotas de membros */}
            {memberRoutes.map((route, index) => (
              <Route key={`member-${index}`} path={route.path} element={route.element} />
            ))}
            
            {/* Rotas de admin */}
            {adminRoutes.map((route, index) => (
              <Route key={`admin-${index}`} path={route.path} element={route.element} />
            ))}
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
