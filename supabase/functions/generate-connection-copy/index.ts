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

    // Buscar perfis de ambos os usuários
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles_networking_safe')
      .select('*')
      .in('id', [currentUserId, targetUserId]);

    if (profilesError || !profiles || profiles.length !== 2) {
      console.error('Erro ao buscar perfis:', profilesError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar perfis dos usuários' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentUser = profiles.find(p => p.id === currentUserId);
    const targetUser = profiles.find(p => p.id === targetUserId);

    // Extrair dados estruturados dos perfis
    const u1ValueProp = currentUser?.value_proposition || currentUser?.current_position || 'Profissional';
    const u1LookingFor = Array.isArray(currentUser?.looking_for) 
      ? currentUser.looking_for.join(', ') 
      : currentUser?.looking_for || 'Oportunidades de negócio';
    const u1Challenge = currentUser?.main_challenge || 'Expandir negócios';
    const u1Keywords = Array.isArray(currentUser?.keywords)
      ? currentUser.keywords.join(', ')
      : currentUser?.keywords || '';

    const u2ValueProp = targetUser?.value_proposition || targetUser?.current_position || 'Profissional';
    const u2LookingFor = Array.isArray(targetUser?.looking_for)
      ? targetUser.looking_for.join(', ')
      : targetUser?.looking_for || 'Oportunidades de negócio';
    const u2Challenge = targetUser?.main_challenge || 'Expandir negócios';
    const u2Keywords = Array.isArray(targetUser?.keywords)
      ? targetUser.keywords.join(', ')
      : targetUser?.keywords || '';

    console.log('📊 Dados enviados para IA:', {
      user1: {
        name: currentUser?.name,
        valueProp: u1ValueProp,
        lookingFor: u1LookingFor,
      },
      user2: {
        name: targetUser?.name,
        valueProp: u2ValueProp,
        lookingFor: u2LookingFor,
      }
    });

    // Prompt enriquecido com dados completos dos perfis
    const prompt = `Analise os perfis profissionais e escreva 2-3 linhas (máximo 80 palavras) explicando POR QUE conectar essas duas pessoas pode gerar NEGÓCIOS concretos.

**${currentUser?.name}** (${currentUser?.company_name})
- Proposta de valor: ${u1ValueProp}
- Busca: ${u1LookingFor}
- Desafio: ${u1Challenge}
- Perfil: ${u1Keywords}

**${targetUser?.name}** (${targetUser?.company_name})
- Proposta de valor: ${u2ValueProp}
- Busca: ${u2LookingFor}
- Desafio: ${u2Challenge}
- Perfil: ${u2Keywords}

Escreva em primeira pessoa (como se ${currentUser?.name} estivesse falando). Use negrito em **palavras-chave importantes**.
Foque em: 1) Oportunidade de negócio concreta, 2) Como um pode ajudar o outro.
NÃO use frases genéricas. Seja específico e prático.`;

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

    // Salvar a copy no match existente
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