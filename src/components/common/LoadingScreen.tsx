
import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyResetButton } from './EmergencyResetButton';
import { EmergencyReset } from '@/services/EmergencyReset';

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
      
      // Mostrar botão de emergência após 8 segundos (reduzido de 10)
      if (elapsed > 8000 && showEmergencyButton) {
        setShowButton(true);
        EmergencyReset.markEmergencyState();
      }
    }, 100);

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
        
        {/* Barra de progresso visual */}
        <div className="w-64 bg-gray-700 rounded-full h-2">
          <div 
            className="bg-viverblue h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min((duration / 8000) * 100, 100)}%` }}
          />
        </div>
        
        <p className="text-sm text-neutral-300">
          {duration < 2000 ? 'Configurando sua experiência...' :
           duration < 5000 ? 'Carregando seus dados...' :
           duration < 8000 ? 'Quase pronto...' :
           'Carregamento demorado detectado...'}
        </p>

        {/* Botão de emergência local */}
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
                onClick={() => EmergencyReset.performFullReset()}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Reset Sistema
              </Button>
            </div>
          </div>
        )}

        {/* Debug info em desenvolvimento */}
        {import.meta.env.DEV && (
          <p className="text-xs text-neutral-500 mt-4">
            {duration}ms - Retry disponível em {Math.max(0, 8000 - duration)}ms
          </p>
        )}
      </div>
      
      {/* Botão de emergência global */}
      <EmergencyResetButton />
    </div>
  );
};

export default LoadingScreen;
