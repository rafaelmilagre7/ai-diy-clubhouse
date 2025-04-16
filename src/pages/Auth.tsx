
import AuthLayout from "@/components/auth/AuthLayout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      // Show feedback toast
      toast({
        title: "Autenticado",
        description: "Redirecionando para o dashboard...",
      });
      
      // Redirect based on role
      if (profile?.role === 'admin' || isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, isAdmin, navigate]);

  return <AuthLayout />;
};

export default Auth;
