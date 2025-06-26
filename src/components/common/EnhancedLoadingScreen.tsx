
import React, { useState, useEffect } from "react";
import { Loader2, AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLoadingTimeoutEnhanced } from "@/hooks/useLoadingTimeoutEnhanced";
import { useNavigate } from "react-router-dom";

interface EnhancedLoadingScreenProps {
  message?: string;
  context?: string;
  isLoading?: boolean;
  onRetry?: () => void;
  onForceExit?: () => void;
  showProgress?: boolean;
}

const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({ 
  message = "Carregando...",
  context = "generic",
  isLoading = true,
  onRetry,
  onForceExit,
  showProgress = true
}) => {
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [loadingDuration, setLoadingDuration] = useState(0);
  
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading,
    timeoutMs: 15000, // 15 segundos
    context,
    onTimeout: () => {
      setDebugInfo(prev => [...prev, `Timeout atingido após ${loadingDuration}ms`]);
    }
  });

  // Calcular duração do loading localmente
  useEffect(() => {
    if (!isLoading) {
      setLoadingDuration(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      setLoadingDuration(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Debug info em tempo real
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setDebugInfo(prev => [
          ...prev.slice(-4), // Manter últimas 5 mensagens
          `[${new Date().toLocaleTimeString()}] ${context}: ${loadingDuration}ms`
        ]);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isLoading, context, loadingDuration]);

  const handleRetry = () => {
    setDebugInfo([]);
    setLoadingDuration(0);
    retry();
    if (onRetry) {
      onRetry();
    }
  };

  const handleForceExit = () => {
    // Limpar localStorage de auth
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    if (onForceExit) {
      onForceExit();
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  if (hasTimedOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="max-w-md w-full space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              A aplicação demorou mais que o esperado para carregar. 
              Isso pode indicar um problema de conexão ou configuração.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <img
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
              alt="VIVER DE IA Club"
              className="h-16 w-auto mx-auto mb-4"
            />
            
            <h2 className="text-xl font-semibold">Problemas de Carregamento</h2>
            <p className="text-muted-foreground">
              Contexto: {context} • Duração: {loadingDuration}ms
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full" variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button onClick={handleForceExit} className="w-full" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Refazer Login
            </Button>
            
            <Button onClick={handleGoHome} className="w-full" variant="ghost">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>

          {/* Debug info para desenvolvimento */}
          {import.meta.env.DEV && debugInfo.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded text-xs">
              <strong>Debug Info:</strong>
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const loadingProgress = Math.min((loadingDuration / 10000) * 100, 95); // Progresso baseado em 10s
  const isLoadingTooLong = loadingDuration > 8000; // 8 segundos

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex items-center justify-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-16 w-auto mb-4"
          />
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg font-medium text-foreground">{message}</span>
        </div>
        
        {showProgress && (
          <div className="w-64 bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">
          {context === 'auth' ? 'Verificando suas credenciais...' :
           context === 'onboarding' ? 'Verificando seu progresso...' :
           context === 'profile' ? 'Carregando seu perfil...' :
           'Configurando sua experiência personalizada...'}
        </p>

        {isLoadingTooLong && (
          <div className="mt-4">
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Duração do loading em desenvolvimento */}
        {import.meta.env.DEV && (
          <p className="text-xs text-muted-foreground">
            {loadingDuration}ms • {context}
          </p>
        )}
      </div>
    </div>
  );
};

export default EnhancedLoadingScreen;
