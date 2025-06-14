
import AuthLayout from "@/components/auth/AuthLayout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

const Auth = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      toast("Autenticado", {
        description: "Redirecionando para o dashboard...",
      });
      
      // MUDANÇA: Todos os usuários (incluindo admin) vão para dashboard membro
      console.log("🎯 [AUTH] Usuário autenticado - redirecionando para /dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, navigate]);

  return <AuthLayout />;
};

export default Auth;
