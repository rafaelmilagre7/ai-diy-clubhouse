
import AuthLayout from "@/components/auth/AuthLayout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

const Auth = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      toast("Autenticado", {
        description: "Redirecionando para o dashboard...",
      });
      
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
