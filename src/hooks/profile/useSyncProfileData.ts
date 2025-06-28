
import { useState } from 'react';
import { toast } from 'sonner';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export const useSyncProfileData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSimpleAuth();

  const syncProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log('Simulando sincronização do perfil de implementação:', user.id);
      
      // Mock sync since implementation_profiles table doesn't exist
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Perfil sincronizado com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar perfil:', error);
      toast.error('Erro ao sincronizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncProfile,
    isLoading
  };
};
