
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useSimpleAuth();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Verificando sua autenticação..." />
      </PageTransitionWithFallback>
    );
  }

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }
  
  if (requireAdmin && !isAdmin) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
