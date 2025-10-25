import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface LearningRecommendation {
  id: string;
  solution_id: string;
  lesson_id: string;
  relevance_score: number;
  justification: string;
  key_topics: string[];
  created_at: string;
  lesson?: {
    id: string;
    title: string;
    description: string;
    cover_image_url?: string;
    learning_modules: Array<{
      title: string;
      learning_courses: Array<{
        id: string;
        title: string;
      }>;
    }> | {
      title: string;
      learning_courses: Array<{
        id: string;
        title: string;
      }> | {
        id: string;
        title: string;
      };
    };
  };
}

export const useLearningRecommendations = (solutionId: string | undefined) => {
  return useQuery({
    queryKey: ['learning-recommendations', solutionId],
    queryFn: async () => {
      if (!solutionId) {
        throw new Error('solutionId é obrigatório');
      }

      console.log('Buscando recomendações para solução:', solutionId);

      // 1. Verificar se já existem recomendações no banco (cache)
      const { data: existing, error: existingError } = await supabase
        .from('solution_learning_recommendations')
        .select(`
          *,
          lesson:learning_lessons (
            id,
            title,
            description,
            cover_image_url,
            learning_modules (
              title,
              learning_courses (
                id,
                title
              )
            )
          )
        `)
        .eq('solution_id', solutionId)
        .order('relevance_score', { ascending: false });

      if (existingError) {
        console.error('Erro ao buscar recomendações existentes:', existingError);
        throw existingError;
      }

      // Se já existem recomendações, retornar do cache
      if (existing && existing.length > 0) {
        console.log(`✅ Encontradas ${existing.length} recomendações no cache`);
        console.log('Primeira recomendação:', existing[0]);
        return existing as LearningRecommendation[];
      }

      // 2. Se não existir, gerar via edge function
      console.log('Nenhuma recomendação encontrada, gerando via IA...');
      const { data: generated, error: generateError } = await supabase.functions.invoke(
        'recommend-learning-content',
        {
          body: { solutionId }
        }
      );

      if (generateError) {
        console.error('Erro ao gerar recomendações:', generateError);
        throw generateError;
      }

      if (!generated?.success || !generated?.recommendations) {
        console.warn('Nenhuma recomendação gerada pela IA');
        return [];
      }

      console.log(`Geradas ${generated.recommendations.length} recomendações pela IA`);
      
      // Mapear para o formato esperado
      return generated.recommendations.map((rec: any) => ({
        id: rec.lessonId,
        solution_id: solutionId,
        lesson_id: rec.lessonId,
        relevance_score: rec.relevanceScore,
        justification: rec.justification,
        key_topics: rec.keyTopics || [],
        created_at: new Date().toISOString(),
        lesson: rec.lesson
      })) as LearningRecommendation[];
    },
    enabled: !!solutionId,
    staleTime: 1000 * 60 * 60 * 24, // Cache por 24h
    retry: 1
  });
};
