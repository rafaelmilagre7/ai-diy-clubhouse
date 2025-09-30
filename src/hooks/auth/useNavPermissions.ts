import { useMemo } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useSolutionsAccess } from '@/hooks/auth/useSolutionsAccess';
import { useAuth } from '@/contexts/auth';

/**
 * Hook personalizado para gerenciar permissões de navegação
 * Centraliza as verificações de acesso para diferentes seções
 * Suporta tanto permissões baseadas em códigos quanto permissões boolean das roles
 */
export const useNavPermissions = () => {
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { hasSolutionsAccess, loading: solutionsLoading } = useSolutionsAccess();
  const { profile } = useAuth();

  // Helper para verificar permissão em ambos os sistemas
  const checkPermission = (code: string, booleanKey: string): boolean => {
    // 1. Primeiro verifica permissão por código (sistema novo)
    if (hasPermission(code)) return true;
    
    // 2. Se não encontrou, verifica permissão boolean da role (sistema legado)
    const rolePermissions = profile?.user_roles?.permissions;
    if (rolePermissions && typeof rolePermissions === 'object') {
      return rolePermissions[booleanKey] === true;
    }
    
    return false;
  };

  const permissions = useMemo(() => ({
    // Acesso a funcionalidades principais
    canViewSolutions: hasSolutionsAccess,
    canViewTools: checkPermission('tools.access', 'tools'),
    canViewLearning: checkPermission('learning.access', 'learning'),
    canViewBenefits: checkPermission('benefits.access', 'benefits'),
    canViewNetworking: checkPermission('networking.access', 'networking'),
    canViewCommunity: checkPermission('community.access', 'community'),
    canViewEvents: checkPermission('events.access', 'events'),
    canViewSuggestions: checkPermission('suggestions.access', 'suggestions'),
    canViewAITrail: checkPermission('ai_trail.access', 'ai_trail'),
    canViewCertificates: checkPermission('certificates.access', 'certificates'),
    
    // Meta informações
    loading: permissionsLoading || solutionsLoading
  }), [
    hasSolutionsAccess,
    hasPermission,
    profile,
    permissionsLoading,
    solutionsLoading
  ]);

  return permissions;
};