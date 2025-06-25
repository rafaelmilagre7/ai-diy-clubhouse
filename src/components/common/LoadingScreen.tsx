
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
  showProgress?: boolean;
  progressValue?: number;
  optimized?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando...",
  variant = "spinner",
  size = "md",
  fullScreen = true,
  className,
  showProgress = false,
  progressValue = 0,
  optimized = false
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

  // Variant padrão: spinner
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
          <span className="text-lg font-medium text-foreground">{enhancedMessage}</span>
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
      </div>
    </div>
  );
};

export default LoadingScreen;
