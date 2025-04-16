
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";

/**
 * LayoutProvider handles authentication checks and role-based routing
 * before rendering the appropriate layout component
 */
const LayoutProvider = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectChecked, setRedirectChecked] = useState(false);

  // Check user role only once when profile is loaded
  useEffect(() => {
    if (!profile || redirectChecked) {
      return;
    }
    
    if (profile.role === 'admin') {
      console.log("LayoutProvider: Usuário é admin, redirecionando para /admin");
      
      toast({
        title: "Redirecionando para área de administração",
        description: "Você está sendo redirecionado para a área de admin porque tem permissões de administrador."
      });
      
      navigate('/admin', { replace: true });
    }
    
    setRedirectChecked(true);
  }, [profile, navigate, redirectChecked]);

  // Show loading screen while checking the session
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is admin, redirect to admin layout
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Render the member layout
  return <MemberLayout />;
};

export default LayoutProvider;
