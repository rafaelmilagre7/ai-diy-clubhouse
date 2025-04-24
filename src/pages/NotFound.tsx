
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Usuário tentou acessar rota inexistente:",
      location.pathname
    );
    
    // Se estamos em uma rota de onboarding, mostrar um toast informativo
    if (location.pathname.includes('/onboarding/')) {
      toast.error("Página de onboarding não encontrada. Redirecionando para opções válidas...");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('supabase.auth.token');
      toast.success("Redirecionando para o login...");
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } catch (error) {
      console.error("Erro ao redirecionar:", error);
      // Fallback direto
      window.location.href = '/login';
    }
  };

  const handleRedirectToOnboarding = () => {
    navigate('/onboarding');
  };
  
  const handleGoBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-2">Oops! Página não encontrada</p>
        <p className="text-gray-500 mb-6 text-sm">
          A URL que você está tentando acessar ({location.pathname}) não existe.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            className="flex items-center gap-2 bg-[#0ABAB5] hover:bg-[#099388]" 
            onClick={handleRedirectToOnboarding}
          >
            <Home className="h-4 w-4" />
            Onboarding
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-[#0ABAB5] text-[#0ABAB5]"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-gray-300 text-gray-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
