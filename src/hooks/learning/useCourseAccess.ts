
import { useQuery } from '@tanstack/react-query';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export const useCourseAccess = (courseId: string) => {
  const { user } = useSimpleAuth();

  return useQuery({
    queryKey: ['course-access', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id || !courseId) {
        return { hasAccess: false, reason: 'not_authenticated' };
      }

      console.log('Simulando verificação de acesso ao curso:', { courseId, userId: user.id });

      // Mock access check since function doesn't exist
      // For now, assume all authenticated users have access
      return { 
        hasAccess: true, 
        reason: 'has_access',
        userRole: user.role || 'member'
      };
    },
    enabled: !!user?.id && !!courseId,
    staleTime: 5 * 60 * 1000
  });
};
