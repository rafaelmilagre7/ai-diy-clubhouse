
import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingScreenProps {
  message?: string;
  showEmergencyButton?: boolean;
  emergencyAction?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando...",
  showEmergencyButton = true,
  emergencyAction
}) => {
  const [duration, setDuration] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setDuration(elapsed);
      
      // Mostrar botão de emergência após 12 segundos
      if (elapsed > 12000 && showEmergencyButton) {
        setShowButton(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showEmergencyButton]);

  const handleEmergencyAction = () => {
    if (emergencyAction) {
      emergencyAction();
    } else {
      // Ação padrão: recarregar página
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex items-center justify-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-16 w-auto mb-4"
          />
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-viverblue" />
          <span className="text-lg font-medium text-white">{message}</span>
        </div>
        
        <div className="w-64 bg-gray-700 rounded-full h-2">
          <div 
            className="bg-viverblue h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min((duration / 12000) * 100, 100)}%` }}
          />
        </div>
        
        <p className="text-sm text-neutral-300">
          {duration < 3000 ? 'Configurando sua experiência...' :
           duration < 8000 ? 'Carregando seus dados...' :
           duration < 12000 ? 'Quase pronto...' :
           'Carregamento demorado detectado...'}
        </p>

        {showButton && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Carregamento demorado</span>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleEmergencyAction}
                variant="outline"
                size="sm"
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white"
              >
                Forçar Carregamento
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Recarregar Página
              </Button>
            </div>
          </div>
        )}

        {import.meta.env.DEV && (
          <p className="text-xs text-neutral-500 mt-4">
            {Math.round(duration/1000)}s - Retry disponível em {Math.max(0, Math.round((12000 - duration)/1000))}s
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
