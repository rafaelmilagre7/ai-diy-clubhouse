
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useSyncProfileData } from '@/hooks/networking/useSyncProfileData';

export const ProfileDataSync: React.FC = () => {
  const { user } = useAuth();
  const { syncPhoneFromOnboarding } = useSyncProfileData();

  useEffect(() => {
    if (user?.id) {
      // Sincronizar dados do telefone automaticamente
      syncPhoneFromOnboarding(user.id).catch(error => {
        console.log('Sincronização automática falhou:', error);
      });
    }
  }, [user?.id, syncPhoneFromOnboarding]);

  // Este componente não renderiza nada, apenas executa a sincronização
  return null;
};
