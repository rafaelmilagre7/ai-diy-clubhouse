
import AuthLayout from "@/components/auth/AuthLayout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

const Auth = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se o usuário já estiver autenticado
  useEffect(() => {
    if (user) {
      // Se o usuário for admin, redirecionar para o painel de admin
      if (profile?.role === 'admin' || isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        // Caso contrário, redirecionar para o dashboard de membro
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, isAdmin, navigate]);

  return <AuthLayout />;
};

export default Auth;
