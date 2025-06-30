
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

      console.log('🚀 Gerando trilha para usuário:', user.id);

      // Para fins de demonstração, criar uma trilha mock
      // Futuramente isso será substituído pela chamada da edge function
      const mockTrail: ImplementationTrail = {
        priority1: [
          {
            solutionId: '1',
            justification: 'Solução recomendada baseada no seu perfil',
            aiScore: 95,
            estimatedTime: '2-3 horas'
          }
        ],
        priority2: [
          {
            solutionId: '2',
            justification: 'Segunda prioridade para sua empresa',
            aiScore: 85,
            estimatedTime: '3-4 horas'
          }
        ],
        priority3: [
          {
            solutionId: '3',
            justification: 'Implementação para médio prazo',
            aiScore: 75,
            estimatedTime: '4-5 horas'
          }
        ],
        ai_message: 'Trilha personalizada criada com base nas melhores práticas para sua empresa.',
        generated_at: new Date().toISOString()
      };

      setTrail(mockTrail);
      toast({
        title: 'Trilha gerada com sucesso!',
        description: 'Sua trilha personalizada está pronta.',
      });
    } catch (err: any) {
      console.error('❌ Erro ao gerar trilha:', err);
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
    setIsFirstTimeGeneration(false);
    generateTrail();
  };

  useEffect(() => {
    loadTrail();
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
