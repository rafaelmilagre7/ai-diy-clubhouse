
import { useAuth } from "@/contexts/auth";

/**
 * Hook otimizado que usa diretamente o contexto de auth
 * sem dependências circulares
 */
export const useOptimizedAuth = () => {
  const authContext = useAuth();
  
  return {
    user: authContext.user,
    profile: authContext.profile,
    session: authContext.session,
    isAuthenticated: !!authContext.user,
    isAdmin: authContext.isAdmin,
    isFormacao: authContext.isFormacao,
    isLoading: authContext.isLoading,
    authError: authContext.authError,
    signIn: authContext.signIn,
    signOut: authContext.signOut,
    signInAsMember: authContext.signInAsMember,
    signInAsAdmin: authContext.signInAsAdmin
  };
};
