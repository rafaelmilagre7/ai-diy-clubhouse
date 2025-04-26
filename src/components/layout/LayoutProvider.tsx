
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import MemberLayout from "./MemberLayout";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LayoutProvider handles authentication checks and role-based routing
 * before rendering the appropriate layout component
 */
const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    profile,
    isAdmin,
    isLoading,
  } = useAuth();
  const navigate = useNavigate();
  
  // Debug logs
  console.log("LayoutProvider state:", { user, profile, isAdmin, isLoading });

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("LayoutProvider: No authenticated user, redirecting to login");
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Verificar papel do usuário
  useEffect(() => {
    if (!isLoading && user && profile) {
      if (isAdmin && window.location.pathname.indexOf('/admin') !== 0) {
        console.log("LayoutProvider: Admin user detected, redirecting to admin area");
        navigate('/admin', { replace: true });
      }
    }
  }, [user, profile, isAdmin, isLoading, navigate]);

  // Se não tiver usuário após carregamento, redirecionar para login
  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Se for admin após carregamento, redirecionar para área admin
  if (!isLoading && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Default case: Render the member layout com o conteúdo atual
  return <MemberLayout>{children}</MemberLayout>;
};

export default LayoutProvider;
