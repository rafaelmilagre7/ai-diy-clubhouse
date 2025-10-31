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
    // Se ainda está carregando, retornar false temporariamente
    if (permissionsLoading) {
      return false;
    }

    // 1. Verificar permissão por código (sistema novo - RPC)
    const hasCode = hasPermission(code);
    if (hasCode) {
      console.log(`✅ [checkPermission] ${code} → granted via RPC`);
      return true;
    }
    
    // 2. Verificar permissão boolean da role (sistema legado - JSON)
    const rolePermissions = profile?.user_roles?.permissions;
    if (rolePermissions && typeof rolePermissions === 'object') {
      const hasBool = rolePermissions[booleanKey] === true;
      if (hasBool) {
        console.log(`✅ [checkPermission] ${code} → granted via JSON (${booleanKey})`);
        return true;
      }
    }
    
    // 3. Fallback para roles premium conhecidos
    const userRole = profile?.user_roles?.name;
    if (['admin', 'membro_club', 'master_user'].includes(userRole || '')) {
      // Roles premium têm acesso a features principais
      if (['solutions', 'learning', 'tools', 'benefits', 'community', 'networking', 'events'].includes(booleanKey)) {
        console.log(`✅ [checkPermission] ${code} → granted via premium fallback (role: ${userRole})`);
        return true;
      }
    }
    
    console.log(`❌ [checkPermission] ${code} → denied`, { 
      hasCode, 
      rolePermissions, 
      userRole 
    });
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
    canViewMentorships: checkPermission('events.access', 'events'),
    canViewSuggestions: checkPermission('suggestions.access', 'suggestions'),
    canViewAITrail: checkPermission('ai_trail.access', 'ai_trail'),
    canViewCertificates: checkPermission('certificates.access', 'certificates'),
    canViewBuilder: checkPermission('builder.access', 'builder'),
    
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