
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingData } from '@/hooks/useOnboardingData';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ImplementationTrail {
  priority1: Array<{
    solutionId: string;
    justification: string;
    aiScore: number;
    estimatedTime: string;
  }>;
  priority2: Array<{
    solutionId: string;
    justification: string;
    aiScore: number;
    estimatedTime: string;
  }>;
  priority3: Array<{
    solutionId: string;
    justification: string;
    aiScore: number;
    estimatedTime: string;
  }>;
  recommended_lessons?: Array<{
    lessonId: string;
    moduleId: string;
    courseId: string;
    title: string;
    justification: string;
    priority: number;
  }>;
  ai_message?: string;
  generated_at: string;
}

export function useImplementationTrail() {
  const { user } = useAuth();
  const { data: onboardingData } = useOnboardingData();
  const { toast } = useToast();
  
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadTrail = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Buscar trilha existente
      const { data: existingTrail, error: trailError } = await supabase
        .from('implementation_trails')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (trailError) {
        console.error('Erro ao buscar trilha:', trailError);
        throw new Error('Erro ao carregar trilha de implementação');
      }

      if (existingTrail && existingTrail.trail_data) {
        setTrail(existingTrail.trail_data as ImplementationTrail);
      } else {
        // Se não tem trilha, gerar uma nova
        await generateTrail();
      }
    } catch (err: any) {
      console.error('Erro no useImplementationTrail:', err);
      setError(err.message || 'Erro ao carregar trilha');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrail = async () => {
    if (!user?.id || !onboardingData) {
      setError('Dados do onboarding necessários para gerar trilha');
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);

      console.log('Gerando trilha para usuário:', user.id);

      // Chamar edge function para gerar trilha
      const { data, error: generateError } = await supabase.functions.invoke(
        'generate-implementation-trail',
        {
          body: {
            user_id: user.id,
            onboarding_data: {
              personal_info: {
                name: onboardingData.name,
                email: onboardingData.email,
              },
              professional_info: {
                company_name: onboardingData.companyName,
                role: onboardingData.position,
                company_size: onboardingData.companySize,
                company_segment: onboardingData.businessSector,
                annual_revenue_range: onboardingData.annualRevenue,
              },
              ai_experience: {
                knowledge_level: onboardingData.aiKnowledgeLevel,
                uses_ai: onboardingData.hasImplementedAI,
                main_goal: onboardingData.mainObjective,
              },
            },
          },
        }
      );

      if (generateError) {
        console.error('Erro na edge function:', generateError);
        throw new Error('Erro ao gerar trilha personalizada');
      }

      if (data?.success && data?.trail_data) {
        console.log('Trilha gerada com sucesso:', data.trail_data);

        // Chamar função de aprimoramento com IA
        const { error: enhanceError } = await supabase.functions.invoke(
          'enhance-trail-with-ai',
          {
            body: {
              user_id: user.id,
              trail_data: data.trail_data,
              user_profile: {
                company_name: onboardingData.companyName,
                company_segment: onboardingData.businessSector,
                company_size: onboardingData.companySize,
                ai_knowledge_level: onboardingData.aiKnowledgeLevel,
                main_goal: onboardingData.mainObjective,
              },
            },
          }
        );

        if (enhanceError) {
          console.warn('Erro ao aprimorar trilha com IA:', enhanceError);
        }

        setTrail(data.trail_data);
        toast({
          title: 'Trilha gerada com sucesso!',
          description: 'Sua trilha personalizada está pronta.',
        });
      } else {
        throw new Error('Falha ao gerar trilha');
      }
    } catch (err: any) {
      console.error('Erro ao gerar trilha:', err);
      setError(err.message || 'Erro ao gerar trilha');
      toast({
        title: 'Erro ao gerar trilha',
        description: 'Não foi possível gerar sua trilha personalizada.',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const regenerateTrail = () => {
    generateTrail();
  };

  useEffect(() => {
    loadTrail();
  }, [user?.id, onboardingData]);

  return {
    trail,
    isLoading,
    error,
    regenerateTrail,
    isRegenerating,
  };
}
