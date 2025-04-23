
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import { toast } from "sonner";

export const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-6xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Página não encontrada</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            className="flex items-center gap-2 bg-[#0ABAB5] hover:bg-[#099388]" 
            onClick={handleRedirectToOnboarding}
          >
            <Home className="h-4 w-4" />
            Voltar para o Onboarding
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-[#0ABAB5] text-[#0ABAB5]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Ir para Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
