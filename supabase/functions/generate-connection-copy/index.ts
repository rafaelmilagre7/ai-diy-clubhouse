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

    // Buscar perfis completos de ambos os usuários com dados enriquecidos
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
        whatsapp_number
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

    // Extrair e estruturar dados completos dos perfis
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

    console.log('📊 Dados enriquecidos enviados para IA:', {
      user1: {
        name: currentUser?.name,
        company: currentUser?.company_name,
        industry: u1Industry,
        companySize: u1CompanySize,
        valueProp: u1ValueProp,
        lookingFor: u1LookingFor,
        challenge: u1Challenge,
        skills: u1Skills,
      },
      user2: {
        name: targetUser?.name,
        company: targetUser?.company_name,
        industry: u2Industry,
        companySize: u2CompanySize,
        valueProp: u2ValueProp,
        lookingFor: u2LookingFor,
        challenge: u2Challenge,
        skills: u2Skills,
      }
    });

    // Prompt ultra-personalizado com todos os dados estruturados
    const prompt = `Você é um consultor de negócios B2B analisando dois perfis profissionais para recomendar uma conexão estratégica. 

PERFIL 1 - ${currentUser?.name || 'Usuário 1'}:
• Empresa: ${currentUser?.company_name || 'Não informado'} (${u1CompanySize})
• Setor: ${u1Industry}
• Posição: ${currentUser?.current_position || 'Não informado'}
• Proposta de valor: ${u1ValueProp}
• Busca conectar-se com: ${u1LookingFor}
• Principal desafio: ${u1Challenge}
• Competências: ${u1Skills}
• Áreas de interesse: ${u1Keywords}

PERFIL 2 - ${targetUser?.name || 'Usuário 2'}:
• Empresa: ${targetUser?.company_name || 'Não informado'} (${u2CompanySize})
• Setor: ${u2Industry}
• Posição: ${targetUser?.current_position || 'Não informado'}
• Proposta de valor: ${u2ValueProp}
• Busca conectar-se com: ${u2LookingFor}
• Principal desafio: ${u2Challenge}
• Competências: ${u2Skills}
• Áreas de interesse: ${u2Keywords}

INSTRUÇÕES:
1. Escreva em TERCEIRA PESSOA como um consultor de negócios recomendando a conexão
2. Máximo 70 palavras (2-3 linhas)
3. Seja ESPECÍFICO: cite dados concretos (setor, desafio, competência)
4. Identifique SINERGIA REAL: como um pode ajudar o outro a resolver desafios ou atingir objetivos
5. Use negrito (**palavra**) em palavras-chave importantes
6. Foque em OPORTUNIDADE DE NEGÓCIO concreta, não networking genérico

EXEMPLOS DE COPY BOA:
"**${currentUser?.name}** pode acelerar a **${u1Challenge}** de ${targetUser?.name} através de ${u1Skills}, enquanto **${targetUser?.name}** oferece expertise em **${u2Industry}** que potencializa ${u1LookingFor}."

NÃO USE frases vazias como "troca de experiências", "grande oportunidade" sem contexto. Seja CONCRETO e ORIENTADO A NEGÓCIO.`;

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