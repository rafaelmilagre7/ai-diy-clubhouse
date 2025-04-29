
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const redirectTimerRef = useRef<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Redirecionar automaticamente para a página de autenticação após um breve delay
  useEffect(() => {
    // Verificar se já há uma sessão no localStorage para redirecionamento mais rápido
    const hasSession = !!localStorage.getItem('supabase.auth.token');
    
    // Redirecionar instantaneamente se já houver sessão, caso contrário aguardar
    const redirectDelay = hasSession ? 500 : 2000;
    
    setIsRedirecting(true);
    
    try {
      redirectTimerRef.current = window.setTimeout(() => {
        navigate('/auth', { replace: true });
      }, redirectDelay);
    } catch (error) {
      console.error("Erro ao redirecionar:", error);
      setHasError(true);
      setIsRedirecting(false);
    }

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            VIVER DE IA Club
          </h1>
          <p className="mt-2 text-center text-lg text-gray-600">
            Implemente soluções de IA com autonomia e sucesso
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600">
            {isRedirecting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecionando para a página de login...</span>
              </div>
            ) : 
              'Bem-vindo ao VIVER DE IA Club'
            }
          </div>
        </div>

        {hasError && (
          <div className="text-center mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">
              Ocorreu um erro ao redirecionar. Por favor, clique no botão abaixo.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="mt-2 bg-blue-600 hover:bg-blue-700"
            >
              Ir para Login
            </Button>
          </div>
        )}

        <div className="text-center mt-4">
          <p>
            Se você não for redirecionado automaticamente, clique{" "}
            <Link to="/auth" className="text-blue-600 hover:underline">
              aqui
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
