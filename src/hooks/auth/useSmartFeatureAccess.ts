
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export const useSmartFeatureAccess = () => {
  const { user, isAdmin, isFormacao } = useSimpleAuth();

  const getAccessLevel = (feature: string) => {
    if (!user) return 'none';
    
    if (isAdmin) return 'full';
    if (isFormacao) {
      if (feature === 'content_creation' || feature === 'courses') return 'full';
      return 'limited';
    }
    
    return 'basic';
  };

  const canAccess = (feature: string, level: 'basic' | 'limited' | 'full' = 'basic') => {
    const userLevel = getAccessLevel(feature);
    
    const levelHierarchy = { 'none': 0, 'basic': 1, 'limited': 2, 'full': 3 };
    
    return levelHierarchy[userLevel] >= levelHierarchy[level];
  };

  return {
    getAccessLevel,
    canAccess,
    isAdmin,
    isFormacao,
    hasUser: !!user
  };
};
