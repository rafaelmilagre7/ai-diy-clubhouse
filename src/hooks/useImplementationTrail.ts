
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
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
  const { toast } = useToast();
  
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isFirstTimeGeneration, setIsFirstTimeGeneration] = useState(false);

  const loadTrail = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Buscando trilha existente para usuário:', user.id);

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
        console.error('❌ Erro ao buscar trilha:', trailError);
        throw new Error('Erro ao carregar trilha de implementação');
      }

      if (existingTrail && existingTrail.trail_data) {
        console.log('✅ Trilha existente encontrada');
        setTrail(existingTrail.trail_data as ImplementationTrail);
        setIsFirstTimeGeneration(false);
      } else {
        console.log('📝 Nenhuma trilha encontrada, gerando nova');
        setIsFirstTimeGeneration(true);
        await generateTrail();
      }
    } catch (err: any) {
      console.error('❌ Erro no useImplementationTrail:', err);
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

      console.log('🚀 Gerando trilha inteligente para usuário:', user.id);

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

      console.log('✅ Trilha inteligente gerada:', {
        personalização: data.personalization_insights,
        categorias: data.trail.priority1.length + data.trail.priority2.length + data.trail.priority3.length
      });

      setTrail(data.trail);
      toast({
        title: 'Trilha inteligente gerada!',
        description: `Personalização: ${Math.round(data.personalization_insights.avg_score)}% de compatibilidade`,
      });
    } catch (err: any) {
      console.error('❌ Erro ao gerar trilha:', err);
      setError(err.message || 'Erro ao gerar trilha');
      
      // Fallback para trilha básica em caso de erro
      console.log('📝 Gerando trilha básica como fallback...');
      const fallbackTrail: ImplementationTrail = {
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
        ai_message: 'Trilha básica criada. Complete seu onboarding para uma experiência mais personalizada.',
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
