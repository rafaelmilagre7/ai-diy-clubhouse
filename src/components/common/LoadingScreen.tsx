
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean; // Readicionando para compatibilidade
}

const LoadingScreen = ({ 
  message = "Carregando...",
  showProgress = false // Prop opcional para manter compatibilidade
}: LoadingScreenProps) => {
  const [dots, setDots] = useState('');

  // Animação de dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-16 w-auto drop-shadow-md"
          />
        </div>
        
        {/* Loading spinner e mensagem */}
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg font-medium text-foreground">
            {message}{dots}
          </span>
        </div>
        
        {/* Mensagem de contexto */}
        <p className="text-sm text-muted-foreground">
          Aguarde um momento...
        </p>

        {/* Barra de progresso opcional (apenas visual) */}
        {showProgress && (
          <div className="w-64 mx-auto mt-4">
            <div className="bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full animate-pulse w-3/4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
