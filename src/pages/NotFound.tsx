
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-6xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Página não encontrada</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            className="flex items-center gap-2" 
            onClick={() => window.location.href = '/'}
          >
            <Home className="h-4 w-4" />
            Voltar para o Início
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
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
