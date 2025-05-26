
import React from "react";
import ProtectedRoute from "./ProtectedRoute";
import type { ProtectedRouteProps } from "./types/ProtectedRouteTypes";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  fallbackRoute?: string;
  timeoutMs?: number;
  showTransitions?: boolean;
}

/**
 * Wrapper simples para proteção básica de autenticação
 * Requer apenas que o usuário esteja logado
 */
const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({
  children,
  fallbackRoute = "/login",
  timeoutMs = 3000,
  showTransitions = false
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireAdmin={false}
      requireFormacao={false}
      fallbackRoute={fallbackRoute}
      timeoutMs={timeoutMs}
      showTransitions={showTransitions}
    >
      {children}
    </ProtectedRoute>
  );
};

export default AuthenticatedRoute;
