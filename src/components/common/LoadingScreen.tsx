
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  description?: string;
  showProgress?: boolean;
  estimatedSeconds?: number;
}

const LoadingScreen = React.memo(({ 
  message = "Carregando...",
  description,
  showProgress = false,
  estimatedSeconds = 30
}: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [phaseMessage, setPhaseMessage] = useState('');

  // Animação de progresso baseada no tempo estimado
  useEffect(() => {
    if (!showProgress) return;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const seconds = Math.floor(elapsed);
      setElapsedSeconds(seconds);
      
      // Mensagens dinâmicas por fase
      if (seconds < 20) setPhaseMessage("Analisando sua solução...");
      else if (seconds < 40) setPhaseMessage("Mapeando os 4 pilares...");
      else if (seconds < 60) setPhaseMessage("Estruturando framework...");
      else if (seconds < 80) setPhaseMessage("Finalizando detalhes...");
      else setPhaseMessage("Quase lá, aguarde mais um pouco...");
      
      // Progresso simulado que acelera no início e desacelera perto do fim
      const baseProgress = (elapsed / estimatedSeconds) * 100;
      const cappedProgress = Math.min(baseProgress, 95); // Nunca chega a 100%
      
      setProgress(cappedProgress);
    }, 100);
    
    return () => clearInterval(interval);
  }, [showProgress, estimatedSeconds]);

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
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
            <div className="bg-secondary rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-slow ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% concluído
              </p>
              <p className="text-xs text-muted-foreground">
                {elapsedSeconds}s / ~{estimatedSeconds}s
              </p>
            </div>
          </div>
        )}
        
        {/* Mensagem de fase dinâmica */}
        {showProgress && phaseMessage && (
          <p className="text-sm font-medium text-primary">
            {phaseMessage}
          </p>
        )}
        
        {/* Mensagem de contexto */}
        {description && (
          <p className="text-sm text-muted-foreground max-w-md text-center">
            {description}
          </p>
        )}
        
        {/* Aviso após 60s */}
        {elapsedSeconds > 60 && (
          <div className="mt-4 p-3 bg-status-warning/10 border border-status-warning/30 rounded-lg max-w-md">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⏱️ Processamento mais demorado que o esperado. 
              Não feche a página, estamos trabalhando nisso!
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen;
