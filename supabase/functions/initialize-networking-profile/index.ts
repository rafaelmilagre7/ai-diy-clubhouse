import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autenticação
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader! } }
    });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log('🚀 [INIT NETWORKING] Iniciando para usuário:', user.id);

    // 1. Verificar se já tem networking_profile_v2
    const { data: existingProfile } = await supabase
      .from('networking_profiles_v2')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (existingProfile) {
      console.log('✅ [INIT] Perfil já existe');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Perfil já existe',
        already_initialized: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Buscar dados do onboarding_final
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding_final')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (onboardingError || !onboarding) {
      console.error('❌ [INIT] Onboarding não encontrado:', onboardingError);
      return new Response(JSON.stringify({ 
        error: "Dados de onboarding não encontrados. Complete o onboarding primeiro." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Mapear dados
    const goals = onboarding.goals_info as any || {};
    const aiExp = onboarding.ai_experience as any || {};
    const businessInfo = onboarding.business_info as any || {};
    const personalization = onboarding.personalization as any || {};
    
    const value_proposition = [
      goals.main_objective,
      goals.area_to_impact,
      goals.expected_result_90_days
    ].filter(Boolean).join(' • ') || 'Desenvolvimento de negócios estratégicos';
    
    const looking_for: string[] = [];
    if (personalization.wants_networking === true) {
      looking_for.push('Parcerias estratégicas');
    }
    if (businessInfo.business_sector) {
      looking_for.push(`Conexões em ${businessInfo.business_sector}`);
    }
    if (looking_for.length === 0) {
      looking_for.push('Oportunidades de negócio', 'Networking B2B');
    }
    
    const main_challenge = aiExp.ai_main_challenge || goals.main_obstacle || 
      'Expansão de rede de contatos estratégicos';
    
    const keywords: string[] = [];
    const aiLevelMap: Record<string, string> = {
      'iniciante': 'Inovador',
      'intermediario': 'Estratégico',
      'avancado': 'Visionário'
    };
    if (aiExp.ai_knowledge_level && aiLevelMap[aiExp.ai_knowledge_level]) {
      keywords.push(aiLevelMap[aiExp.ai_knowledge_level]);
    }
    while (keywords.length < 3) {
      const defaults = ['Estratégico', 'Colaborativo', 'Eficiente'];
      keywords.push(defaults[keywords.length] || 'Inovador');
    }

    console.log('📊 [INIT] Dados mapeados:', {
      value_proposition_length: value_proposition.length,
      looking_for_count: looking_for.length,
      keywords_count: keywords.length
    });

    // 4. Analisar com IA
    let aiPersona = null;
    let networking_score = 75;

    if (LOVABLE_API_KEY) {
      try {
        const systemPrompt = `Você é um especialista em networking B2B e análise de perfis profissionais.
Retorne APENAS um JSON válido (sem markdown) com esta estrutura:
{
  "business_type": "categoria do negócio",
  "target_audience": "público-alvo",
  "value_keywords": ["palavra1", "palavra2", "palavra3"],
  "networking_style": "estilo de networking",
  "ideal_matches": ["perfil1", "perfil2"],
  "networking_score": número 0-100,
  "profile_quality": "low" | "medium" | "high",
  "recommendations": ["dica1", "dica2"]
}`;

        const userPrompt = `Analise este perfil:
Proposta de Valor: "${value_proposition}"
Busca por: ${looking_for.join(', ')}
Desafio: ${main_challenge}
Keywords: ${keywords.join(', ')}`;

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
            ]
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiContent = aiData.choices?.[0]?.message?.content;
          const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          aiPersona = JSON.parse(cleanContent);
          networking_score = aiPersona.networking_score || 75;
          console.log('✅ [INIT] Análise IA completa, score:', networking_score);
        }
      } catch (aiError) {
        console.warn('⚠️ [INIT] Erro na IA, usando valores padrão:', aiError);
      }
    }

    // 5. Buscar dados do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, company_name, current_position, industry, company_size, professional_bio')
      .eq('id', user.id)
      .single();

    // 6. Criar networking_profiles_v2
    const { data: newProfile, error: profileError } = await supabase
      .from('networking_profiles_v2')
      .insert({
        user_id: user.id,
        name: profile?.name || 'Usuário',
        email: profile?.email || user.email,
        company_name: profile?.company_name,
        current_position: profile?.current_position,
        industry: profile?.industry,
        company_size: profile?.company_size,
        professional_bio: profile?.professional_bio,
        value_proposition,
        looking_for,
        main_challenge,
        keywords,
        ai_persona: aiPersona,
        networking_score,
        profile_completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ [INIT] Erro ao criar perfil:', profileError);
      throw profileError;
    }

    console.log('✅ [INIT] Perfil criado com sucesso');

    // 7. Disparar geração de matches (em background)
    supabase.functions.invoke('generate-strategic-matches-v2', {
      body: { user_id: user.id }
    }).catch(err => console.error('⚠️ [INIT] Erro ao gerar matches:', err));

    return new Response(JSON.stringify({
      success: true,
      profile_id: newProfile.id,
      networking_score,
      message: 'Perfil de networking inicializado com sucesso'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('❌ [INIT NETWORKING ERROR]', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erro ao inicializar perfil de networking"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
