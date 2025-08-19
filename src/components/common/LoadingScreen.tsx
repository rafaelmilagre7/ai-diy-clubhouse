
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
}

const LoadingScreen = ({ 
  message = "Carregando...",
  showProgress = false 
}: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animação de progresso simulado
  useEffect(() => {
    if (!showProgress) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 10 + 5; // 5-15% por vez
        const newProgress = prev + increment;
        return newProgress > 85 ? 85 : newProgress; // Parar em 85%
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, [showProgress]);

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
            src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png"
            alt="VIVER DE IA"
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
        
        {/* Barra de progresso */}
        {showProgress && (
          <div className="w-full max-w-xs mx-auto">
            <div className="bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(progress)}% concluído
            </p>
          </div>
        )}
        
        {/* Mensagem de contexto */}
        <p className="text-sm text-muted-foreground">
          Preparando sua experiência personalizada...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
