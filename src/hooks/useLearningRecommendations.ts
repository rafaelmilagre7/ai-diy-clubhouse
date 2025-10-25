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

      console.log('[RECOMMENDATIONS] 🔍 Buscando recomendações para:', solutionId);

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
        console.error('[RECOMMENDATIONS] ❌ Erro ao buscar cache:', existingError);
        throw existingError;
      }

      // Se já existem recomendações, retornar do cache
      if (existing && existing.length > 0) {
        console.log(`[RECOMMENDATIONS] ✅ ${existing.length} recomendações encontradas no cache`);
        return existing as LearningRecommendation[];
      }

      // 2. Se não existir, gerar via edge function (com timeout)
      console.log('[RECOMMENDATIONS] 🤖 Gerando recomendações via IA...');
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout após 60 segundos')), 60000)
      );

      const invokePromise = supabase.functions.invoke(
        'recommend-learning-content',
        {
          body: { solutionId }
        }
      );

      try {
        const { data: generated, error: generateError } = await Promise.race([
          invokePromise,
          timeoutPromise
        ]) as any;

        if (generateError) {
          console.error('[RECOMMENDATIONS] ❌ Erro ao gerar:', generateError);
          throw new Error(generateError.message || 'Erro ao gerar recomendações');
        }

        if (!generated?.success || !generated?.recommendations) {
          console.warn('[RECOMMENDATIONS] ⚠️ IA não retornou recomendações');
          return [];
        }

        console.log(`[RECOMMENDATIONS] ✅ ${generated.recommendations.length} recomendações geradas`);
        
        // Buscar dados completos das lessons no banco
        const lessonIds = generated.recommendations.map((rec: any) => rec.lessonId);
        
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select(`
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
          `)
          .in('id', lessonIds);

        if (lessonsError) {
          console.error('[RECOMMENDATIONS] ❌ Erro ao buscar lessons:', lessonsError);
          // Retornar sem dados da lesson, o componente vai filtrar
          return generated.recommendations.map((rec: any) => ({
            id: rec.lessonId,
            solution_id: solutionId,
            lesson_id: rec.lessonId,
            relevance_score: rec.relevanceScore,
            justification: rec.justification,
            key_topics: rec.keyTopics || [],
            created_at: new Date().toISOString(),
            lesson: undefined
          })) as LearningRecommendation[];
        }

        // Criar mapa de lessons por ID
        const lessonsMap = new Map(lessonsData?.map(l => [l.id, l]) || []);
        
        // Mapear recomendações com dados completos das lessons
        const enrichedRecommendations = generated.recommendations.map((rec: any) => ({
          id: rec.lessonId,
          solution_id: solutionId,
          lesson_id: rec.lessonId,
          relevance_score: rec.relevanceScore,
          justification: rec.justification,
          key_topics: rec.keyTopics || [],
          created_at: new Date().toISOString(),
          lesson: lessonsMap.get(rec.lessonId)
        })).filter(rec => rec.lesson); // Remover recomendações sem lesson

        console.log(`[RECOMMENDATIONS] ✅ ${enrichedRecommendations.length} recomendações enriquecidas com dados das lessons`);
        
        return enrichedRecommendations as LearningRecommendation[];
      } catch (err: any) {
        if (err.message?.includes('Timeout')) {
          console.error('[RECOMMENDATIONS] ⏰', err.message);
          throw new Error('Tempo esgotado ao gerar recomendações. Tente novamente.');
        }
        
        throw err;
      }
    },
    enabled: !!solutionId,
    staleTime: 1000 * 60 * 60 * 24, // Cache por 24h
    retry: 1,
    retryDelay: 2000
  });
};
