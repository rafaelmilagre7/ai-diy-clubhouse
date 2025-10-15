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

    // ✅ VERIFICAR SE JÁ EXISTE COPY CACHEADA NO BANCO
    const { data: existingMatch } = await supabase
      .from('strategic_matches_v2')
      .select('connection_copy')
      .eq('user_id', currentUserId)
      .eq('matched_user_id', targetUserId)
      .maybeSingle();

    if (existingMatch?.connection_copy) {
      console.log('✅ Usando copy cacheada do banco');
      return new Response(
        JSON.stringify({ copy: existingMatch.connection_copy }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // QUERY 1: Buscar dados básicos de profiles
    const { data: basicProfiles, error: basicProfilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        company_name,
        current_position,
        industry,
        company_size,
        annual_revenue,
        avatar_url,
        linkedin_url,
        whatsapp_number
      `)
      .in('id', [currentUserId, targetUserId]);

    if (basicProfilesError || !basicProfiles || basicProfiles.length !== 2) {
      console.error('Erro ao buscar profiles básicos:', basicProfilesError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar perfis dos usuários' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // QUERY 2: Buscar dados de networking_profiles_v2
    const { data: networkingProfiles, error: networkingError } = await supabase
      .from('networking_profiles_v2')
      .select(`
        user_id,
        value_proposition,
        looking_for,
        main_challenge,
        keywords,
        ai_persona
      `)
      .in('user_id', [currentUserId, targetUserId]);

    if (networkingError) {
      console.warn('⚠️ Aviso ao buscar networking profiles (continuando com dados básicos):', networkingError);
    }

    // Merge dos dados: profiles básicos + networking profiles
    const profiles = basicProfiles.map(profile => {
      const networkingData = networkingProfiles?.find(np => np.user_id === profile.id);
      return {
        user_id: profile.id,
        name: profile.name,
        email: profile.email,
        company_name: profile.company_name,
        current_position: profile.current_position,
        industry: profile.industry,
        company_size: profile.company_size,
        annual_revenue: profile.annual_revenue,
        avatar_url: profile.avatar_url,
        linkedin_url: profile.linkedin_url,
        whatsapp_number: profile.whatsapp_number,
        value_proposition: networkingData?.value_proposition || '',
        looking_for: networkingData?.looking_for || [],
        main_challenge: networkingData?.main_challenge || '',
        keywords: networkingData?.keywords || [],
        ai_persona: networkingData?.ai_persona || null
      };
    });

    // QUERY 3: Buscar dados de onboarding separadamente
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_final')
      .select('user_id, personal_info, business_info, business_context, goals_info, ai_experience, personalization, professional_info, business_goals')
      .in('user_id', [currentUserId, targetUserId]);

    if (onboardingError) {
      console.warn('⚠️ Aviso ao buscar onboarding (continuando com dados básicos):', onboardingError);
      // NÃO FALHAR AQUI - onboarding pode estar incompleto
    }

    // MERGE MANUAL: Adicionar dados de onboarding aos perfis
    const onboardingMap = new Map();
    if (onboardingData && onboardingData.length > 0) {
      onboardingData.forEach(ob => {
        onboardingMap.set(ob.user_id, ob);
      });
    }

    profiles.forEach(profile => {
      const onboarding = onboardingMap.get(profile.user_id);
      if (onboarding) {
        profile.onboarding_final = onboarding;
      } else {
        console.warn(`⚠️ Usuário ${profile.name} (${profile.user_id}) sem dados de onboarding - usando fallback`);
        profile.onboarding_final = null;
      }
    });

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

    // Dados do ONBOARDING - Usuário 1 (com fallback robusto)
    const u1Onboarding = currentUser?.onboarding_final;
    const u1HasOnboarding = !!u1Onboarding;
    
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
    
    // Experiência com IA (PRIORIZAR campos corretos + FALLBACKS)
    const u1AiLevel = u1AiExp.experience_level || u1AiExp.ai_knowledge_level || 
                      (u1HasOnboarding ? 'básico' : 'iniciante');
    const u1HasAi = u1AiExp.has_implemented_ai || u1AiExp.implementation_status === 'implementing' || false;
    const u1AiTools = u1AiExp.tools_used || u1AiExp.ai_tools_used || [];
    const u1AiObjective = u1AiExp.main_objective || u1AiExp.ai_implementation_objective || 
                          (u1HasOnboarding ? '' : 'otimização de processos');
    const u1AiChallenge = u1AiExp.main_challenge || u1AiExp.ai_main_challenge || u1Challenge;
    const u1AiUrgency = u1AiExp.urgency_level || u1AiExp.ai_implementation_urgency || 'média';
    
    // Objetivos e metas (PRIORIZAR campos corretos + FALLBACKS do perfil)
    const u1MainGoal = u1Goals.primary_goal || u1BusinessGoals.primary_goal || u1Goals.main_objective || 
                       (u1HasOnboarding ? '' : u1LookingFor);
    const u1PriorityAreas = u1Goals.priority_areas || u1BusinessGoals.priority_areas || 
                            (u1HasOnboarding ? [] : [u1Industry]);
    const u1ImpactArea = Array.isArray(u1PriorityAreas) && u1PriorityAreas.length > 0 
      ? u1PriorityAreas[0] 
      : (u1Goals.area_to_impact || u1Industry);
    const u1SuccessMetrics = u1Goals.success_metrics || u1BusinessGoals.success_metrics || 
                             (u1HasOnboarding ? [] : ['crescimento de rede']);
    const u1SuccessMetric = Array.isArray(u1SuccessMetrics) && u1SuccessMetrics.length > 0
      ? u1SuccessMetrics[0]
      : (u1Goals.success_metric || 'crescimento');
    const u1ExpectedResult = u1Goals.expected_outcomes?.[0] || u1BusinessGoals.expected_outcomes?.[0] || 
                             u1Goals.expected_result_90_days || 
                             (u1HasOnboarding ? '' : 'expandir conexões estratégicas');
    const u1Timeline = u1Goals.timeline || u1BusinessGoals.timeline || u1Goals.urgency_level || 'média';
    const u1MainObstacle = u1Goals.main_challenge || u1BusinessGoals.main_challenge || 
                           u1Goals.main_obstacle || u1Challenge;
    const u1Budget = u1BusinessContext?.investment_capacity || u1Goals.ai_implementation_budget || '';

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

    // Dados do ONBOARDING - Usuário 2 (com fallback robusto)
    const u2Onboarding = targetUser?.onboarding_final;
    const u2HasOnboarding = !!u2Onboarding;
    
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
    
    // Experiência com IA (PRIORIZAR campos corretos + FALLBACKS)
    const u2AiLevel = u2AiExp.experience_level || u2AiExp.ai_knowledge_level || 
                      (u2HasOnboarding ? 'básico' : 'iniciante');
    const u2HasAi = u2AiExp.has_implemented_ai || u2AiExp.implementation_status === 'implementing' || false;
    const u2AiTools = u2AiExp.tools_used || u2AiExp.ai_tools_used || [];
    const u2AiObjective = u2AiExp.main_objective || u2AiExp.ai_implementation_objective || 
                          (u2HasOnboarding ? '' : 'otimização de processos');
    const u2AiChallenge = u2AiExp.main_challenge || u2AiExp.ai_main_challenge || u2Challenge;
    const u2AiUrgency = u2AiExp.urgency_level || u2AiExp.ai_implementation_urgency || 'média';
    
    // Objetivos e metas (PRIORIZAR campos corretos + FALLBACKS do perfil)
    const u2MainGoal = u2Goals.primary_goal || u2BusinessGoals.primary_goal || u2Goals.main_objective || 
                       (u2HasOnboarding ? '' : u2LookingFor);
    const u2PriorityAreas = u2Goals.priority_areas || u2BusinessGoals.priority_areas || 
                            (u2HasOnboarding ? [] : [u2Industry]);
    const u2ImpactArea = Array.isArray(u2PriorityAreas) && u2PriorityAreas.length > 0 
      ? u2PriorityAreas[0] 
      : (u2Goals.area_to_impact || u2Industry);
    const u2SuccessMetrics = u2Goals.success_metrics || u2BusinessGoals.success_metrics || 
                             (u2HasOnboarding ? [] : ['crescimento de rede']);
    const u2SuccessMetric = Array.isArray(u2SuccessMetrics) && u2SuccessMetrics.length > 0
      ? u2SuccessMetrics[0]
      : (u2Goals.success_metric || 'crescimento');
    const u2ExpectedResult = u2Goals.expected_outcomes?.[0] || u2BusinessGoals.expected_outcomes?.[0] || 
                             u2Goals.expected_result_90_days || 
                             (u2HasOnboarding ? '' : 'expandir conexões estratégicas');
    const u2Timeline = u2Goals.timeline || u2BusinessGoals.timeline || u2Goals.urgency_level || 'média';
    const u2MainObstacle = u2Goals.main_challenge || u2BusinessGoals.main_challenge || 
                           u2Goals.main_obstacle || u2Challenge;
    const u2Budget = u2BusinessContext?.investment_capacity || u2Goals.ai_implementation_budget || '';

    console.log('📊 Dados ENRIQUECIDOS enviados para IA:', {
      user1: {
        name: currentUser?.name,
        hasOnboarding: u1HasOnboarding,
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
        hasOnboarding: u2HasOnboarding,
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

    // PROMPT COM FALLBACKS CONDICIONAIS
    const prompt = `Você é um consultor de negócios B2B especializado em identificar oportunidades estratégicas entre profissionais.

PERFIL 1 - ${currentUser?.name || 'Usuário 1'}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CONTEXTO EMPRESARIAL:
• Empresa: ${currentUser?.company_name || 'Não informado'} (${u1CompanySize})
• Setor: ${u1CompanySector}
• Cargo: ${u1Position}
${u1Revenue ? `• Faturamento: ${u1Revenue}` : ''}

${u1HasOnboarding && u1MainGoal ? `🎯 OBJETIVOS ESTRATÉGICOS (próximos 12 meses):
• Objetivo principal: ${u1MainGoal}
${Array.isArray(u1PriorityAreas) && u1PriorityAreas.length > 0 ? `• Áreas prioritárias: ${u1PriorityAreas.join(', ')}` : `• Área de impacto: ${u1ImpactArea}`}
${u1ExpectedResult ? `• Resultado esperado: ${u1ExpectedResult}` : ''}
${Array.isArray(u1SuccessMetrics) && u1SuccessMetrics.length > 0 ? `• Métricas de sucesso: ${u1SuccessMetrics.join(', ')}` : u1SuccessMetric ? `• Métrica de sucesso: ${u1SuccessMetric}` : ''}
• Timeline: ${u1Timeline}
• Principal obstáculo: ${u1MainObstacle}` : `💼 BUSCA CONECTAR-SE COM:
${u1LookingFor}`}

${u1HasOnboarding ? `🤖 CONTEXTO DE IA:
${u1AiLevel === 'advanced' || u1AiLevel === 'avançado' ? '• Domina implementação de IA na empresa' : u1AiLevel === 'intermediate' || u1AiLevel === 'intermediário' ? '• Tem experiência intermediária com IA' : '• Está iniciando jornada com IA'}
${u1HasAi ? '• Já possui soluções de IA implementadas' : '• Busca implementar primeira solução de IA'}
${Array.isArray(u1AiTools) && u1AiTools.length > 0 ? `• Trabalha com: ${u1AiTools.join(', ')}` : ''}
${u1AiObjective ? `• Objetivo de IA: ${u1AiObjective}` : ''}
• Desafio atual: ${u1AiChallenge}
${u1AiUrgency === 'high' || u1AiUrgency === 'alta' ? '• Necessita implementação urgente' : u1AiUrgency === 'medium' || u1AiUrgency === 'média' ? '• Planeja implementar nos próximos meses' : '• Explorando oportunidades de longo prazo'}
${u1Budget ? `• Investimento disponível: ${u1Budget}` : ''}` : ''}

${u1Skills ? `🎯 COMPETÊNCIAS:
${u1Skills}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PERFIL 2 - ${targetUser?.name || 'Usuário 2'}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CONTEXTO EMPRESARIAL:
• Empresa: ${targetUser?.company_name || 'Não informado'} (${u2CompanySize})
• Setor: ${u2CompanySector}
• Cargo: ${u2Position}
${u2Revenue ? `• Faturamento: ${u2Revenue}` : ''}

${u2HasOnboarding && u2MainGoal ? `🎯 OBJETIVOS ESTRATÉGICOS (próximos 12 meses):
• Objetivo principal: ${u2MainGoal}
${Array.isArray(u2PriorityAreas) && u2PriorityAreas.length > 0 ? `• Áreas prioritárias: ${u2PriorityAreas.join(', ')}` : `• Área de impacto: ${u2ImpactArea}`}
${u2ExpectedResult ? `• Resultado esperado: ${u2ExpectedResult}` : ''}
${Array.isArray(u2SuccessMetrics) && u2SuccessMetrics.length > 0 ? `• Métricas de sucesso: ${u2SuccessMetrics.join(', ')}` : u2SuccessMetric ? `• Métrica de sucesso: ${u2SuccessMetric}` : ''}
• Timeline: ${u2Timeline}
• Principal obstáculo: ${u2MainObstacle}` : `💼 BUSCA CONECTAR-SE COM:
${u2LookingFor}`}

${u2HasOnboarding ? `🤖 CONTEXTO DE IA:
${u2AiLevel === 'advanced' || u2AiLevel === 'avançado' ? '• Domina implementação de IA na empresa' : u2AiLevel === 'intermediate' || u2AiLevel === 'intermediário' ? '• Tem experiência intermediária com IA' : '• Está iniciando jornada com IA'}
${u2HasAi ? '• Já possui soluções de IA implementadas' : '• Busca implementar primeira solução de IA'}
${Array.isArray(u2AiTools) && u2AiTools.length > 0 ? `• Trabalha com: ${u2AiTools.join(', ')}` : ''}
${u2AiObjective ? `• Objetivo de IA: ${u2AiObjective}` : ''}
• Desafio atual: ${u2AiChallenge}
${u2AiUrgency === 'high' || u2AiUrgency === 'alta' ? '• Necessita implementação urgente' : u2AiUrgency === 'medium' || u2AiUrgency === 'média' ? '• Planeja implementar nos próximos meses' : '• Explorando oportunidades de longo prazo'}
${u2Budget ? `• Investimento disponível: ${u2Budget}` : ''}` : ''}

${u2Skills ? `🎯 COMPETÊNCIAS:
${u2Skills}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ REGRAS CRÍTICAS - LEIA COM ATENÇÃO:

1. ❌ NÃO REPITA palavras técnicas do prompt:
   - "nível advanced" → INTERPRETE como "domina IA"
   - "nível intermediate" → INTERPRETE como "tem experiência com IA"  
   - "urgência alta" → INTERPRETE como "precisa implementar rapidamente"
   - "urgência média" → INTERPRETE como "planeja implementar em breve"

2. ✅ TRANSFORME dados técnicos em INSIGHTS estratégicos:
   - "Domina implementação de IA + ferramentas X,Y" → "Especialista em IA usando X e Y"
   - "Desafio: integração" → "Busca superar desafios de integração de IA"
   - "Objetivo: automação" → "Visa automatizar processos com IA"

3. 🎯 FOQUE em BENEFÍCIOS MÚTUOS tangíveis baseados em:
   - Objetivos estratégicos específicos
   - Desafios reais mencionados
   - Áreas de impacto compatíveis
   - Resultados esperados concretos

4. 🚫 NUNCA use:
   - Frases do tipo "nível X em IA"
   - Termos técnicos como "advanced", "intermediate", "basic", "avançado", "intermediário", "básico"
   - Palavras como "urgência alta/média/baixa" ou "high/medium/low urgency"
   - Qualquer dado cru do prompt sem interpretação

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 INSTRUÇÕES PARA COPY:

1. **FOCO EM OBJETIVOS ESPECÍFICOS**: Cite explicitamente os OBJETIVOS ESTRATÉGICOS e MÉTRICAS DE SUCESSO de cada perfil

2. **SINERGIA REAL**: Identifique como ${targetUser?.name} pode ajudar ${currentUser?.name} a:
   - Atingir o objetivo: "${u1MainGoal}"
   - Superar o obstáculo: "${u1MainObstacle}"
   - Impactar a área: "${u1ImpactArea}"
   - Alcançar resultado: "${u1ExpectedResult}"

3. **CONTEXTO DE IA**: Se ambos trabalham com IA, INTERPRETE e cite:
   - Expertise contextualizada (não use "nível X", diga "domina IA" ou "está explorando IA")
   - Ferramentas específicas que usam
   - Como podem se complementar nos desafios de IA

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
"**${targetUser?.name}** pode acelerar o objetivo de ${currentUser?.name} de **${u1MainGoal}** através de expertise em **${u2ImpactArea}**. ${u2AiLevel === 'advanced' || u2AiLevel === 'avançado' ? 'Com domínio em implementação de IA' : u2AiLevel === 'intermediate' || u2AiLevel === 'intermediário' ? 'Com experiência prática em IA' : 'Com interesse em explorar IA'} e atuação em ${u2CompanySector}, pode ajudar a superar **${u1MainObstacle}** e atingir **${u1ExpectedResult}** em 90 dias."

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
    let generatedCopy = aiData.choices?.[0]?.message?.content || '';

    console.log('✅ Copy gerada com sucesso');

    // 🛡️ VALIDAÇÃO: Garantir que copy NÃO contém termos proibidos
    const forbiddenTerms = [
      /nível\s+(advanced|intermediate|basic|avançado|intermediário|básico)/gi,
      /urgência\s+(alta|média|baixa|high|medium|low)/gi,
      /\b(advanced|intermediate|basic)\b/gi,
    ];

    let hasForbiddenTerms = false;
    forbiddenTerms.forEach(regex => {
      if (regex.test(generatedCopy)) {
        console.warn(`⚠️ Copy contém termo proibido detectado por regex: ${regex}`);
        hasForbiddenTerms = true;
        // Remover o termo proibido como fallback
        generatedCopy = generatedCopy.replace(regex, '');
      }
    });

    if (hasForbiddenTerms) {
      console.warn('⚠️ Copy foi limpa de termos técnicos não interpretados');
    }

    // 💾 SALVAR A COPY NO BANCO PARA CACHE
    const { error: updateError } = await supabase
      .from('strategic_matches_v2')
      .update({ connection_copy: generatedCopy })
      .eq('user_id', currentUserId)
      .eq('matched_user_id', targetUserId);

    if (updateError) {
      console.warn('⚠️ Erro ao salvar copy no cache:', updateError);
      // Não bloqueia a resposta, apenas loga o erro
    } else {
      console.log('✅ Copy salva no cache com sucesso');
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