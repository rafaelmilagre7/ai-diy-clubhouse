import { useAuth } from '@/contexts/auth';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
import { useCourseIndividualAccess } from '@/hooks/learning/useCourseIndividualAccess';
import { useToolAccess } from '@/hooks/learning/useToolAccess';

/**
 * Hook unificado para controle de acesso
 * Consolida verificações de features, cursos e ferramentas
 */
export const useAccessControl = () => {
  const { user, profile } = useAuth();
  const { hasFeatureAccess, userRole, userPermissions } = useFeatureAccess();

  // Verificar acesso a uma seção da plataforma (learning, tools, etc.)
  const canAccessSection = (sectionName: string): boolean => {
    return hasFeatureAccess(sectionName);
  };

  // Verificar acesso a um curso específico
  const useCourseAccess = (courseId: string) => {
    return useCourseIndividualAccess(courseId);
  };

  // Verificar acesso a uma ferramenta específica
  const useToolAccessCheck = (toolId: string) => {
    return useToolAccess(toolId);
  };

  // Verificar se usuário pode ver conteúdo premium
  const canAccessPremiumContent = (): boolean => {
    return userRole === 'admin' || 
           userRole === 'member' || 
           userRole === 'membro_club';
  };

  // Obter lista de funcionalidades bloqueadas (para upsell)
  const getBlockedFeatures = (): string[] => {
    const allFeatures = ['solutions', 'learning', 'tools', 'benefits', 'networking', 'events', 'community', 'certificates'];
    return allFeatures.filter(feature => !hasFeatureAccess(feature));
  };

  return {
    canAccessSection,
    useCourseAccess,
    useToolAccessCheck,
    canAccessPremiumContent,
    getBlockedFeatures,
    userRole,
    userPermissions,
    isAdmin: userRole === 'admin'
  };
};