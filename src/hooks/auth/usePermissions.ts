
import { useQuery } from '@tanstack/react-query';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export const usePermissions = () => {
  const { user, isAdmin, isFormacao } = useSimpleAuth();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Simulate permissions based on user role
      const basePermissions = ['view_content', 'comment', 'participate'];
      
      if (isAdmin) {
        return [
          ...basePermissions,
          'admin.full_access',
          'community.moderate',
          'users.manage',
          'content.manage',
          'analytics.view'
        ];
      }
      
      if (isFormacao) {
        return [
          ...basePermissions,
          'content.create',
          'content.edit',
          'community.moderate'
        ];
      }
      
      return basePermissions;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  });

  const hasPermission = (permission: string) => {
    return permissions.includes(permission) || isAdmin;
  };

  const hasAnyPermission = (permissionList: string[]) => {
    return permissionList.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionList: string[]) => {
    return permissionList.every(permission => hasPermission(permission));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
    data: permissions,
    roles: permissions, // For backward compatibility
    loading: isLoading // For backward compatibility
  };
};
