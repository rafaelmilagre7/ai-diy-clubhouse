
import React from "react";
import ProtectedRoute from "./ProtectedRoute";

interface AdminRouteProps {
  children: React.ReactNode;
  timeoutMs?: number;
  showTransitions?: boolean;
}

/**
 * Wrapper específico para áreas administrativas
 * Requer privilégios de administrador
 */
const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  timeoutMs = 3000,
  showTransitions = false
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireAdmin={true}
      fallbackRoute="/dashboard"
      timeoutMs={timeoutMs}
      showTransitions={showTransitions}
    >
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;
