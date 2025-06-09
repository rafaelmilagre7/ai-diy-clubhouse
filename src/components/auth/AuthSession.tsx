
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import { logger } from '@/utils/logger';

const AuthSession = () => {
  const { user, isLoading, profile } = useAuth();

  // Log de debug para monitorar o estado
  useEffect(() => {
    logger.info('[AuthSession] Estado atual', {
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role,
      isLoading: isLoading,
      component: 'AUTH_SESSION'
    });
  }, [user, profile, isLoading]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return null;
};

export default AuthSession;
