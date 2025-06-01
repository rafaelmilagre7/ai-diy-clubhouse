
import { useEffect, useState } from 'react';
import { useUnifiedOnboardingValidation } from './useUnifiedOnboardingValidation';
import { toast } from 'sonner';

export const useFeatureUnlockNotifications = () => {
  const { isOnboardingComplete } = useUnifiedOnboardingValidation();
  const [hasShownNotification, setHasShownNotification] = useState(false);

  useEffect(() => {
    // Verificar se já mostrou a notificação
    const hasShown = localStorage.getItem('feature_unlock_notification_shown');
    
    if (isOnboardingComplete && !hasShown && !hasShownNotification) {
      // Mostrar notificação de funcionalidades desbloqueadas
      setTimeout(() => {
        toast.success('🎉 Funcionalidades Desbloqueadas!', {
          description: 'Agora você tem acesso ao Networking e Trilha de Implementação',
          duration: 5000,
        });
        
        // Marcar como mostrado
        localStorage.setItem('feature_unlock_notification_shown', 'true');
        setHasShownNotification(true);
      }, 1000);
    }
  }, [isOnboardingComplete, hasShownNotification]);

  const resetNotification = () => {
    localStorage.removeItem('feature_unlock_notification_shown');
    setHasShownNotification(false);
  };

  return {
    hasShownNotification,
    resetNotification
  };
};
