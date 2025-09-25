import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useSmartFeatureAccess } from './useSmartFeatureAccess';

interface SolutionSpecificAccessResult {
  hasAccess: boolean;
  accessType: 'general' | 'specific' | 'none';
  loading: boolean;
}

export const useSolutionSpecificAccess = (solutionId: string): SolutionSpecificAccessResult => {
  const { user, profile } = useAuth();
  const { data: generalAccess } = useSmartFeatureAccess('solutions');

  const { data: specificAccess, isLoading } = useQuery({
    queryKey: ['solution-specific-access', solutionId, profile?.role_id],
    queryFn: async () => {
      if (!profile?.role_id || !solutionId) {
        return false;
      }

      const { data, error } = await supabase
        .from('solution_access_overrides')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('role_id', profile.role_id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar acesso específico:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user && !!profile?.role_id && !!solutionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Determinar tipo de acesso
  let accessType: 'general' | 'specific' | 'none' = 'none';
  let hasAccess = false;

  if (generalAccess?.hasAccess) {
    accessType = 'general';
    hasAccess = true;
  } else if (specificAccess) {
    accessType = 'specific';
    hasAccess = true;
  }

  return {
    hasAccess,
    accessType,
    loading: isLoading,
  };
};