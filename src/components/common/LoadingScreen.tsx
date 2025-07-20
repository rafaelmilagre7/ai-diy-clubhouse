
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ 
  message = "Carregando..."
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
      </div>
    </div>
  );
};

export default LoadingScreen;
