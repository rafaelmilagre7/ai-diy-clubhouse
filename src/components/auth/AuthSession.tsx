
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { fetchUserProfileSecurely } from '@/hooks/auth/utils/authSessionUtils';
import LoadingScreen from '@/components/common/LoadingScreen';

const AuthSession = () => {
  const { 
    user, 
    isLoading, 
    setProfile, 
    setIsLoading 
  } = useAuth();

  // Carrega o perfil do usuário quando o usuário é autenticado
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        console.log("Carregando perfil para usuário:", user.id);
        
        const profile = await fetchUserProfileSecurely(user.id);
        
        if (profile) {
          console.log("Perfil carregado:", profile);
          setProfile(profile);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadUserProfile();
    }
  }, [user, setProfile, setIsLoading]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return null;
};

export default AuthSession;
