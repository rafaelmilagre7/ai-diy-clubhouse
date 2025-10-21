import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseServiceClient } from "../_shared/supabase-client.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface UserContext {
  userId: string;
  profile: any;
  onboarding: any;
  completedSolutions: number;
  inProgressSolutions: number;
  interests: string[];
  recentActivity: any[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 [AI-RECOMMENDATIONS] Iniciando geração de recomendações inteligentes');
    
    const supabase = getSupabaseServiceClient();

    // Buscar usuários elegíveis (sem soluções em progresso há 3+ dias)
    const { data: eligibleUsers, error: usersError } = await supabase.rpc('get_eligible_users_for_recommendations');
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários elegíveis:', usersError);
      throw usersError;
    }

    console.log(`📊 Encontrados ${eligibleUsers?.length || 0} usuários elegíveis`);

    let recommendationsCreated = 0;
    let notificationsSent = 0;

    // Processar cada usuário
    for (const user of eligibleUsers || []) {
      try {
        // Coletar contexto completo do usuário
        const context = await collectUserContext(supabase, user.id);
        
        // Gerar recomendações com IA
        const recommendations = await generateRecommendations(context);
        
        // Salvar recomendações no banco
        for (const rec of recommendations) {
          const { data: savedRec, error: recError } = await supabase
            .from('ai_recommendations')
            .insert({
              user_id: user.id,
              recommendation_type: 'solution',
              target_id: rec.solutionId,
              ai_score: rec.score,
              justification: rec.justification,
              context_data: rec.contextData
            })
            .select()
            .single();

          if (!recError && savedRec) {
            recommendationsCreated++;
            
            // Criar notificação
            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'ai_recommendation',
                title: '🤖 Recomendação Inteligente para Você',
                message: `A IA identificou que "${rec.solutionTitle}" pode ser perfeita para seu momento: ${rec.justification}`,
                metadata: {
                  recommendation_id: savedRec.id,
                  solution_id: rec.solutionId,
                  ai_score: rec.score
                },
                priority: rec.score > 80 ? 'high' : 'medium'
              });

            if (!notifError) {
              notificationsSent++;
              
              // Marcar notificação como enviada
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
      } catch (userError) {
        console.error(`❌ Erro ao processar usuário ${user.id}:`, userError);
        continue;
      }
    }

    console.log(`✅ Processo concluído: ${recommendationsCreated} recomendações criadas, ${notificationsSent} notificações enviadas`);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations_created: recommendationsCreated,
        notifications_sent: notificationsSent,
        users_processed: eligibleUsers?.length || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('❌ [AI-RECOMMENDATIONS ERROR]', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function collectUserContext(supabase: any, userId: string): Promise<UserContext> {
  const [profile, onboarding, solutions, progress] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('onboarding_responses').select('*').eq('user_id', userId).single(),
    supabase.from('user_solutions').select('*, solutions(*)').eq('user_id', userId),
    supabase.from('learning_progress').select('*').eq('user_id', userId).limit(10)
  ]);

  return {
    userId,
    profile: profile.data,
    onboarding: onboarding.data,
    completedSolutions: solutions.data?.filter((s: any) => s.status === 'completed').length || 0,
    inProgressSolutions: solutions.data?.filter((s: any) => s.status === 'in_progress').length || 0,
    interests: onboarding.data?.interests || [],
    recentActivity: progress.data || []
  };
}

async function generateRecommendations(context: UserContext): Promise<any[]> {
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY não configurada");
  }

  const systemPrompt = `Você é um especialista em recomendar soluções de negócios B2B.
Analise o contexto do usuário e recomende as 3 melhores soluções para ele neste momento.

Considere:
- Desafios mencionados no onboarding
- Histórico de soluções (${context.completedSolutions} completadas, ${context.inProgressSolutions} em progresso)
- Interesses: ${context.interests.join(', ')}
- Momento do negócio

Retorne APENAS um JSON válido com esta estrutura:
{
  "recommendations": [
    {
      "solutionId": "uuid",
      "score": 85,
      "justification": "Explicação personalizada de 1 linha",
      "contextData": {}
    }
  ]
}`;

  const userPrompt = `Contexto do usuário:
Perfil: ${JSON.stringify(context.profile)}
Onboarding: ${JSON.stringify(context.onboarding)}
Atividade recente: ${context.recentActivity.length} ações

Gere 3 recomendações personalizadas.`;

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

  if (!aiResponse.ok) {
    throw new Error(`Erro na IA: ${aiResponse.status}`);
  }

  const aiData = await aiResponse.json();
  const aiContent = aiData.choices?.[0]?.message?.content;

  if (!aiContent) {
    throw new Error("Resposta da IA vazia");
  }

  const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleanContent);

  return parsed.recommendations || [];
}
