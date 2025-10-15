import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentUserId, targetUserId } = await req.json();

    if (!currentUserId || !targetUserId) {
      return new Response(
        JSON.stringify({ error: 'currentUserId e targetUserId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar perfis completos de ambos os usuários COM DADOS DE ONBOARDING
    const { data: profiles, error: profilesError } = await supabase
      .from('networking_profiles_v2')
      .select(`
        user_id,
        name,
        email,
        company_name,
        current_position,
        industry,
        company_size,
        annual_revenue,
        value_proposition,
        looking_for,
        main_challenge,
        keywords,
        skills,
        professional_bio,
        avatar_url,
        linkedin_url,
        whatsapp_number,
        onboarding_final!inner (
          personal_info,
          business_info,
          business_context,
          goals_info,
          ai_experience,
          personalization,
          professional_info,
          business_goals
        )
      `)
      .in('user_id', [currentUserId, targetUserId]);

    if (profilesError || !profiles || profiles.length !== 2) {
      console.error('Erro ao buscar perfis:', profilesError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar perfis dos usuários' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentUser = profiles.find(p => p.user_id === currentUserId);
    const targetUser = profiles.find(p => p.user_id === targetUserId);

    // ==========================================
    // EXTRAIR DADOS ENRIQUECIDOS DO ONBOARDING
    // ==========================================

    // Dados básicos do perfil - Usuário 1
    const u1Industry = currentUser?.industry || 'Setor não informado';
    const u1CompanySize = currentUser?.company_size || '';
    const u1ValueProp = currentUser?.value_proposition || currentUser?.current_position || 'Profissional';
    const u1LookingFor = Array.isArray(currentUser?.looking_for) 
      ? currentUser.looking_for.join(', ') 
      : currentUser?.looking_for || 'Oportunidades de negócio';
    const u1Challenge = currentUser?.main_challenge || 'Crescimento empresarial';
    const u1Keywords = Array.isArray(currentUser?.keywords)
      ? currentUser.keywords.join(', ')
      : currentUser?.keywords || '';
    const u1Skills = Array.isArray(currentUser?.skills)
      ? currentUser.skills.join(', ')
      : currentUser?.skills || '';

    // Dados do ONBOARDING - Usuário 1
    const u1Onboarding = currentUser?.onboarding_final?.[0] || currentUser?.onboarding_final;
    const u1BusinessInfo = u1Onboarding?.business_info || {};
    const u1BusinessContext = u1Onboarding?.business_context || {};
    const u1AiExp = u1Onboarding?.ai_experience || {};
    const u1Goals = u1Onboarding?.goals_info || {};
    const u1ProfessionalInfo = u1Onboarding?.professional_info || {};
    const u1BusinessGoals = u1Onboarding?.business_goals || {};

    // Extrair campos específicos do onboarding - Usuário 1
    const u1CompanySector = u1BusinessInfo.business_sector || u1BusinessContext?.industry || u1Industry;
    const u1Position = u1ProfessionalInfo.position || u1BusinessInfo.position || currentUser?.current_position;
    const u1Revenue = u1BusinessInfo.annual_revenue || u1BusinessContext?.annual_revenue || currentUser?.annual_revenue;
    
    // Experiência com IA
    const u1AiLevel = u1AiExp.ai_knowledge_level || u1AiExp.experience_level || 'básico';
    const u1HasAi = u1AiExp.has_implemented_ai || false;
    const u1AiTools = u1AiExp.ai_tools_used || u1AiExp.tools_used || [];
    const u1AiObjective = u1AiExp.ai_implementation_objective || u1AiExp.main_objective || '';
    const u1AiChallenge = u1AiExp.ai_main_challenge || u1AiExp.main_challenge || u1Challenge;
    const u1AiUrgency = u1AiExp.ai_implementation_urgency || u1AiExp.urgency_level || 'média';
    
    // Objetivos e metas
    const u1MainGoal = u1Goals.main_objective || u1BusinessGoals.primary_goal || '';
    const u1ImpactArea = u1Goals.area_to_impact || u1BusinessGoals.priority_areas?.[0] || '';
    const u1ExpectedResult = u1Goals.expected_result_90_days || u1BusinessGoals.expected_outcomes?.[0] || '';
    const u1UrgencyLevel = u1Goals.urgency_level || u1BusinessGoals.timeline || 'média';
    const u1SuccessMetric = u1Goals.success_metric || u1BusinessGoals.success_metrics?.[0] || '';
    const u1MainObstacle = u1Goals.main_obstacle || u1BusinessGoals.main_challenge || u1Challenge;
    const u1Budget = u1Goals.ai_implementation_budget || u1BusinessContext?.investment_capacity || '';

    // Dados básicos do perfil - Usuário 2
    const u2Industry = targetUser?.industry || 'Setor não informado';
    const u2CompanySize = targetUser?.company_size || '';
    const u2ValueProp = targetUser?.value_proposition || targetUser?.current_position || 'Profissional';
    const u2LookingFor = Array.isArray(targetUser?.looking_for)
      ? targetUser.looking_for.join(', ')
      : targetUser?.looking_for || 'Oportunidades de negócio';
    const u2Challenge = targetUser?.main_challenge || 'Crescimento empresarial';
    const u2Keywords = Array.isArray(targetUser?.keywords)
      ? targetUser.keywords.join(', ')
      : targetUser?.keywords || '';
    const u2Skills = Array.isArray(targetUser?.skills)
      ? targetUser.skills.join(', ')
      : targetUser?.skills || '';

    // Dados do ONBOARDING - Usuário 2
    const u2Onboarding = targetUser?.onboarding_final?.[0] || targetUser?.onboarding_final;
    const u2BusinessInfo = u2Onboarding?.business_info || {};
    const u2BusinessContext = u2Onboarding?.business_context || {};
    const u2AiExp = u2Onboarding?.ai_experience || {};
    const u2Goals = u2Onboarding?.goals_info || {};
    const u2ProfessionalInfo = u2Onboarding?.professional_info || {};
    const u2BusinessGoals = u2Onboarding?.business_goals || {};

    // Extrair campos específicos do onboarding - Usuário 2
    const u2CompanySector = u2BusinessInfo.business_sector || u2BusinessContext?.industry || u2Industry;
    const u2Position = u2ProfessionalInfo.position || u2BusinessInfo.position || targetUser?.current_position;
    const u2Revenue = u2BusinessInfo.annual_revenue || u2BusinessContext?.annual_revenue || targetUser?.annual_revenue;
    
    // Experiência com IA
    const u2AiLevel = u2AiExp.ai_knowledge_level || u2AiExp.experience_level || 'básico';
    const u2HasAi = u2AiExp.has_implemented_ai || false;
    const u2AiTools = u2AiExp.ai_tools_used || u2AiExp.tools_used || [];
    const u2AiObjective = u2AiExp.ai_implementation_objective || u2AiExp.main_objective || '';
    const u2AiChallenge = u2AiExp.ai_main_challenge || u2AiExp.main_challenge || u2Challenge;
    const u2AiUrgency = u2AiExp.ai_implementation_urgency || u2AiExp.urgency_level || 'média';
    
    // Objetivos e metas
    const u2MainGoal = u2Goals.main_objective || u2BusinessGoals.primary_goal || '';
    const u2ImpactArea = u2Goals.area_to_impact || u2BusinessGoals.priority_areas?.[0] || '';
    const u2ExpectedResult = u2Goals.expected_result_90_days || u2BusinessGoals.expected_outcomes?.[0] || '';
    const u2UrgencyLevel = u2Goals.urgency_level || u2BusinessGoals.timeline || 'média';
    const u2SuccessMetric = u2Goals.success_metric || u2BusinessGoals.success_metrics?.[0] || '';
    const u2MainObstacle = u2Goals.main_obstacle || u2BusinessGoals.main_challenge || u2Challenge;
    const u2Budget = u2Goals.ai_implementation_budget || u2BusinessContext?.investment_capacity || '';

    console.log('📊 Dados ENRIQUECIDOS com ONBOARDING enviados para IA:', {
      user1: {
        name: currentUser?.name,
        company: currentUser?.company_name,
        industry: u1CompanySector,
        position: u1Position,
        revenue: u1Revenue,
        aiLevel: u1AiLevel,
        hasAi: u1HasAi,
        aiObjective: u1AiObjective,
        aiChallenge: u1AiChallenge,
        mainGoal: u1MainGoal,
        impactArea: u1ImpactArea,
        expectedResult: u1ExpectedResult,
        successMetric: u1SuccessMetric,
        mainObstacle: u1MainObstacle,
        skills: u1Skills,
      },
      user2: {
        name: targetUser?.name,
        company: targetUser?.company_name,
        industry: u2CompanySector,
        position: u2Position,
        revenue: u2Revenue,
        aiLevel: u2AiLevel,
        hasAi: u2HasAi,
        aiObjective: u2AiObjective,
        aiChallenge: u2AiChallenge,
        mainGoal: u2MainGoal,
        impactArea: u2ImpactArea,
        expectedResult: u2ExpectedResult,
        successMetric: u2SuccessMetric,
        mainObstacle: u2MainObstacle,
        skills: u2Skills,
      }
    });

    // PROMPT ULTRA-PERSONALIZADO COM DADOS DE ONBOARDING
    const prompt = `Você é um consultor de negócios B2B especializado em identificar oportunidades estratégicas entre profissionais.

PERFIL 1 - ${currentUser?.name || 'Usuário 1'}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CONTEXTO EMPRESARIAL:
• Empresa: ${currentUser?.company_name || 'Não informado'} (${u1CompanySize})
• Setor: ${u1CompanySector}
• Cargo: ${u1Position}
• Faturamento: ${u1Revenue}

🎯 OBJETIVOS ESTRATÉGICOS (90 DIAS):
• Objetivo principal: ${u1MainGoal}
• Área de impacto: ${u1ImpactArea}
• Resultado esperado: ${u1ExpectedResult}
• Métrica de sucesso: ${u1SuccessMetric}
• Nível de urgência: ${u1UrgencyLevel}
• Principal obstáculo: ${u1MainObstacle}

🤖 EXPERIÊNCIA COM IA:
• Nível: ${u1AiLevel}
• Já implementou IA? ${u1HasAi ? 'Sim' : 'Não'}
${Array.isArray(u1AiTools) && u1AiTools.length > 0 ? `• Ferramentas usadas: ${u1AiTools.join(', ')}` : ''}
• Objetivo de IA: ${u1AiObjective}
• Desafio com IA: ${u1AiChallenge}
• Urgência de implementação: ${u1AiUrgency}
${u1Budget ? `• Orçamento para IA: ${u1Budget}` : ''}

💼 BUSCA CONECTAR-SE COM:
${u1LookingFor}

🎯 COMPETÊNCIAS:
${u1Skills || 'Não informado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PERFIL 2 - ${targetUser?.name || 'Usuário 2'}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CONTEXTO EMPRESARIAL:
• Empresa: ${targetUser?.company_name || 'Não informado'} (${u2CompanySize})
• Setor: ${u2CompanySector}
• Cargo: ${u2Position}
• Faturamento: ${u2Revenue}

🎯 OBJETIVOS ESTRATÉGICOS (90 DIAS):
• Objetivo principal: ${u2MainGoal}
• Área de impacto: ${u2ImpactArea}
• Resultado esperado: ${u2ExpectedResult}
• Métrica de sucesso: ${u2SuccessMetric}
• Nível de urgência: ${u2UrgencyLevel}
• Principal obstáculo: ${u2MainObstacle}

🤖 EXPERIÊNCIA COM IA:
• Nível: ${u2AiLevel}
• Já implementou IA? ${u2HasAi ? 'Sim' : 'Não'}
${Array.isArray(u2AiTools) && u2AiTools.length > 0 ? `• Ferramentas usadas: ${u2AiTools.join(', ')}` : ''}
• Objetivo de IA: ${u2AiObjective}
• Desafio com IA: ${u2AiChallenge}
• Urgência de implementação: ${u2AiUrgency}
${u2Budget ? `• Orçamento para IA: ${u2Budget}` : ''}

💼 BUSCA CONECTAR-SE COM:
${u2LookingFor}

🎯 COMPETÊNCIAS:
${u2Skills || 'Não informado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 INSTRUÇÕES PARA COPY:

1. **FOCO EM OBJETIVOS ESPECÍFICOS**: Cite explicitamente os OBJETIVOS ESTRATÉGICOS e MÉTRICAS DE SUCESSO de cada perfil

2. **SINERGIA REAL**: Identifique como ${targetUser?.name} pode ajudar ${currentUser?.name} a:
   - Atingir o objetivo: "${u1MainGoal}"
   - Superar o obstáculo: "${u1MainObstacle}"
   - Impactar a área: "${u1ImpactArea}"
   - Alcançar resultado: "${u1ExpectedResult}"

3. **CONTEXTO DE IA**: Se ambos trabalham com IA, cite:
   - Níveis de experiência (${u1AiLevel} vs ${u2AiLevel})
   - Ferramentas específicas
   - Desafios complementares

4. **ESPECIFICIDADE MÁXIMA**: 
   - Use dados REAIS (setor, objetivo, métrica, desafio)
   - Evite frases genéricas como "troca de experiências"
   - Seja ORIENTADO A RESULTADOS

5. **FORMATO**:
   - Máximo 70 palavras (2-3 linhas)
   - Terceira pessoa
   - Use **negrito** em palavras-chave (objetivo, métrica, área de impacto)
   - Tom profissional e consultivo

6. **EXEMPLO DE COPY BOA**:
"**${targetUser?.name}** pode acelerar o objetivo de ${currentUser?.name} de **${u1MainGoal}** através de expertise em **${u2ImpactArea}**. Com nível **${u2AiLevel}** em IA e experiência em ${u2CompanySector}, pode ajudar a superar o desafio de **${u1MainObstacle}** e atingir **${u1ExpectedResult}** em 90 dias."

NÃO USE:
❌ "Grande oportunidade de networking"
❌ "Troca de experiências valiosa"
❌ "Perfis complementares"
❌ Qualquer frase vazia sem dados concretos

USE:
✅ Objetivos específicos (${u1MainGoal}, ${u2MainGoal})
✅ Métricas de sucesso (${u1SuccessMetric}, ${u2SuccessMetric})
✅ Desafios reais (${u1MainObstacle}, ${u2MainObstacle})
✅ Resultados esperados (${u1ExpectedResult}, ${u2ExpectedResult})
✅ Áreas de impacto (${u1ImpactArea}, ${u2ImpactArea})

Gere a copy AGORA:`;

    console.log('🤖 Gerando copy com IA...');

    // Chamar Lovable AI para gerar a copy
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em identificar oportunidades de negócio entre profissionais. Seja direto, específico e use markdown para destacar palavras-chave.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro na API de IA:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar copy com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedCopy = aiData.choices?.[0]?.message?.content || '';

    console.log('✅ Copy gerada com sucesso');

    // Salvar a copy no match existente (tabela strategic_matches_v2 usa matched_user_id, não matched_user_id)
    const { error: updateError } = await supabase
      .from('strategic_matches_v2')
      .update({ connection_copy: generatedCopy })
      .eq('user_id', currentUserId)
      .eq('matched_user_id', targetUserId);

    if (updateError) {
      console.error('Erro ao salvar copy:', updateError);
      // Não bloqueia a resposta, apenas loga o erro
    }

    // Calcular score básico (pode ser melhorado depois)
    const score = 0.75;

    return new Response(
      JSON.stringify({ 
        copy: generatedCopy,
        score: score,
        success: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});