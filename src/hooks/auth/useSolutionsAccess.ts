import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useFeatureAccess } from './useFeatureAccess';

export const useSolutionsAccess = () => {
  const { user } = useAuth();
  const { hasFeatureAccess, userRole } = useFeatureAccess();
  const [loading, setLoading] = useState(true);

  // Usar o novo sistema de controle de acesso baseado em features
  const hasSolutionsAccess = hasFeatureAccess('solutions');

  useEffect(() => {
    if (user?.id) {
      setLoading(false);
      
      // Log para debug
      console.log('🔐 [SOLUTIONS ACCESS CHECK]', {
        userRole,
        hasSolutionsAccess,
        userId: user.id.substring(0, 8) + '***',
        timestamp: new Date().toISOString()
      });
    }
  }, [user?.id, userRole, hasSolutionsAccess]);

  return {
    hasSolutionsAccess,
    loading
  };
};