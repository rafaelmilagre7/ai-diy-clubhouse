
import { useAuth } from '@/contexts/auth';
import { isFeatureEnabledForUser, APP_FEATURES } from '@/config/features';
import { getUserRoleName } from '@/lib/supabase/types';
import { usePermissionListener } from './usePermissionListener';

export const useFeatureAccess = () => {
  const { profile } = useAuth();
  const userRole = getUserRoleName(profile);
  
  // ✅ CORREÇÃO FASE 1: Usar APENAS as permissões do JSON do role (configuradas no admin)
  // Não mais combinar com sistema antigo que pode estar vazio
  const roleJsonPermissions = profile?.user_roles?.permissions || {};

  // 🔄 Detectar mudanças de permissões em tempo real
  usePermissionListener();

  const hasFeatureAccess = (featureName: string) => {
    // ✅ CORREÇÃO FASE 4: Remover exceção especial para networking
    // Usar mesma lógica unificada para todas as features
    return isFeatureEnabledForUser(featureName, userRole, roleJsonPermissions);
  };

  return {
    hasFeatureAccess,
    isAdmin: userRole === 'admin',
    userRole,
    userPermissions: roleJsonPermissions,
  };
};
