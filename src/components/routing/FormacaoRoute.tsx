
import React from "react";
import ProtectedRoute from "./ProtectedRoute";

interface FormacaoRouteProps {
  children: React.ReactNode;
  timeoutMs?: number;
  showTransitions?: boolean;
}

/**
 * Wrapper específico para área de formação
 * Requer privilégios de formação ou admin
 */
const FormacaoRoute: React.FC<FormacaoRouteProps> = ({
  children,
  timeoutMs = 5000, // Timeout maior para formação
  showTransitions = false
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireFormacao={true}
      fallbackRoute="/dashboard"
      timeoutMs={timeoutMs}
      showTransitions={showTransitions}
    >
      {children}
    </ProtectedRoute>
  );
};

export default FormacaoRoute;
