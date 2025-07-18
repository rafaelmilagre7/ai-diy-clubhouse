
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando...",
  showProgress = false 
}) => {
  const [progress, setProgress] = React.useState(0);
  
  // Simular progresso para melhor UX
  React.useEffect(() => {
    if (!showProgress) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Parar em 90% até terminar de fato
        return prev + Math.random() * 15;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [showProgress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
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
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        <p className="text-sm text-muted-foreground max-w-sm">
          Configurando sua experiência personalizada...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
