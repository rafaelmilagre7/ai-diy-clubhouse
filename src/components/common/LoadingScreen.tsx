
import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingScreenProps {
  message?: string;
  showEmergencyButton?: boolean;
  emergencyAction?: () => void;
  timeout?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando...",
  showEmergencyButton = true,
  emergencyAction,
  timeout = 10000 // 10 segundos
}) => {
  const [duration, setDuration] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    console.log('[DEBUG-LOADING-SCREEN] 🎬 Iniciando LoadingScreen:', { message, timeout });
    
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setDuration(elapsed);
      
      // Mostrar botão de emergência após 5 segundos
      if (elapsed > 5000 && showEmergencyButton && !showButton) {
        console.log('[DEBUG-LOADING-SCREEN] ⏰ Mostrando botão de emergência após 5s');
        setShowButton(true);
      }

      // Timeout após o tempo especificado
      if (elapsed > timeout && !isTimedOut) {
        console.error('[DEBUG-LOADING-SCREEN] 🚨 TIMEOUT atingido:', elapsed, 'ms');
        setIsTimedOut(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showEmergencyButton, timeout, message]);

  const handleEmergencyAction = () => {
    console.log('[DEBUG-LOADING-SCREEN] 🆘 Ação de emergência executada');
    if (emergencyAction) {
      emergencyAction();
    } else {
      // Ação padrão: recarregar página
      window.location.reload();
    }
  };

  const getProgressWidth = () => {
    return Math.min((duration / timeout) * 100, 100);
  };

  const getCurrentMessage = () => {
    if (isTimedOut) return 'Tempo limite atingido';
    if (duration < 3000) return message || 'Configurando sua experiência...';
    if (duration < 6000) return 'Carregando seus dados...';
    if (duration < 10000) return 'Quase pronto...';
    return 'Verificando conectividade...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex items-center justify-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-16 w-auto mb-4"
          />
        </div>
        
        <div className="flex items-center justify-center space-x-3">
          {isTimedOut ? (
            <AlertTriangle className="h-6 w-6 text-orange-400" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-viverblue" />
          )}
          <span className={`text-lg font-medium ${isTimedOut ? 'text-orange-400' : 'text-white'}`}>
            {getCurrentMessage()}
          </span>
        </div>
        
        {/* Barra de progresso visual */}
        <div className="w-64 bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ease-out ${
              isTimedOut ? 'bg-orange-400' : 'bg-viverblue'
            }`}
            style={{ width: `${getProgressWidth()}%` }}
          />
        </div>
        
        <p className={`text-sm ${isTimedOut ? 'text-orange-300' : 'text-neutral-300'}`}>
          {isTimedOut 
            ? 'O carregamento está demorando mais que o esperado'
            : getCurrentMessage()
          }
        </p>

        {/* Informações de debug em desenvolvimento */}
        {import.meta.env.DEV && (
          <div className="text-xs text-neutral-500 space-y-1">
            <p>Tempo decorrido: {(duration / 1000).toFixed(1)}s</p>
            <p>Timeout em: {(timeout / 1000)}s</p>
          </div>
        )}

        {/* Botões de ação */}
        {(showButton || isTimedOut) && (
          <div className="mt-6 space-y-3">
            {isTimedOut && (
              <div className="flex items-center justify-center space-x-2 text-orange-400 mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Carregamento interrompido</span>
              </div>
            )}
            
            <Button 
              onClick={handleEmergencyAction}
              variant="outline"
              size="sm"
              className={`w-full ${
                isTimedOut 
                  ? 'border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white' 
                  : 'border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white'
              }`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isTimedOut ? 'Recarregar Página' : 'Forçar Carregamento'}
            </Button>

            {isTimedOut && (
              <Button 
                onClick={() => window.location.href = '/login'}
                variant="ghost"
                size="sm"
                className="w-full text-gray-400 hover:text-white"
              >
                Ir para Login
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
