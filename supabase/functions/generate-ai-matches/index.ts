import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    
    console.log('Gerando matches IA para usuário:', user_id);

    if (!user_id) {
      throw new Error('user_id é obrigatório');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se o usuário existe
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError) {
      console.error('Erro ao buscar perfil do usuário:', userError);
      throw new Error(`Usuário não encontrado: ${userError.message}`);
    }

    console.log('Perfil do usuário encontrado:', userProfile.name);

    // Buscar outros usuários para criar matches simulados
    const { data: potentialMatches, error: matchesError } = await supabase
      .from('profiles')
      .select('id, name, company_name, current_position, industry')
      .neq('id', user_id)
      .limit(5);

    if (matchesError) {
      console.error('Erro ao buscar potenciais matches:', matchesError);
      throw new Error(`Erro ao buscar potenciais matches: ${matchesError.message}`);
    }

    const currentDate = new Date();
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    let matchesGenerated = 0;

    // Gerar matches para cada usuário encontrado
    for (const match of potentialMatches) {
      const compatibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100%
      
      const aiAnalysis = {
        strengths: [
          "Experiência complementar em setores estratégicos",
          "Potencial de sinergia em projetos colaborativos",
          "Rede de contatos alinhada com objetivos mútuos"
        ],
        opportunities: [
          "Desenvolvimento de parcerias comerciais",
          "Troca de conhecimentos e melhores práticas",
          "Expansão de mercado através de colaboração"
        ],
        recommended_approach: "Iniciar com reunião informal para explorar sinergias e identificar oportunidades de colaboração mútua."
      };

      const matchReason = `Match baseado em complementaridade de experiência e potencial de sinergia entre ${userProfile.current_position || 'sua posição'} e ${match.current_position || 'a posição do profissional'}.`;

      // Inserir o match na tabela
      const { error: insertError } = await supabase
        .from('network_matches')
        .insert({
          user_id: user_id,
          matched_user_id: match.id,
          match_type: 'ai_generated',
          compatibility_score: compatibilityScore,
          match_reason: matchReason,
          ai_analysis: aiAnalysis,
          month_year: monthYear,
          status: 'pending'
        });

      if (insertError) {
        console.error('Erro ao inserir match:', insertError);
      } else {
        matchesGenerated++;
        console.log(`Match criado com ${match.name}`);
      }
    }

    console.log(`Total de matches gerados: ${matchesGenerated}`);

    return new Response(JSON.stringify({
      success: true,
      matches_generated: matchesGenerated,
      message: `${matchesGenerated} novos matches foram gerados para você!`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-ai-matches:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});