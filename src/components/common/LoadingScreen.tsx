
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando..." 
}) => {
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
        
        <p className="text-sm text-muted-foreground">
          Aguarde um momento...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
