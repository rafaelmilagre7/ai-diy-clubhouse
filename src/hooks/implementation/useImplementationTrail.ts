
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImplementationTrail } from '@/types/implementation-trail';
import { sanitizeTrailData } from './useImplementationTrail.utils';

export const useImplementationTrail = () => {
  const { user } = useAuth();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar trilha existente
  const loadTrail = useCallback(async (forceReload = false) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: trailError } = await supabase
        .from('implementation_trails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (trailError && trailError.code !== 'PGRST116') {
        throw trailError;
      }

      if (data?.trail_data) {
        const sanitizedTrail = sanitizeTrailData(data.trail_data);
        setTrail(sanitizedTrail);
      } else {
        setTrail(null);
      }
    } catch (error) {
      console.error('Erro ao carregar trilha:', error);
      setError('Erro ao carregar trilha de implementação');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Gerar nova trilha
  const generateImplementationTrail = useCallback(async (onboardingData: any = null) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Se não temos dados de onboarding, buscar do quick_onboarding
      let userData = onboardingData;
      if (!userData) {
        const { data: quickData } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (quickData) {
          userData = {
            personal_info: {
              name: quickData.name,
              email: quickData.email
            },
            professional_info: {
              company_name: quickData.company_name,
              role: quickData.role,
              company_size: quickData.company_size,
              company_segment: quickData.company_segment,
              annual_revenue_range: quickData.annual_revenue_range
            },
            ai_experience: {
              knowledge_level: quickData.ai_knowledge_level,
              uses_ai: quickData.uses_ai,
              main_goal: quickData.main_goal
            }
          };
        }
      }

      // Chamar edge function para gerar trilha
      const { data, error: functionError } = await supabase.functions.invoke('generate-implementation-trail', {
        body: { 
          user_id: user.id,
          onboarding_data: userData 
        }
      });

      if (functionError) throw functionError;

      if (data?.trail_data) {
        const sanitizedTrail = sanitizeTrailData(data.trail_data);
        setTrail(sanitizedTrail);
        toast.success('Trilha de implementação gerada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao gerar trilha:', error);
      setError('Erro ao gerar trilha de implementação');
      toast.error('Erro ao gerar trilha de implementação');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Carregar trilha ao montar o componente
  useEffect(() => {
    loadTrail();
  }, [loadTrail]);

  const hasContent = trail && (
    (trail.priority1 && trail.priority1.length > 0) ||
    (trail.priority2 && trail.priority2.length > 0) ||
    (trail.priority3 && trail.priority3.length > 0)
  );

  return {
    trail,
    isLoading,
    error,
    hasContent: !!hasContent,
    refreshTrail: loadTrail,
    generateImplementationTrail
  };
};
