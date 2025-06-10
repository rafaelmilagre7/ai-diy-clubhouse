
import AuthLayout from "@/components/auth/AuthLayout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { getUserRoleName } from "@/lib/supabase/types";

const Auth = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      toast("Autenticado", {
        description: "Redirecionando para o dashboard...",
      });
      
      // CORREÇÃO: Priorizar dashboard de membro
      const roleName = getUserRoleName(profile);
      
      if (roleName === 'formacao') {
        console.log("🎯 [AUTH] Formação detectado - redirecionando para /formacao");
        navigate('/formacao', { replace: true });
      } else {
        console.log("🎯 [AUTH] Usuário - redirecionando para /dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, navigate]);

  return <AuthLayout />;
};

export default Auth;
