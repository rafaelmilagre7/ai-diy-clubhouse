
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/supabase";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";

/**
 * LayoutProvider handles authentication checks and role-based routing
 * before rendering the appropriate layout component
 */
const LayoutProvider = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  // Check user role when the component is mounted and when profile changes
  useEffect(() => {
    if (!profile) {
      console.log("LayoutProvider useEffect: Ainda não há perfil de usuário carregado");
      return;
    }
    
    // Use explicit role comparison with UserRole type
    if (profile.role === 'admin' as UserRole) {
      console.log("LayoutProvider useEffect: Usuário é admin, redirecionando para /admin", { 
        profileRole: profile.role,
        isAdmin: profile.role === 'admin'
      });
      
      // Notify the user about the redirect
      toast({
        title: "Redirecionando para área de administração",
        description: "Você está sendo redirecionado para a área de admin porque tem permissões de administrador."
      });
      
      navigate('/admin', { replace: true });
    } else {
      console.log("LayoutProvider useEffect: Confirmando que o usuário é membro", {
        profileRole: profile.role,
        isAdmin: profile.role === 'admin'
      });
    }
  }, [profile, navigate]);

  // Show loading screen while checking the session
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    console.log("LayoutProvider render: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // If user is admin, redirect to admin layout
  // (this is also done in useEffect, but kept here as a double check)
  if (isAdmin) {
    console.log("LayoutProvider render: Usuário é admin, redirecionando para /admin", { 
      profileRole: profile?.role, 
      isAdmin 
    });
    return <Navigate to="/admin" replace />;
  }
  
  // Final check of user role
  if (profile && profile.role !== 'member') {
    console.log("LayoutProvider render: Papel do usuário não é member, mas é:", {
      papel_atual: profile.role
    });
  }

  console.log("LayoutProvider render: Usuário é membro, permanecendo na área de membro", { 
    profileRole: profile?.role, 
    isAdmin 
  });

  // Render the member layout
  return <MemberLayout />;
};

export default LayoutProvider;
