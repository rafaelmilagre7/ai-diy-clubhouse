
import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductionLogger } from '@/hooks/useProductionLogger';

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
  const { log } = useProductionLogger({ component: 'LoadingScreen' });

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setDuration(elapsed);
      
      if (elapsed > 10000 && showEmergencyButton && !showButton) {
        setShowButton(true);
        log('Emergency button activated after 10s');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showEmergencyButton, showButton, log]);

  const handleEmergencyAction = () => {
    if (emergencyAction) {
      emergencyAction();
    } else {
      window.location.reload();
    }
  };

  const progressPercentage = Math.min((duration / 15000) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm px-4">
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
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <p className="text-sm text-neutral-300">
          {duration < 3000 ? 'Configurando sua experiência...' :
           duration < 8000 ? 'Carregando seus dados...' :
           duration < 12000 ? 'Verificando credenciais...' :
           'Quase pronto...'}
        </p>

        {showButton && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Carregamento demorado</span>
            </div>
            
            <Button 
              onClick={handleEmergencyAction}
              variant="outline"
              size="sm"
              className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white"
            >
              Recarregar Página
            </Button>
          </div>
        )}

        {import.meta.env.DEV && (
          <p className="text-xs text-neutral-500 mt-4">
            {Math.round(duration/1000)}s - Modo desenvolvimento
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
