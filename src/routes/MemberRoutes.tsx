
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
      { path: "/dashboard", element: <Dashboard /> },
      
      // Redirecionar /solutions para dashboard onde as soluções são exibidas
      { path: "/solutions", element: <Navigate to="/dashboard" replace /> },
      
      // Redirecionamento para rotas antigas/removidas
      { path: "/trilha-implementacao", element: <Navigate to="/dashboard" replace /> },
      { path: "/learning", element: <Navigate to="/dashboard" replace /> },

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
