
import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth';

export const useLearningAccess = () => {
  const { profile } = useAuth();

  const hasLearningAccess = useMemo(() => {
    if (!profile?.role) return false;
    
    // Usuários com role 'formacao' ou 'admin' têm acesso total
    // Usuários 'member' têm acesso limitado
    return ['formacao', 'admin', 'member'].includes(profile.role);
  }, [profile?.role]);

  const canAccessLesson = useMemo(() => (courseId: string, lessonId: string) => {
    if (!hasLearningAccess) return false;
    
    // Admin e formacao têm acesso total
    if (['admin', 'formacao'].includes(profile?.role || '')) {
      return true;
    }
    
    // Members têm acesso baseado nas regras do curso
    return true; // Por enquanto, permitir acesso para members
  }, [hasLearningAccess, profile?.role]);

  return {
    hasLearningAccess,
    canAccessLesson,
    userRole: profile?.role || 'member'
  };
};
