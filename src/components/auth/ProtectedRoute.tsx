
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Navigation logic - Always runs regardless of conditions
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log("ProtectedRoute: No user, redirecting to auth");
        navigate('/auth', { replace: true });
      } else if (requireAdmin && !isAdmin) {
        console.log("ProtectedRoute: User is not admin, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, requireAdmin, navigate]);

  // Always render children (otimista) - authz failures will be caught by useEffect
  // We let the layout/component handle its own loading states
  return <>{children}</>;
};
