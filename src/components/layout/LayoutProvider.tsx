
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import MemberLayout from "./MemberLayout";
import { toast } from "sonner";
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

  // Renderizar o layout com placeholder ou conteúdo real
  if (!user && isLoading) {
    // Renderizar estrutura básica do layout com skeletons em vez de tela de loading completa
    return (
      <div className="min-h-screen flex bg-background">
        {/* Sidebar skeleton */}
        <div className="w-64 border-r border-border bg-muted/30 hidden md:block">
          <div className="p-4">
            <Skeleton className="h-10 w-32 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content skeleton */}
        <div className="flex-1">
          <div className="border-b p-4 flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <div className="p-6">
            <Skeleton className="h-12 w-3/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se não tiver usuário após carregamento, redirecionar para login
  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Se for admin, redirecionar para área admin
  if (!isLoading && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Default case: Render the member layout
  return <MemberLayout>{children}</MemberLayout>;
};

export default LayoutProvider;
