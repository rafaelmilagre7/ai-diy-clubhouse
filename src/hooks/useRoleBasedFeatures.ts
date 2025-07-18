import { usePermissions } from "@/hooks/usePermissions";

export function useRoleBasedFeatures() {
  const { data: permissions } = usePermissions();

  return {
    // Controle de acesso granular
    canAccessAdmin: permissions?.canAccessAdmin || false,
    canAccessFormacao: permissions?.canAccessFormacao || false,
    canManageUsers: permissions?.canManageUsers || false,
    canManageContent: permissions?.canManageContent || false,
    canViewAnalytics: permissions?.canViewAnalytics || false,
    
    // Informações do role
    roleName: permissions?.roleName || null,
    
    // Helpers de verificação
    isAdmin: permissions?.isAdmin || false,
    isFormacao: permissions?.isFormacao || false,
    isMember: permissions?.isMember || false,
    
    // Verificação de features específicas
    hasFeatureAccess: (feature: string) => {
      switch (feature) {
        case 'admin_dashboard':
          return permissions?.canAccessAdmin || false;
        case 'course_management':
          return permissions?.canManageContent || false;
        case 'user_management':
          return permissions?.canManageUsers || false;
        case 'analytics':
          return permissions?.canViewAnalytics || false;
        case 'community':
          return permissions?.isMember || false;
        default:
          return false;
      }
    }
  };
}