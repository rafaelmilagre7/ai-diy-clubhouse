
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuth } from "@/contexts/auth";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Definir o título da página
  useDocumentTitle("Viver de IA Hub");

  // Redirecionar automaticamente após verificar estado de autenticação
  useEffect(() => {
    let redirectTimer: number | null = null;
    let progressInterval: number | null = null;
    
    // Só iniciar redirecionamento quando o estado de auth não estiver carregando
    if (!isLoading) {
      console.log("Index: Estado de auth carregado, iniciando redirecionamento");
      setIsRedirecting(true);
      
      // Verificar se já há uma sessão para redirecionamento mais rápido
      const hasUser = !!user;
      const redirectDelay = hasUser ? 300 : 1500;
      
      // Atualizar barra de progresso
      progressInterval = window.setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (redirectDelay / 100);
          const newProgress = prev + increment;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 100);
      
      // Configurar o redirecionamento
      redirectTimer = window.setTimeout(() => {
        const targetRoute = hasUser ? '/dashboard' : '/auth';
        console.log("Index: Redirecionando para", targetRoute);
        navigate(targetRoute, { replace: true });
      }, redirectDelay);
    }

    // Limpar intervalos e timers
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [navigate, user, isLoading]);

  return (
    <PageTransitionWithFallback
      isVisible={true}
      fallbackMessage="Preparando seu ambiente..."
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto h-28 w-28 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-viverblue/20 to-viverblue-dark/10 animate-pulse-subtle"></div>
              <img
                className="mx-auto h-full w-auto relative z-10 drop-shadow-md"
                src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
                alt="VIVER DE IA Hub"
                loading="eager" 
              />
            </div>
            
            <h1 className="mt-6 text-center text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-viverblue via-indigo-600 to-viverblue-dark animate-gradient-shift bg-size-200">
              VIVER DE IA Hub
            </h1>
            
            <p className="mt-3 text-center text-lg text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
              Implemente soluções de IA com autonomia e sucesso
            </p>
          </div>

          <div className="relative pt-1 w-full max-w-xs mx-auto mt-8">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
              <div 
                style={{ width: `${progress}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-viverblue to-viverblue-light transition-all duration-300"
              ></div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-gradient-to-r from-viverblue to-viverblue-light hover:from-viverblue-dark hover:to-viverblue transition-all">
              {isLoading ? 'Verificando autenticação...' : 
               isRedirecting ? 'Redirecionando...' : 
               'Bem-vindo ao VIVER DE IA Hub'
              }
            </div>
          </div>

          {isLoading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Carregando suas informações...
              </p>
            </div>
          )}
          
          <div className="text-center mt-4">
            <p className="text-gray-500 dark:text-gray-400">
              {isRedirecting ? "Redirecionando automaticamente..." : "Preparando sua experiência..."}
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-0 w-full flex justify-center text-xs text-gray-400">
          © {new Date().getFullYear()} VIVER DE IA Hub • Todos os direitos reservados
        </div>
      </div>
    </PageTransitionWithFallback>
  );
};

export default Index;
