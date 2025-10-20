import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseServiceClient } from "../_shared/supabase-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔮 [AI-CHURN-PREDICTION] Analisando risco de churn');
    
    const supabase = getSupabaseServiceClient();

    // Buscar todos os usuários ativos
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, created_at, last_seen_at')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    console.log(`📊 Analisando ${users?.length || 0} usuários`);

    let highRiskUsers = 0;
    let actionsTaken = 0;

    for (const user of users || []) {
      try {
        // Calcular indicadores de risco
        const riskData = await calculateChurnRisk(supabase, user);

        // Salvar score de risco
        const { data: savedRisk, error: riskError } = await supabase
          .from('churn_risk_scores')
          .upsert({
            user_id: user.id,
            risk_score: riskData.score,
            risk_level: riskData.level,
            indicators: riskData.indicators,
            retention_strategy: riskData.strategy,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,created_at',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (!riskError && savedRisk) {
          // Se risco alto/crítico, enviar notificação de retenção
          if (riskData.level === 'high' || riskData.level === 'critical') {
            highRiskUsers++;

            const message = selectRetentionMessage(riskData);

            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'churn_prevention',
                title: message.title,
                message: message.body,
                metadata: {
                  risk_level: riskData.level,
                  risk_score: riskData.score,
                  strategy: riskData.strategy
                },
                priority: 'high'
              });

            if (!notifError) {
              actionsTaken++;
              
              // Marcar ação tomada
              await supabase
                .from('churn_risk_scores')
                .update({ 
                  action_taken: true, 
                  action_taken_at: new Date().toISOString() 
                })
                .eq('id', savedRisk.id);
            }
          }
        }

      } catch (userError) {
        console.error(`❌ Erro ao processar usuário ${user.id}:`, userError);
        continue;
      }
    }

    console.log(`✅ Análise concluída: ${highRiskUsers} usuários em risco, ${actionsTaken} ações de retenção`);

    return new Response(
      JSON.stringify({
        success: true,
        users_analyzed: users?.length || 0,
        high_risk_users: highRiskUsers,
        actions_taken: actionsTaken
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('❌ [AI-CHURN-PREDICTION ERROR]', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function calculateChurnRisk(supabase: any, user: any): Promise<any> {
  const now = new Date();
  const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : new Date(user.created_at);
  const daysSinceLastSeen = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));

  // Buscar dados de atividade
  const [solutions, progress, analytics] = await Promise.all([
    supabase.from('user_solutions').select('*').eq('user_id', user.id),
    supabase.from('learning_progress').select('*').eq('user_id', user.id),
    supabase.from('analytics_events').select('*').eq('user_id', user.id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  ]);

  const indicators = {
    daysSinceLastLogin: daysSinceLastSeen,
    solutionsStartedNotCompleted: solutions.data?.filter((s: any) => s.status === 'in_progress').length || 0,
    coursesStartedNotCompleted: progress.data?.filter((p: any) => p.status === 'in_progress').length || 0,
    last30DaysActivity: analytics.data?.length || 0,
    completionRate: calculateCompletionRate(solutions.data || [])
  };

  // Calcular score de risco (0-100)
  let riskScore = 0;

  if (indicators.daysSinceLastLogin > 14) riskScore += 40;
  else if (indicators.daysSinceLastLogin > 7) riskScore += 20;

  if (indicators.solutionsStartedNotCompleted > 3) riskScore += 25;
  if (indicators.coursesStartedNotCompleted > 2) riskScore += 15;
  if (indicators.last30DaysActivity < 5) riskScore += 20;
  if (indicators.completionRate < 30) riskScore += 15;

  // Determinar nível de risco
  let level = 'low';
  let strategy = 'monitor';

  if (riskScore >= 70) {
    level = 'critical';
    strategy = 'urgent_reengagement';
  } else if (riskScore >= 50) {
    level = 'high';
    strategy = 'proactive_outreach';
  } else if (riskScore >= 30) {
    level = 'medium';
    strategy = 'gentle_nudge';
  }

  return {
    score: riskScore,
    level,
    indicators,
    strategy
  };
}

function calculateCompletionRate(solutions: any[]): number {
  if (solutions.length === 0) return 0;
  const completed = solutions.filter(s => s.status === 'completed').length;
  return Math.round((completed / solutions.length) * 100);
}

function selectRetentionMessage(riskData: any): { title: string; body: string } {
  if (riskData.indicators.daysSinceLastLogin > 14) {
    return {
      title: '😢 Sentimos sua falta!',
      body: `Faz ${riskData.indicators.daysSinceLastLogin} dias que você não aparece. Que tal voltar e ver as novidades? Temos conteúdos esperando por você!`
    };
  }

  if (riskData.indicators.solutionsStartedNotCompleted > 3) {
    return {
      title: '💪 Vamos completar juntos?',
      body: `Você tem ${riskData.indicators.solutionsStartedNotCompleted} soluções iniciadas. Que tal escolher uma e finalizar hoje? Estamos aqui para ajudar!`
    };
  }

  if (riskData.indicators.completionRate < 30) {
    return {
      title: '🎯 Foco e Resultado',
      body: 'Percebemos que você tem iniciado muitas ações. Que tal focar em uma solução de cada vez? Isso aumenta suas chances de sucesso!'
    };
  }

  return {
    title: '🚀 Não desista agora!',
    body: 'Você está no caminho certo! Volte e continue sua jornada de crescimento. Cada pequeno passo conta!'
  };
}
