import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseServiceClient } from "../_shared/supabase-client.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📊 [AI-WEEKLY-SUMMARY] Gerando resumos semanais inteligentes');
    
    const supabase = getSupabaseServiceClient();

    // Definir período da semana (domingo a sábado)
    const today = new Date();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());
    lastSunday.setHours(0, 0, 0, 0);

    const lastSaturday = new Date(lastSunday);
    lastSaturday.setDate(lastSunday.getDate() + 6);
    lastSaturday.setHours(23, 59, 59, 999);

    // Buscar usuários com atividade na semana
    const { data: activeUsers, error: usersError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('created_at', lastSunday.toISOString())
      .lte('created_at', lastSaturday.toISOString());

    if (usersError) throw usersError;

    const uniqueUsers = [...new Set(activeUsers?.map(u => u.user_id) || [])];
    console.log(`📊 ${uniqueUsers.length} usuários ativos na semana`);

    let summariesCreated = 0;
    let notificationsSent = 0;

    for (const userId of uniqueUsers) {
      try {
        // Coletar métricas da semana
        const weeklyData = await collectWeeklyMetrics(supabase, userId, lastSunday, lastSaturday);

        // Gerar insights com IA
        const aiInsights = await generateAIInsights(weeklyData);

        // Salvar resumo
        const { data: savedSummary, error: summaryError } = await supabase
          .from('weekly_summaries')
          .upsert({
            user_id: userId,
            week_start: lastSunday.toISOString().split('T')[0],
            week_end: lastSaturday.toISOString().split('T')[0],
            summary_data: weeklyData,
            ai_insights: aiInsights.text,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,week_start',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (!summaryError && savedSummary) {
          summariesCreated++;

          // Enviar notificação
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'weekly_summary',
              title: '📊 Seu Resumo Semanal Chegou!',
              message: `Esta semana: ${weeklyData.solutions_worked} soluções, ${weeklyData.lessons_completed} aulas completadas. ${aiInsights.highlight}`,
              metadata: {
                summary_id: savedSummary.id,
                week_start: lastSunday.toISOString(),
                key_metrics: {
                  solutions: weeklyData.solutions_worked,
                  lessons: weeklyData.lessons_completed,
                  time_spent: weeklyData.total_time_minutes
                }
              },
              priority: 'medium'
            });

          if (!notifError) {
            notificationsSent++;
            
            await supabase
              .from('weekly_summaries')
              .update({ 
                notification_sent: true, 
                notification_sent_at: new Date().toISOString() 
              })
              .eq('id', savedSummary.id);
          }
        }

      } catch (userError) {
        console.error(`❌ Erro ao processar usuário ${userId}:`, userError);
        continue;
      }
    }

    console.log(`✅ ${summariesCreated} resumos criados, ${notificationsSent} notificações enviadas`);

    return new Response(
      JSON.stringify({
        success: true,
        summaries_created: summariesCreated,
        notifications_sent: notificationsSent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('❌ [AI-WEEKLY-SUMMARY ERROR]', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function collectWeeklyMetrics(supabase: any, userId: string, weekStart: Date, weekEnd: Date): Promise<any> {
  const [solutions, lessons, analytics, profile] = await Promise.all([
    supabase
      .from('user_solutions')
      .select('*')
      .eq('user_id', userId)
      .gte('updated_at', weekStart.toISOString())
      .lte('updated_at', weekEnd.toISOString()),
    supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('updated_at', weekStart.toISOString())
      .lte('updated_at', weekEnd.toISOString()),
    supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString()),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
  ]);

  return {
    solutions_worked: solutions.data?.length || 0,
    solutions_completed: solutions.data?.filter((s: any) => s.status === 'completed').length || 0,
    lessons_completed: lessons.data?.filter((l: any) => l.status === 'completed').length || 0,
    lessons_started: lessons.data?.length || 0,
    total_actions: analytics.data?.length || 0,
    active_days: calculateActiveDays(analytics.data || []),
    total_time_minutes: estimateTimeSpent(analytics.data || []),
    profile_name: profile.data?.full_name || 'Membro'
  };
}

function calculateActiveDays(events: any[]): number {
  const uniqueDays = new Set(
    events.map(e => new Date(e.created_at).toISOString().split('T')[0])
  );
  return uniqueDays.size;
}

function estimateTimeSpent(events: any[]): number {
  // Estimativa: 5 minutos por ação
  return events.length * 5;
}

async function generateAIInsights(weeklyData: any): Promise<{ text: string; highlight: string }> {
  if (!LOVABLE_API_KEY) {
    return {
      text: 'Resumo não disponível',
      highlight: 'Continue sua jornada!'
    };
  }

  const systemPrompt = `Você é um assistente especializado em gerar insights motivacionais sobre produtividade.
Analise as métricas semanais do usuário e forneça:
1. Um resumo motivacional (2-3 linhas)
2. Uma frase de destaque (1 linha)
3. Próximos passos recomendados

Seja positivo, conciso e acionável.

Retorne APENAS JSON:
{
  "text": "Resumo completo motivacional",
  "highlight": "Frase de destaque curta",
  "nextSteps": ["Passo 1", "Passo 2"]
}`;

  const userPrompt = `Métricas da semana de ${weeklyData.profile_name}:
- ${weeklyData.solutions_worked} soluções trabalhadas (${weeklyData.solutions_completed} completadas)
- ${weeklyData.lessons_completed} aulas completadas de ${weeklyData.lessons_started} iniciadas
- ${weeklyData.active_days} dias ativos
- ${weeklyData.total_time_minutes} minutos estimados de estudo
- ${weeklyData.total_actions} ações totais

Gere insights motivacionais.`;

  try {
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
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) throw new Error('AI request failed');

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanContent);

  } catch (error) {
    console.error('Erro ao gerar insights com IA:', error);
    return {
      text: `Semana produtiva! Você trabalhou em ${weeklyData.solutions_worked} soluções e completou ${weeklyData.lessons_completed} aulas.`,
      highlight: 'Continue assim! 🚀'
    };
  }
}
