import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseServiceClient } from "../_shared/supabase-client.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📚 [AI-LEARNING-PATH] Gerando trilhas de aprendizado inteligentes');
    
    const supabase = getSupabaseServiceClient();

    // Buscar usuários com atividade recente (últimos 7 dias)
    const { data: activeUsers, error: usersError } = await supabase
      .from('learning_progress')
      .select('user_id')
      .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('updated_at', { ascending: false });

    if (usersError) throw usersError;

    const uniqueUsers = [...new Set(activeUsers?.map(u => u.user_id) || [])];
    console.log(`📊 ${uniqueUsers.length} usuários ativos encontrados`);

    let pathsCreated = 0;
    let notificationsSent = 0;

    for (const userId of uniqueUsers) {
      try {
        // Coletar dados do usuário
        const [progress, profile, onboarding] = await Promise.all([
          supabase.from('learning_progress').select('*, lesson:learning_lessons(*, module:learning_modules(*))').eq('user_id', userId),
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('onboarding_responses').select('*').eq('user_id', userId).single()
        ]);

        // Gerar trilha com IA
        const learningPath = await generateLearningPath(
          progress.data || [],
          profile.data,
          onboarding.data
        );

        // Salvar recomendações de aulas
        for (const lesson of learningPath.lessons) {
          const { data: savedRec, error: recError } = await supabase
            .from('ai_recommendations')
            .insert({
              user_id: userId,
              recommendation_type: 'learning_path',
              target_id: lesson.lessonId,
              ai_score: lesson.priority,
              justification: lesson.justification,
              context_data: { 
                moduleId: lesson.moduleId, 
                courseId: lesson.courseId,
                sequence: lesson.sequence 
              }
            })
            .select()
            .single();

          if (!recError && savedRec) {
            pathsCreated++;
          }
        }

        // Criar notificação única para a trilha
        if (learningPath.lessons.length > 0) {
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'ai_learning_path',
              title: '📚 Sua Trilha de Aprendizado Personalizada',
              message: `A IA criou uma sequência otimizada de ${learningPath.lessons.length} aulas para você: ${learningPath.rationale}`,
              metadata: {
                lessons_count: learningPath.lessons.length,
                estimated_time: learningPath.estimatedTime
              },
              priority: 'medium'
            });

          if (!notifError) notificationsSent++;
        }

      } catch (userError) {
        console.error(`❌ Erro ao processar usuário ${userId}:`, userError);
        continue;
      }
    }

    console.log(`✅ ${pathsCreated} aulas recomendadas, ${notificationsSent} trilhas enviadas`);

    return new Response(
      JSON.stringify({
        success: true,
        paths_created: pathsCreated,
        notifications_sent: notificationsSent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('❌ [AI-LEARNING-PATH ERROR]', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateLearningPath(progress: any[], profile: any, onboarding: any): Promise<any> {
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY não configurada");
  }

  const systemPrompt = `Você é um especialista em criar trilhas de aprendizado personalizadas.
Analise o progresso do usuário e crie uma sequência otimizada de próximas aulas.

Retorne APENAS JSON:
{
  "lessons": [
    {
      "lessonId": "uuid",
      "moduleId": "uuid",
      "courseId": "uuid",
      "priority": 90,
      "justification": "Por que essa aula agora",
      "sequence": 1
    }
  ],
  "rationale": "Explicação da trilha em 1 linha",
  "estimatedTime": "2 horas"
}`;

  const userPrompt = `Progresso: ${progress.length} aulas iniciadas
Perfil: ${JSON.stringify(profile)}
Interesses: ${onboarding?.interests?.join(', ')}

Crie uma trilha otimizada de 3-5 próximas aulas.`;

  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!aiResponse.ok) throw new Error(`Erro na IA: ${aiResponse.status}`);

  const aiData = await aiResponse.json();
  const aiContent = aiData.choices?.[0]?.message?.content;
  const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(cleanContent);
}
