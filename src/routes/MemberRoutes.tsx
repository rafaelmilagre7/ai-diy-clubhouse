
import { RouteObject, Outlet, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import MemberLayout from "@/components/layout/MemberLayout";

// Dashboard e navegação principal
import Dashboard from "@/pages/member/Dashboard";

// Soluções e implementação
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/SolutionImplementation";

export const memberRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MemberLayout>
          <Outlet />
        </MemberLayout>
      </ProtectedRoute>
    ),
    children: [
      // Dashboard principal
      { path: "/", element: <Dashboard /> },
      
      // TESTE TEMPORÁRIO: Dashboard sem proteção ou layout
      { 
        path: "/dashboard", 
        element: (
          <div style={{ padding: "20px", background: "#f0f0f0" }}>
            <h1 style={{ color: "green", fontSize: "24px" }}>🚀 TESTE: Dashboard sem ProtectedRoute nem MemberLayout</h1>
            <Dashboard />
          </div>
        )
      },
      
      // Redirecionar /solutions para dashboard onde as soluções são exibidas
      { path: "/solutions", element: <Navigate to="/dashboard" replace /> },
      
      // Redirecionamentos para rotas antigas/removidas
      { path: "/trilha-implementacao", element: <Navigate to="/dashboard" replace /> },
      { path: "/learning", element: <Navigate to="/dashboard" replace /> },
      { path: "/forum", element: <Navigate to="/dashboard" replace /> },
      { path: "/forum/*", element: <Navigate to="/dashboard" replace /> },
      { path: "/comunidade", element: <Navigate to="/dashboard" replace /> },
      { path: "/comunidade/*", element: <Navigate to="/dashboard" replace /> },
      { path: "/profile", element: <Navigate to="/dashboard" replace /> },
      { path: "/settings", element: <Navigate to="/dashboard" replace /> },

      // Soluções - rotas existentes
      { path: "/solutions/:id", element: <SolutionDetails /> },
      { path: "/solutions/:id/implementation", element: <SolutionImplementation /> },
      { path: "/solutions/:id/implementation/:moduleIdx", element: <SolutionImplementation /> },

      // Manter compatibilidade com rotas antigas (redirecionamento)
      { path: "/solution/:id", element: <SolutionDetails /> },
      { path: "/implement/:id/:moduleIdx", element: <SolutionImplementation /> },
    ],
  },
];
