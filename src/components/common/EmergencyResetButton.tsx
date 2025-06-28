
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { EmergencyReset } from '@/services/EmergencyReset';
import { toast } from 'sonner';

export const EmergencyResetButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Mostrar botão após 10 segundos se ainda estiver carregando
    const timer = setTimeout(() => {
      if (EmergencyReset.isInEmergencyState()) {
        setShowButton(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleEmergencyReset = async () => {
    if (isResetting) return;
    
    setIsResetting(true);
    toast.info('🚨 Iniciando reset de emergência...');
    
    try {
      await EmergencyReset.performFullReset();
    } catch (error) {
      console.error('Erro no reset de emergência:', error);
      toast.error('Erro no reset. Recarregando página...');
      window.location.reload();
    }
  };

  if (!showButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleEmergencyReset}
        disabled={isResetting}
        className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
        size="lg"
      >
        {isResetting ? (
          <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <AlertTriangle className="h-5 w-5 mr-2" />
        )}
        {isResetting ? 'Resetando...' : 'Reset Sistema'}
      </Button>
    </div>
  );
};
