import { useMemo } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useSolutionsAccess } from '@/hooks/auth/useSolutionsAccess';

/**
 * Hook personalizado para gerenciar permissões de navegação
 * Centraliza as verificações de acesso para diferentes seções
 */
export const useNavPermissions = () => {
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { hasSolutionsAccess, loading: solutionsLoading } = useSolutionsAccess();

  const permissions = useMemo(() => ({
    // Acesso a funcionalidades principais
    canViewSolutions: hasSolutionsAccess,
    canViewTools: hasPermission('tools.access'),
    canViewLearning: hasPermission('learning.access'),
    canViewBenefits: hasPermission('benefits.access'),
    canViewNetworking: hasPermission('networking.access'),
    canViewCommunity: hasPermission('community.access'),
    canViewEvents: hasPermission('events.access'),
    canViewSuggestions: hasPermission('suggestions.access'),
    canViewAITrail: hasPermission('ai_trail.access'),
    canViewCertificates: hasPermission('certificates.access'),
    
    // Meta informações
    loading: permissionsLoading || solutionsLoading
  }), [
    hasSolutionsAccess,
    hasPermission,
    permissionsLoading,
    solutionsLoading
  ]);

  return permissions;
};