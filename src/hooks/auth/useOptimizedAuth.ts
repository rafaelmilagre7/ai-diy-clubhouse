
import { useAuth } from "@/contexts/auth";
import { useMemo } from "react";

export const useOptimizedAuth = () => {
  const authContext = useAuth();
  
  console.log("🔐 useOptimizedAuth: Estado do contexto", {
    hasUser: !!authContext.user,
    hasProfile: !!authContext.profile,
    isLoading: authContext.isLoading,
    profileRole: authContext.profile?.role
  });

  // Memoizar computações caras
  const computed = useMemo(() => {
    const isAuthenticated = !!authContext.user;
    const isAdmin = authContext.profile?.role === 'admin' || authContext.isAdmin;
    const isFormacao = authContext.profile?.role === 'formacao' || authContext.isFormacao;
    
    console.log("🧮 useOptimizedAuth: Valores computados", {
      isAuthenticated,
      isAdmin,
      isFormacao
    });
    
    return {
      isAuthenticated,
      isAdmin,
      isFormacao
    };
  }, [authContext.user, authContext.profile?.role, authContext.isAdmin, authContext.isFormacao]);

  return {
    ...authContext,
    ...computed
  };
};
