
import { RouteObject, Outlet, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import MemberLayout from "@/components/layout/MemberLayout";

// Dashboard e navegação principal
import Dashboard from "@/pages/member/Dashboard";

// Soluções e implementação
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/SolutionImplementation";

// Páginas principais
import Solutions from "@/pages/member/Solutions";
import Learning from "@/pages/member/Learning";
import Tools from "@/pages/member/Tools";
import Benefits from "@/pages/member/Benefits";

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
      
      // Páginas principais
      { path: "/solutions", element: <Solutions /> },
      { path: "/learning", element: <Learning /> },
      { path: "/tools", element: <Tools /> },
      { path: "/benefits", element: <Benefits /> },
      
      // Redirecionamentos para rotas antigas/removidas
      { path: "/trilha-implementacao", element: <Navigate to="/dashboard" replace /> },
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
