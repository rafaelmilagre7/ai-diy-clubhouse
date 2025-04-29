
import AuthLayout from "@/components/auth/AuthLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      setRedirecting(true);
      
      toast("Autenticado", {
        description: "Redirecionando para o dashboard...",
      });
      
      // Pequeno timeout para garantir que o toast seja exibido antes do redirecionamento
      setTimeout(() => {
        if (profile?.role === 'admin' || isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 500);
    }
  }, [user, profile, isAdmin, navigate, isLoading]);

  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Redirecionando...</h2>
        <p className="text-sm text-gray-600">
          Você será encaminhado para o dashboard em instantes.
        </p>
      </div>
    );
  }

  return <AuthLayout />;
};

export default Auth;
