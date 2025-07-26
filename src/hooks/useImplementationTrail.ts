
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ImplementationTrailData } from '@/types/implementationTrail';

export function useImplementationTrail() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [trail, setTrail] = useState<ImplementationTrailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isFirstTimeGeneration, setIsFirstTimeGeneration] = useState(false);

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
        
        throw new Error('Erro ao carregar trilha de implementação');
      }

      if (existingTrail && existingTrail.trail_data) {
        
        setTrail(existingTrail.trail_data as ImplementationTrailData);
        setIsFirstTimeGeneration(false);
      } else {
        
        setIsFirstTimeGeneration(true);
        await generateTrail();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar trilha');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrail = async () => {
    if (!user?.id) {
      setError('Usuário necessário para gerar trilha');
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);

      // Chamar a edge function de geração inteligente
      const { data, error } = await supabase.functions.invoke('generate-smart-trail', {
        body: { userId: user.id }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao gerar trilha');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido ao gerar trilha');
      }

      setTrail(data.trail);
      
      // Limpar cache de soluções para forçar reload dos dados reais
      try {
        sessionStorage.removeItem('trail_solutions_cache');
      } catch (error) {
        console.warn('Erro ao limpar cache de soluções:', error);
      }
      
      toast({
        title: 'Trilha inteligente gerada!',
        description: `Personalização: ${Math.round(data.personalization_insights.avg_score)}% de compatibilidade`,
      });
    } catch (err: any) {
      setError('Não foi possível gerar sua trilha personalizada. Gerando trilha padrão...');
      
      // Fallback para trilha básica em caso de erro
      const fallbackTrail: ImplementationTrailData = {
        priority1: [
          {
            solutionId: '9d867a8b-815b-42cb-b8f9-28190a60aaee',
            justification: 'Solução recomendada para começar com IA no LinkedIn',
            aiScore: 85,
            estimatedTime: '2-3 horas'
          }
        ],
        priority2: [
          {
            solutionId: 'ebc873b7-4f1e-408c-a041-fe346af8c22e',
            justification: 'Assistente de IA para atendimento automatizado',
            aiScore: 75,
            estimatedTime: '3-4 horas'
          }
        ],
        priority3: [
          {
            solutionId: 'e5520bbc-d876-4aa7-bdb0-66382ca1a4c4',
            justification: 'Solução avançada para prospecção',
            aiScore: 65,
            estimatedTime: '1-2 dias'
          }
        ],
        recommended_lessons: [
          {
            lessonId: 'lesson-1',
            moduleId: 'module-1',
            courseId: 'course-1',
            title: 'Introdução à IA para Negócios',
            justification: 'Fundamentos essenciais para começar com IA',
            priority: 1
          },
          {
            lessonId: 'lesson-2',
            moduleId: 'module-2',
            courseId: 'course-1',
            title: 'Ferramentas de IA para Produtividade',
            justification: 'Aprenda as principais ferramentas disponíveis',
            priority: 2
          },
          {
            lessonId: 'lesson-3',
            moduleId: 'module-3',
            courseId: 'course-2',
            title: 'IA Aplicada ao Marketing Digital',
            justification: 'Como usar IA para melhorar suas campanhas',
            priority: 3
          }
        ],
        ai_message: 'Trilha básica criada. Complete seu perfil para uma experiência mais personalizada.',
        generated_at: new Date().toISOString()
      };

      setTrail(fallbackTrail);
      toast({
        title: 'Trilha básica criada',
        description: 'Complete seu perfil para uma experiência mais personalizada.',
        variant: 'default',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const regenerateTrail = () => {
    setIsFirstTimeGeneration(false);
    generateTrail();
  };

  // Evitar chamadas duplicadas usando useEffect com dependências específicas
  useEffect(() => {
    if (user?.id) {
      loadTrail();
    }
  }, [user?.id]);

  return {
    trail,
    isLoading,
    error,
    regenerateTrail,
    isRegenerating,
    isFirstTimeGeneration,
  };
}
