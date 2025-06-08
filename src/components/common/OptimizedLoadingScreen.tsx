
import React, { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface OptimizedLoadingScreenProps {
  message?: string;
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  progressValue?: number;
  fullScreen?: boolean;
}

const OptimizedLoadingScreen: React.FC<OptimizedLoadingScreenProps> = ({
  message = "Carregando",
  variant = "spinner",
  size = "lg",
  showProgress = false,
  progressValue = 0,
  fullScreen = true
}) => {
  const [progress, setProgress] = useState(0);
  
  // Simular progresso automático se não fornecido
  useEffect(() => {
    if (showProgress && progressValue === 0) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);
      
      return () => clearInterval(timer);
    } else {
      setProgress(progressValue);
    }
  }, [showProgress, progressValue]);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClasses = cn(
    "flex flex-col items-center justify-center space-y-6",
    fullScreen && "min-h-screen bg-background"
  );

  if (variant === "dots") {
    return (
      <div className={containerClasses}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-primary rounded-full animate-pulse",
                size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s"
              }}
            />
          ))}
        </div>
        {message && (
          <p className="text-sm text-text-secondary text-center animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Logo ou Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative bg-primary/10 p-6 rounded-2xl border border-border backdrop-blur-sm">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Spinner */}
      <div className="flex items-center space-x-3">
        <Loader2 className={cn("text-primary animate-spin", sizeClasses[size])} />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-text-primary">
            VIVER DE IA Club
          </h3>
          <p className="text-sm text-text-secondary">
            {message}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-md space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-text-muted text-center">
            {Math.round(progress)}% concluído
          </p>
        </div>
      )}

      {/* Loading Messages */}
      <div className="text-center space-y-2 max-w-md">
        <p className="text-sm text-text-secondary">
          Preparando sua experiência personalizada...
        </p>
        <div className="flex items-center justify-center space-x-1 text-xs text-text-muted">
          <span>Powered by</span>
          <span className="text-primary font-medium">Inteligência Artificial</span>
        </div>
      </div>
    </div>
  );
};

export default OptimizedLoadingScreen;
