
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuth } from "@/contexts/auth";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";
import { Container } from "@/components/ui/container";

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
      className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-elevated"
    >
      <Container className="min-h-screen flex flex-col items-center justify-center py-12">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto h-28 w-28 relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 animate-pulse-subtle group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-10 animate-ping"></div>
              <img
                className="mx-auto h-full w-auto relative z-10 drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
                alt="VIVER DE IA Hub"
                loading="eager" 
              />
            </div>
            
            <h1 className="mt-8 text-center heading-display text-gradient animate-gradient-shift">
              VIVER DE IA Hub
            </h1>
            
            <p className="mt-4 text-center body-large text-text-secondary max-w-sm mx-auto">
              Implemente soluções de IA com autonomia e sucesso
            </p>
          </div>

          <div className="relative pt-2 w-full max-w-xs mx-auto">
            <div className="overflow-hidden h-2 rounded-full bg-surface-elevated border border-border-subtle shadow-inner">
              <div 
                style={{ width: `${progress}%` }} 
                className="h-full bg-gradient-primary shadow-sm transition-all duration-300 ease-out"
              ></div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="card-modern px-6 py-4 text-center shadow-soft hover:shadow-medium transition-all duration-300">
              <span className="body-default font-medium text-foreground">
                {isLoading ? 'Verificando autenticação...' : 
                 isRedirecting ? 'Redirecionando...' : 
                 'Bem-vindo ao VIVER DE IA Hub'
                }
              </span>
            </div>
          </div>

          {isLoading && (
            <div className="mt-4 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="body-small text-text-tertiary animate-pulse">
                Carregando suas informações...
              </p>
            </div>
          )}
          
          <div className="text-center mt-6">
            <p className="body-small text-text-muted">
              {isRedirecting ? "Redirecionando automaticamente..." : "Preparando sua experiência..."}
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-0 w-full flex justify-center">
          <p className="ui-caption text-text-tertiary">
            © {new Date().getFullYear()} VIVER DE IA Hub • Todos os direitos reservados
          </p>
        </div>
      </Container>
    </PageTransitionWithFallback>
  );
};

export default Index;
