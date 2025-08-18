
import { useAuth } from '@/contexts/auth';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';
import { getUserRoleName } from '@/lib/supabase/types';
import { usePermissionListener } from './usePermissionListener';
import { usePermissions } from './usePermissions';

export const useFeatureAccess = () => {
  const { profile } = useAuth();
  const userRole = getUserRoleName(profile);
  const roleJsonPermissions = profile?.user_roles?.permissions || {};
  const { userPermissions: permissionCodes = [] } = usePermissions();

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
    return isFeatureEnabledForUser(featureName, userRole, effectivePermissions);
  };

  return {
    hasFeatureAccess,
    isAdmin: userRole === 'admin',
    userRole,
    userPermissions: effectivePermissions,
  };
};
