
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OnboardingData {
  user_id: string;
  company_name?: string;
  company_sector?: string;
  company_size?: string;
  current_position?: string;
  business_goals?: any;
  ai_experience?: any;
  professional_info?: any;
  business_context?: any;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  company_name?: string;
  current_position?: string;
  onboarding_data?: OnboardingData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário tem acesso (Club ou Admin)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, name')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'formacao')) {
      throw new Error('Acesso negado. Apenas membros Club e Admin podem usar o networking.');
    }

    const body = await req.json();
    const { target_user_id, force_regenerate = false } = body;

    // Se target_user_id for fornecido, gerar matches apenas para esse usuário
    // Caso contrário, gerar para todos os usuários elegíveis
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    let userIds: string[] = [];
    
    if (target_user_id) {
      userIds = [target_user_id];
    } else {
      // Buscar todos os usuários elegíveis para networking
      const { data: eligibleUsers } = await supabaseClient
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'formacao']);
      
      userIds = eligibleUsers?.map(u => u.id) || [];
    }

    console.log(`Gerando matches para ${userIds.length} usuários no mês ${currentMonth}`);

    let totalMatches = 0;

    for (const userId of userIds) {
      // Verificar se já tem matches para este mês (a menos que force_regenerate seja true)
      if (!force_regenerate) {
        const { data: existingMatches } = await supabaseClient
          .from('network_matches')
          .select('id')
          .eq('user_id', userId)
          .eq('month_year', currentMonth)
          .limit(1);

        if (existingMatches && existingMatches.length > 0) {
          console.log(`Usuário ${userId} já tem matches para ${currentMonth}, pulando...`);
          continue;
        }
      }

      // Buscar dados completos do usuário atual
      const { data: currentUser } = await supabaseClient
        .from('profiles')
        .select(`
          id, name, email, company_name, current_position,
          onboarding_progress!inner(
            company_name, company_sector, company_size, current_position,
            business_goals, ai_experience, professional_info, business_context
          )
        `)
        .eq('id', userId)
        .single();

      if (!currentUser) {
        console.log(`Dados do usuário ${userId} não encontrados, pulando...`);
        continue;
      }

      // Buscar outros usuários para matching (excluindo o próprio usuário)
      const { data: potentialMatches } = await supabaseClient
        .from('profiles')
        .select(`
          id, name, email, company_name, current_position,
          onboarding_progress!inner(
            company_name, company_sector, company_size, current_position,
            business_goals, ai_experience, professional_info, business_context
          )
        `)
        .neq('id', userId)
        .in('role', ['admin', 'formacao']);

      if (!potentialMatches || potentialMatches.length === 0) {
        console.log(`Nenhum potencial match encontrado para usuário ${userId}`);
        continue;
      }

      // Usar Claude Sonnet 4 para analisar e gerar matches
      const matches = await generateMatchesWithClaude(currentUser, potentialMatches);

      // Salvar matches no banco
      for (const match of matches) {
        try {
          await supabaseClient
            .from('network_matches')
            .insert({
              user_id: userId,
              matched_user_id: match.user_id,
              match_type: match.type,
              compatibility_score: match.score,
              match_reason: match.reason,
              ai_analysis: match.analysis,
              month_year: currentMonth
            });
          
          totalMatches++;
        } catch (error) {
          console.error(`Erro ao salvar match para usuário ${userId}:`, error);
        }
      }

      // Criar notificação de novos matches
      if (matches.length > 0) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'new_matches',
            title: 'Novos matches disponíveis!',
            message: `Temos ${matches.length} novos matches para você este mês.`,
            data: {
              match_count: matches.length,
              month: currentMonth
            }
          });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total_matches_generated: totalMatches,
      month: currentMonth
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na geração de matches:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

async function generateMatchesWithClaude(currentUser: any, potentialMatches: any[]) {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada');
  }

  const prompt = `
Você é um especialista em networking de negócios da plataforma Viver de IA. Analise o perfil do usuário atual e a lista de potenciais conexões para gerar matches inteligentes.

USUÁRIO ATUAL:
${JSON.stringify(currentUser, null, 2)}

POTENCIAIS CONEXÕES:
${JSON.stringify(potentialMatches, null, 2)}

INSTRUÇÕES:
1. Analise cada potencial conexão e determine se seria um bom match como CLIENTE ou FORNECEDOR
2. Considere fatores como: setor, tamanho da empresa, objetivos de negócio, nível de conhecimento em IA, posição atual
3. Gere até 5 matches (máximo) priorizando os de maior qualidade
4. Para cada match, forneça score de compatibilidade (0-100), razão do match e análise detalhada

RESPONDA APENAS com um JSON válido no formato:
[
  {
    "user_id": "id_do_usuario",
    "type": "customer" | "supplier",
    "score": 85,
    "reason": "Breve explicação do motivo do match",
    "analysis": {
      "strengths": ["força 1", "força 2"],
      "opportunities": ["oportunidade 1", "oportunidade 2"],
      "recommended_approach": "Como abordar esta conexão"
    }
  }
]

IMPORTANTE: Retorne apenas o JSON, sem markdown ou texto adicional.
`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.content[0].text;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta do Claude:', content);
      return [];
    }
  } catch (error) {
    console.error('Erro ao chamar Claude API:', error);
    return [];
  }
}
