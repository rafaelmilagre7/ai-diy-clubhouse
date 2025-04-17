
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { FcGoogle } from "react-icons/fc";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = () => {
  const { signIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn();
      // Redirecionamento acontece dentro da função signIn
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError("Ocorreu um erro durante o login. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleSignIn} 
        disabled={isLoading}
        className="group relative w-full flex justify-center py-6 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ABAB5] shadow"
      >
        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
          <FcGoogle className="h-5 w-5" />
        </span>
        {isLoading ? "Carregando..." : "Entrar com Google"}
      </Button>
      
      <div className="text-center mt-2">
        <Link 
          to="/index" 
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Voltar para página inicial
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
