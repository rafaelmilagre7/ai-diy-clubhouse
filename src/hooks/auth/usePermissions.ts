
import { useQuery } from '@tanstack/react-query';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export const usePermissions = () => {
  const { user, isAdmin, isFormacao } = useSimpleAuth();

  return useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Simulate permissions based on roles since RPC doesn't exist
      const permissions: string[] = [];

      if (isAdmin) {
        permissions.push(
          'read:all',
          'write:all',
          'delete:all',
          'manage:users',
          'manage:content',
          'view:analytics'
        );
      } else if (isFormacao) {
        permissions.push(
          'read:content',
          'write:content',
          'manage:courses',
          'view:student_progress'
        );
      } else {
        permissions.push(
          'read:content',
          'write:comments',
          'view:profile'
        );
      }

      return permissions;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  });
};
