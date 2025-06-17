
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuth } from "@/contexts/auth/OptimizedAuthContext";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

const OptimizedIndex = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useDocumentTitle("Viver de IA Hub");

  // OTIMIZAÇÃO: Redirecionamento ultra-rápido para usuários anônimos
  useEffect(() => {
    let redirectTimer: number | null = null;
    let progressInterval: number | null = null;
    
    if (!isLoading) {
      console.log("OptimizedIndex: Iniciando redirecionamento otimizado");
      setIsRedirecting(true);
      
      // OTIMIZAÇÃO: 300ms para usuários com sessão, 100ms para anônimos
      const hasUser = !!user;
      const redirectDelay = hasUser ? 300 : 100;
      
      // OTIMIZAÇÃO: Progresso acelerado
      progressInterval = window.setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (redirectDelay / 50);
          const newProgress = prev + increment;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 50);
      
      redirectTimer = window.setTimeout(() => {
        const targetRoute = hasUser ? '/dashboard' : '/auth';
        console.log("OptimizedIndex: Redirecionamento rápido para", targetRoute);
        navigate(targetRoute, { replace: true });
      }, redirectDelay);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [navigate, user, isLoading]);

  return (
    <PageTransitionWithFallback
      isVisible={true}
      fallbackMessage="Carregando rapidamente..."
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
              Carregamento otimizado - Acesso rápido
            </p>
          </div>

          <div className="relative pt-1 w-full max-w-xs mx-auto mt-8">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
              <div 
                style={{ width: `${progress}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-viverblue to-viverblue-light transition-all duration-100"
              ></div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-gradient-to-r from-viverblue to-viverblue-light hover:from-viverblue-dark hover:to-viverblue transition-all">
              {isLoading ? 'Carregamento rápido...' : 
               isRedirecting ? 'Redirecionando...' : 
               'VIVER DE IA Hub'
              }
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-gray-500 dark:text-gray-400">
              {isRedirecting ? "Acesso otimizado ⚡" : "Preparando experiência otimizada..."}
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-0 w-full flex justify-center text-xs text-gray-400">
          © {new Date().getFullYear()} VIVER DE IA Hub • Performance Otimizada
        </div>
      </div>
    </PageTransitionWithFallback>
  );
};

export default OptimizedIndex;
