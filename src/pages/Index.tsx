
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
  useDocumentTitle("VIVER DE IA");

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
      <div className="min-h-screen flex flex-col items-center justify-center py-lg px-md sm:px-lg lg:px-xl">
        <div className="max-w-md w-full space-y-xl animate-fade-in">
          <div className="text-center">
            <div className="mx-auto h-28 w-28 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-aurora-primary/20 to-aurora-primary/10 animate-pulse-subtle"></div>
              <img
                className="mx-auto h-full w-auto relative z-10 drop-shadow-md"
                src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png"
                alt="VIVER DE IA"
                loading="eager" 
              />
            </div>
            
            <h1 className="mt-lg text-center text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-aurora-primary via-aurora to-aurora-primary-light animate-gradient-shift bg-size-200">
              VIVER DE IA
            </h1>
            
            <p className="mt-sm text-center text-lg text-muted-foreground max-w-sm mx-auto">
              Implemente soluções de IA com autonomia e sucesso
            </p>
          </div>

          <div className="relative pt-xs w-full max-w-xs mx-auto mt-xl">
            <div className="overflow-hidden h-2 mb-md text-xs flex rounded-full bg-muted">
              <div 
                style={{ width: `${progress}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-primary-foreground justify-center bg-gradient-to-r from-aurora-primary to-aurora-primary-light transition-smooth"
              ></div>
            </div>
          </div>

          <div className="mt-xl flex justify-center">
            <div className="inline-flex items-center px-lg py-sm border border-transparent text-base font-medium rounded-full shadow-md text-primary-foreground bg-gradient-to-r from-aurora-primary to-aurora-primary-light hover:from-aurora to-aurora-primary transition-all">
              {isLoading ? 'Verificando autenticação...' : 
               isRedirecting ? 'Redirecionando...' : 
               'Bem-vindo ao VIVER DE IA'
              }
            </div>
          </div>

          {isLoading && (
            <div className="mt-md text-center">
              <p className="text-sm text-muted-foreground animate-pulse">
                Carregando suas informações...
              </p>
            </div>
          )}
          
          <div className="text-center mt-md">
            <p className="text-muted-foreground">
              {isRedirecting ? "Redirecionando automaticamente..." : "Preparando sua experiência..."}
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-0 w-full flex justify-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} VIVER DE IA • Todos os direitos reservados
        </div>
      </div>
    </PageTransitionWithFallback>
  );
};

export default Index;
