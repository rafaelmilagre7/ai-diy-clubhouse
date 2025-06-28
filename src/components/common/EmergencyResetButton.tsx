
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { EmergencyReset } from '@/services/EmergencyReset';
import AuthManager from '@/services/AuthManager';

const EmergencyResetButton = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // CORREÇÃO 4: Mostrar apenas se está travado há mais de 30 segundos
  const [shouldShow, setShouldShow] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, 30000); // 30 segundos

    return () => clearTimeout(timer);
  }, []);

  const handleReset = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      setIsResetting(true);
      console.log('[EMERGENCY-RESET] 🚨 Iniciando reset de emergência');
      
      // Primeiro tentar forçar acesso via AuthManager
      const authManager = AuthManager.getInstance();
      authManager.forceAccess();
      
      // Se não funcionar em 3 segundos, fazer reset completo
      setTimeout(async () => {
        if (isResetting) {
          console.log('[EMERGENCY-RESET] 🚨 Reset completo necessário');
          await EmergencyReset.performFullReset();
        }
      }, 3000);
      
    } catch (error) {
      console.error('[EMERGENCY-RESET] Erro:', error);
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showConfirm ? (
        <Button
          onClick={handleReset}
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
          disabled={isResetting}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Reset Sistema
        </Button>
      ) : (
        <div className="bg-red-900/90 border border-red-500 rounded-lg p-4 max-w-sm">
          <div className="text-white text-sm mb-3">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Confirmar reset completo do sistema?
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleReset}
              variant="destructive"
              size="sm"
              disabled={isResetting}
            >
              {isResetting ? (
                <RotateCcw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              {isResetting ? 'Resetando...' : 'Confirmar'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="text-white border-gray-500"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyResetButton;
