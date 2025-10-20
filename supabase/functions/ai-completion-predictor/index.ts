import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseServiceClient } from "../_shared/supabase-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 [AI-COMPLETION-PREDICTOR] Predizendo conclusões iminentes');
    
    const supabase = getSupabaseServiceClient();

    // Buscar soluções e cursos em progresso
    const [solutions, courses] = await Promise.all([
      supabase
        .from('user_solutions')
        .select('*, user:profiles(id, email), solution:solutions(title)')
        .eq('status', 'in_progress'),
      supabase
        .from('learning_progress')
        .select('*, user:user_id, lesson:learning_lessons(title, module:learning_modules(title))')
        .eq('status', 'in_progress')
    ]);

    let predictionsFound = 0;
    let motivationsSent = 0;

    // Analisar soluções
    for (const userSolution of solutions.data || []) {
      try {
        const completion = await predictCompletionProbability(supabase, userSolution, 'solution');

        if (completion.probability >= 85 && completion.probability <= 95) {
          predictionsFound++;

          // Criar recomendação de boost
          const { data: savedRec, error: recError } = await supabase
            .from('ai_recommendations')
            .insert({
              user_id: userSolution.user_id,
              recommendation_type: 'completion_boost',
              target_id: userSolution.solution_id,
              ai_score: completion.probability,
              justification: completion.motivationMessage,
              context_data: { 
                type: 'solution',
                blockers: completion.blockers,
                nextSteps: completion.nextSteps
              }
            })
            .select()
            .single();

          if (!recError && savedRec) {
            // Enviar notificação motivacional
            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: userSolution.user_id,
                type: 'completion_motivation',
                title: '🎯 Você está quase lá!',
                message: completion.motivationMessage,
                metadata: {
                  recommendation_id: savedRec.id,
                  solution_id: userSolution.solution_id,
                  completion_probability: completion.probability
                },
                priority: 'high'
              });

            if (!notifError) {
              motivationsSent++;
              
              await supabase
                .from('ai_recommendations')
                .update({ 
                  notification_sent: true, 
                  notification_sent_at: new Date().toISOString() 
                })
                .eq('id', savedRec.id);
            }
          }
        }

      } catch (error) {
        console.error(`❌ Erro ao processar solução ${userSolution.id}:`, error);
        continue;
      }
    }

    // Analisar cursos/aulas
    for (const progress of courses.data || []) {
      try {
        const completion = await predictCompletionProbability(supabase, progress, 'course');

        if (completion.probability >= 85 && completion.probability <= 95) {
          predictionsFound++;

          const { data: savedRec } = await supabase
            .from('ai_recommendations')
            .insert({
              user_id: progress.user_id,
              recommendation_type: 'completion_boost',
              target_id: progress.lesson_id,
              ai_score: completion.probability,
              justification: completion.motivationMessage,
              context_data: { 
                type: 'lesson',
                nextSteps: completion.nextSteps
              }
            })
            .select()
            .single();

          if (savedRec) {
            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: progress.user_id,
                type: 'completion_motivation',
                title: '📚 Finalize essa aula agora!',
                message: completion.motivationMessage,
                metadata: {
                  recommendation_id: savedRec.id,
                  lesson_id: progress.lesson_id,
                  completion_probability: completion.probability
                },
                priority: 'medium'
              });

            if (!notifError) motivationsSent++;
          }
        }

      } catch (error) {
        console.error(`❌ Erro ao processar progresso ${progress.id}:`, error);
        continue;
      }
    }

    console.log(`✅ ${predictionsFound} predições encontradas, ${motivationsSent} motivações enviadas`);

    return new Response(
      JSON.stringify({
        success: true,
        predictions_found: predictionsFound,
        motivations_sent: motivationsSent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('❌ [AI-COMPLETION-PREDICTOR ERROR]', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function predictCompletionProbability(supabase: any, item: any, type: 'solution' | 'course'): Promise<any> {
  const now = new Date();
  const createdAt = new Date(item.created_at);
  const updatedAt = new Date(item.updated_at);
  
  const daysSinceStart = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const daysSinceLastUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

  // Buscar histórico de atividades do usuário
  const { data: userHistory } = await supabase
    .from(type === 'solution' ? 'user_solutions' : 'learning_progress')
    .select('*')
    .eq('user_id', item.user_id)
    .eq('status', 'completed');

  const completionRate = userHistory?.length || 0;
  const avgCompletionTime = calculateAvgCompletionTime(userHistory || []);

  // Calcular probabilidade baseada em múltiplos fatores
  let probability = 50; // Base

  // Fator tempo
  if (daysSinceStart >= avgCompletionTime * 0.8) probability += 20;
  if (daysSinceLastUpdate <= 2) probability += 15; // Ativo recentemente
  
  // Fator histórico
  if (completionRate > 5) probability += 15;
  if (completionRate > 10) probability += 10;

  // Fator progresso (assumindo campos específicos)
  if (item.progress_percentage >= 80) probability += 20;
  else if (item.progress_percentage >= 60) probability += 10;

  probability = Math.min(100, probability);

  // Identificar possíveis bloqueios
  const blockers = [];
  if (daysSinceLastUpdate > 5) blockers.push('Inatividade recente');
  if (daysSinceStart > avgCompletionTime * 1.5) blockers.push('Tempo além da média');

  return {
    probability,
    blockers,
    nextSteps: generateNextSteps(type, probability),
    motivationMessage: generateMotivationMessage(type, probability, item)
  };
}

function calculateAvgCompletionTime(history: any[]): number {
  if (history.length === 0) return 14; // Default: 2 semanas

  const times = history.map(h => {
    const created = new Date(h.created_at);
    const completed = new Date(h.completed_at || h.updated_at);
    return Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  });

  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

function generateNextSteps(type: string, probability: number): string[] {
  if (probability >= 90) {
    return [
      'Reserve 15 minutos agora para finalizar',
      'Revise os últimos passos',
      'Comemore a conquista!'
    ];
  }

  return [
    'Identifique o que falta',
    'Dedique 30 minutos hoje',
    'Peça ajuda se precisar'
  ];
}

function generateMotivationMessage(type: string, probability: number, item: any): string {
  const title = item.solution?.title || item.lesson?.title || 'este conteúdo';

  if (probability >= 90) {
    return `Você está a um passo de completar "${title}"! Apenas mais um empurrãozinho e você conquista mais essa vitória! 🎉`;
  }

  if (probability >= 85) {
    return `"${title}" está quase completo (${Math.round(probability)}%)! Que tal dedicar 15 minutos agora para finalizar? Você consegue! 💪`;
  }

  return `Falta pouco para você concluir "${title}"! Continue firme! 🚀`;
}
