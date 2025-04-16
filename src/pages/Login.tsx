
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  const { signIn, signInAsMember, signInAsAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn();
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError("Ocorreu um erro durante o login. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserLogin = async (loginFn: () => Promise<void>, userType: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await loginFn();
    } catch (err: any) {
      console.error(`Erro ao fazer login como ${userType}:`, err);
      setError(err?.message || `Ocorreu um erro ao fazer login como ${userType}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            className="mx-auto h-20 w-auto"
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            VIVER DE IA Club
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Implemente soluções de IA com autonomia e sucesso
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <Button 
              onClick={handleSignIn} 
              disabled={isLoading}
              className="group relative w-full flex justify-center py-6 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-viverblue shadow"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FcGoogle className="h-5 w-5" />
              </span>
              {isLoading ? "Carregando..." : "Entrar com Google"}
            </Button>
            
            {/* Test login buttons */}
            <Button 
              className="w-full py-6 text-base bg-blue-600 hover:bg-blue-700"
              onClick={() => handleTestUserLogin(signInAsMember, "membro")}
              disabled={isLoading}
            >
              {isLoading ? "Carregando..." : "Login como Membro (Teste)"}
            </Button>
            
            <Button 
              className="w-full py-6 text-base bg-purple-600 hover:bg-purple-700"
              onClick={() => handleTestUserLogin(signInAsAdmin, "admin")}
              disabled={isLoading}
            >
              {isLoading ? "Carregando..." : "Login como Admin (Teste)"}
            </Button>
            
            <div className="text-center mt-2">
              <Link 
                to="/" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Voltar para página inicial
              </Link>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-8">
            <p>
              Acesso exclusivo para membros do VIVER DE IA Club.
            </p>
            <p className="mt-2">
              Não é membro ainda?{" "}
              <a
                href="https://milagredigital.com/club/"
                className="font-medium text-viverblue hover:text-viverblue-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conheça o Club
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
