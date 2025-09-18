
import { useAuth } from '@/contexts/auth';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';
import { getUserRoleName } from '@/lib/supabase/types';
import { usePermissionListener } from './usePermissionListener';
import { usePermissions } from './usePermissions';

export const useFeatureAccess = () => {
  const { profile, isLoading } = useAuth();
  const userRole = getUserRoleName(profile);
  const roleJsonPermissions = profile?.user_roles?.permissions || {};
  const { userPermissions: permissionCodes = [], hasPermission, loading: permissionsLoading } = usePermissions();

  // Mapear permission codes (ex: 'tools.access') para flags de features
  const permsFromCodes = permissionCodes.reduce<Record<string, boolean>>((acc, code) => {
    const normalized = String(code).toLowerCase();
    if (normalized.includes('.access')) {
      const featureKey = normalized.replace('.access', '').trim();
      // mapear nomes que não batem 1:1
      if (featureKey === 'certificados') acc['certificates'] = true;
      else acc[featureKey] = true;
    }
    return acc;
  }, {});

  // Combinar permissões do JSON do role com os codes atribuídos
  const effectivePermissions = { ...roleJsonPermissions, ...permsFromCodes } as Record<string, any>;

  // 🔄 Detectar mudanças de permissões em tempo real
  usePermissionListener();

  const hasFeatureAccess = (featureName: string) => {
    // CORREÇÃO DE EMERGÊNCIA: Fallback inteligente e robusto
    if (isLoading || permissionsLoading) {
      console.log(`🔄 [FEATURE-ACCESS] Loading state - permitindo acesso à ${featureName}`);
      return true; // Permitir acesso durante loading
    }
    
    if (!profile) {
      // EMERGÊNCIA: Se não há perfil, permitir funcionalidades básicas
      const basicFeatures = ['solutions', 'learning', 'community', 'networking', 'tools'];
      const hasBasicAccess = basicFeatures.includes(featureName);
      
      if (hasBasicAccess) {
        console.log(`🆘 [FEATURE-ACCESS] EMERGÊNCIA: Permitindo acesso básico à ${featureName}`);
        return true;
      }
      
      console.log(`⚠️ [FEATURE-ACCESS] Sem perfil - negando acesso à feature avançada: ${featureName}`);
      return false;
    }
    
    // Para networking, usar o sistema mais direto de permissões
    if (featureName === 'networking') {
      return hasPermission('networking.access');
    }
    
    try {
      return isFeatureEnabledForUser(featureName, userRole, effectivePermissions);
    } catch (error) {
      console.warn(`⚠️ [FEATURE-ACCESS] Erro ao verificar feature ${featureName}, permitindo acesso:`, error);
      return true; // Fail-open em caso de erro
    }
  };

  return {
    hasFeatureAccess,
    isAdmin: userRole === 'admin',
    userRole,
    userPermissions: effectivePermissions,
  };
};
