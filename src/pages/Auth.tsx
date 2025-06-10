
import AuthLayout from "@/components/auth/AuthLayout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { getUserRoleName } from "@/lib/supabase/types";

const Auth = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      toast("Autenticado", {
        description: "Redirecionando para o dashboard...",
      });
      
      // CORREÇÃO CRÍTICA: Usar isAdmin baseado em role_id (não campo role legado)
      const roleName = getUserRoleName(profile);
      
      if (isAdmin || roleName === 'admin') {
        console.log("🎯 [AUTH] Admin detectado - redirecionando para /admin");
        navigate('/admin', { replace: true });
      } else if (roleName === 'formacao') {
        console.log("🎯 [AUTH] Formação detectado - redirecionando para /formacao");
        navigate('/formacao', { replace: true });
      } else {
        console.log("🎯 [AUTH] Usuário comum - redirecionando para /dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, isAdmin, navigate]);

  return <AuthLayout />;
};

export default Auth;
