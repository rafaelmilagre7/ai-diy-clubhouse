
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export const EmergencyResetButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Mostrar botão após 15 segundos se ainda estiver na tela
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleEmergencyReset = async () => {
    if (isResetting) return;
    
    setIsResetting(true);
    toast.info('🚨 Iniciando reset de emergência...');
    
    try {
      // Limpar localStorage
      Object.keys(localStorage).forEach(key => {
        if (
          key.startsWith('supabase') ||
          key.startsWith('sb-') ||
          key.includes('auth') ||
          key.includes('session')
        ) {
          localStorage.removeItem(key);
        }
      });
      
      // Limpar sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Limpar cache do browser se possível
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      toast.success('Reset concluído! Redirecionando...');
      
      // Aguardar um momento e recarregar
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } catch (error) {
      console.error('Erro durante reset:', error);
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

export default EmergencyResetButton;
