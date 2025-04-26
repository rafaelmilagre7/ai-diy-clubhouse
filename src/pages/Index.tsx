
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  const redirectTimerRef = useRef<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasStartedRedirect, setHasStartedRedirect] = useState(false);

  // Redirecionar automaticamente para a página de autenticação após um breve delay
  useEffect(() => {
    // Verificar se já há uma sessão no localStorage para redirecionamento mais rápido
    const hasSession = !!localStorage.getItem('supabase.auth.token');
    
    // Redirecionar instantaneamente se já houver sessão, caso contrário aguardar
    const redirectDelay = hasSession ? 500 : 2000;
    
    if (!hasStartedRedirect) {
      setIsRedirecting(true);
      setHasStartedRedirect(true);
      
      redirectTimerRef.current = window.setTimeout(() => {
        navigate('/auth', { replace: true });
      }, redirectDelay);
    }

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [navigate, hasStartedRedirect]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Imagem que carrega imediatamente ou skeleton */}
          <div className="mx-auto h-24 w-auto">
            <img
              className="mx-auto h-24 w-auto"
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
              alt="VIVER DE IA Club"
              loading="eager" // Priorizar o carregamento da imagem de marca
              onError={(e) => {
                // Em caso de erro mostrar fallback
                e.currentTarget.style.display = 'none';
                // Mostrar uma versão básica sem imagem
              }}
            />
          </div>
          
          <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            VIVER DE IA Club
          </h1>
          <p className="mt-2 text-center text-lg text-gray-600">
            Implemente soluções de IA com autonomia e sucesso
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-viverblue">
            {isRedirecting ? 
              'Redirecionando para a página de login...' : 
              'Bem-vindo ao VIVER DE IA Club'
            }
          </div>
        </div>

        <div className="text-center mt-4">
          <p>
            Se você não for redirecionado automaticamente, clique{" "}
            <Link to="/auth" className="text-viverblue hover:underline">
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
