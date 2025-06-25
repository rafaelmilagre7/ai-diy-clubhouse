
import React from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingScreenProps {
  message?: string;
  variant?: "spinner" | "skeleton" | "dots" | "modern" | "onboarding";
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
  showProgress?: boolean;
  progressValue?: number;
  optimized?: boolean;
  // Propriedades avançadas para variants modernas
  type?: "stats" | "chart" | "table" | "full";
  count?: number;
  showForceButton?: boolean;
  onForceComplete?: () => void;
  duration?: number;
  isSlowLoading?: boolean;
  isVerySlowLoading?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando...",
  variant = "spinner",
  size = "md",
  fullScreen = true,
  className,
  showProgress = false,
  progressValue = 0,
  optimized = false,
  type = "full",
  count = 4,
  showForceButton = true,
  onForceComplete,
  duration = 0,
  isSlowLoading = false,
  isVerySlowLoading = false
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  // Mensagem otimizada para VIVER DE IA quando optimized=true
  const enhancedMessage = React.useMemo(() => {
    if (optimized && message === "Carregando") {
      return "Preparando sua experiência personalizada do VIVER DE IA Club...";
    }
    return message.endsWith("...") ? message : `${message}...`;
  }, [message, optimized]);

  const containerClasses = cn(
    "flex flex-col items-center justify-center bg-background",
    fullScreen ? "min-h-screen" : "py-8",
    className
  );

  // Variant moderna para analytics
  if (variant === "modern") {
    if (type === "stats") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(count).fill(0).map((_, i) => (
            <Card key={i} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300" />
                      <Skeleton className="h-8 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-200 to-purple-200" />
                  </div>
                  <Skeleton className="h-4 w-1/3 bg-gradient-to-r from-green-200 to-emerald-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (type === "chart") {
      return (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/3 bg-gradient-to-r from-blue-200 to-purple-200" />
                <Skeleton className="h-4 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300" />
              </div>
              <Skeleton className="h-[300px] w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (type === "table") {
      return (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/4 bg-gradient-to-r from-blue-200 to-purple-200" />
                <Skeleton className="h-4 w-1/3 bg-gradient-to-r from-gray-200 to-gray-300" />
              </div>
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300" />
                      <Skeleton className="h-3 w-2/3 bg-gradient-to-r from-gray-100 to-gray-200" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full bg-gradient-to-r from-blue-200 to-purple-200" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Full modern loading state
    return (
      <div className="space-y-8">
        <LoadingScreen variant="modern" type="stats" count={4} fullScreen={false} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingScreen variant="modern" type="chart" fullScreen={false} />
          <LoadingScreen variant="modern" type="chart" fullScreen={false} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingScreen variant="modern" type="chart" fullScreen={false} />
          <LoadingScreen variant="modern" type="chart" fullScreen={false} />
          <LoadingScreen variant="modern" type="chart" fullScreen={false} />
        </div>
      </div>
    );
  }

  // Variant onboarding
  if (variant === "onboarding") {
    const onboardingConfigs = {
      initialization: {
        icon: <Loader2 className="w-8 h-8 text-viverblue animate-spin" />,
        title: 'Inicializando Onboarding',
        defaultMessage: 'Preparando sua experiência personalizada...'
      },
      preparation: {
        icon: <Loader2 className="w-8 h-8 text-viverblue animate-pulse" />,
        title: 'Configurando Experiência',
        defaultMessage: 'Analisando seu perfil e preparando conteúdo...'
      },
      verification: {
        icon: <Loader2 className="w-8 h-8 text-viverblue animate-bounce" />,
        title: 'Verificando Dados',
        defaultMessage: 'Validando informações do convite...'
      },
      completion: {
        icon: <Loader2 className="w-8 h-8 text-viverblue animate-pulse" />,
        title: 'Finalizando',
        defaultMessage: 'Concluindo seu onboarding...'
      }
    };

    const config = onboardingConfigs.initialization;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
              {config.icon}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {config.title}
              </h2>
              <p className="text-neutral-300">
                {message || config.defaultMessage}
              </p>
            </div>
            
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-viverblue h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={containerClasses}>
        <div className="space-y-4 w-full max-w-sm">
          <div className="flex items-center justify-center mb-6">
            <img
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
              alt="VIVER DE IA Club"
              className="h-12 w-auto"
            />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={containerClasses}>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
              alt="VIVER DE IA Club"
              className="h-12 w-auto"
            />
          </div>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-primary rounded-full animate-bounce",
                  size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s"
                }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{enhancedMessage}</p>
        </div>
      </div>
    );
  }

  // Variant padrão: spinner com fallback avançado
  const handleForceComplete = () => {
    if (onForceComplete) {
      onForceComplete();
    } else {
      window.location.reload();
    }
  };

  const getLoadingMessage = () => {
    if (isVerySlowLoading) {
      return "Carregamento mais demorado que o esperado...";
    }
    
    if (isSlowLoading) {
      return "Aguarde, carregando dados...";
    }
    
    return enhancedMessage;
  };

  return (
    <div className={containerClasses}>
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex items-center justify-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-16 w-auto mb-4"
          />
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
          <span className="text-lg font-medium text-foreground">{getLoadingMessage()}</span>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Aguarde um momento...
        </p>

        {showProgress && (
          <div className="w-64 mx-auto">
            <div className="bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-viverblue h-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {Math.round(progressValue)}% concluído
            </p>
          </div>
        )}

        {duration > 2000 && (
          <p className="text-xs text-muted-foreground">
            {(duration / 1000).toFixed(1)}s decorridos
          </p>
        )}

        {isVerySlowLoading && showForceButton && (
          <div className="flex flex-col space-y-2 w-full">
            <Button 
              variant="outline" 
              onClick={handleForceComplete}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Forçar carregamento
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.reload()}
              className="w-full text-xs"
            >
              Recarregar página
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
