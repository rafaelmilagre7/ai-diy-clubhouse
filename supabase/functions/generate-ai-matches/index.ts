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

    const currentDate = new Date();
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Verificar se já existem matches para este usuário neste mês
    const { data: existingMatches } = await supabase
      .from('network_matches')
      .select('id')
      .eq('user_id', user_id)
      .eq('month_year', monthYear);

    if (existingMatches && existingMatches.length > 0) {
      console.log('Usuário já possui matches gerados neste mês');
      return new Response(JSON.stringify({
        success: true,
        matches_generated: 0,
        message: 'Você já possui matches gerados para este mês. Novos matches estarão disponíveis no próximo mês!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar outros usuários para criar matches simulados (excluindo conexões já existentes)
    const { data: potentialMatches, error: matchesError } = await supabase
      .from('profiles')
      .select('id, name, company_name, current_position, industry, role')
      .neq('id', user_id)
      .not('id', 'in', `(
        SELECT CASE 
          WHEN requester_id = '${user_id}' THEN recipient_id 
          ELSE requester_id 
        END 
        FROM member_connections 
        WHERE (requester_id = '${user_id}' OR recipient_id = '${user_id}')
      )`)
      .limit(5);

    if (matchesError) {
      console.error('Erro ao buscar potenciais matches:', matchesError);
      throw new Error(`Erro ao buscar potenciais matches: ${matchesError.message}`);
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        matches_generated: 0,
        message: 'Não há novos usuários disponíveis para matches no momento.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let matchesGenerated = 0;
    const matchTypes = ['customer', 'supplier', 'partner', 'mentor'];

    // Gerar matches para cada usuário encontrado
    for (const match of potentialMatches) {
      const compatibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100%
      const matchType = matchTypes[Math.floor(Math.random() * matchTypes.length)];
      
      // Personalizar análise baseada no tipo de match
      const getAnalysisByType = (type: string) => {
        switch (type) {
          case 'customer':
            return {
              strengths: [
                "Perfil de empresa com potencial de demanda",
                "Setor compatível com suas soluções",
                "Tamanho de empresa adequado para seus serviços"
              ],
              opportunities: [
                "Desenvolvimento de parcerias comerciais",
                "Apresentação de soluções customizadas",
                "Expansão de carteira de clientes"
              ],
              recommended_approach: "Iniciar conversa apresentando cases de sucesso em empresas similares e identificando necessidades específicas."
            };
          case 'supplier':
            return {
              strengths: [
                "Expertise técnica complementar",
                "Experiência em fornecimento especializado",
                "Rede de contatos estratégica"
              ],
              opportunities: [
                "Otimização de processos internos",
                "Redução de custos operacionais",
                "Acesso a novas tecnologias"
              ],
              recommended_approach: "Explorar sinergias operacionais e apresentar demandas específicas da sua empresa."
            };
          case 'partner':
            return {
              strengths: [
                "Experiência complementar em setores estratégicos",
                "Potencial de sinergia em projetos colaborativos",
                "Rede de contatos alinhada com objetivos mútuos"
              ],
              opportunities: [
                "Desenvolvimento de parcerias estratégicas",
                "Troca de conhecimentos e melhores práticas",
                "Expansão de mercado através de colaboração"
              ],
              recommended_approach: "Iniciar com reunião informal para explorar sinergias e identificar oportunidades de colaboração mútua."
            };
          case 'mentor':
            return {
              strengths: [
                "Experiência senior na área",
                "Histórico de sucesso comprovado",
                "Rede de contatos consolidada"
              ],
              opportunities: [
                "Aprendizado acelerado",
                "Expansão de network",
                "Orientação estratégica"
              ],
              recommended_approach: "Apresentar desafios específicos e solicitar orientação baseada na experiência do profissional."
            };
          default:
            return {
              strengths: ["Perfil profissional alinhado", "Experiência relevante"],
              opportunities: ["Networking estratégico", "Troca de experiências"],
              recommended_approach: "Iniciar conversa para explorar pontos de interesse comum."
            };
        }
      };

      const aiAnalysis = getAnalysisByType(matchType);
      const matchReason = `Match baseado em análise de perfil: ${matchType === 'customer' ? 'potencial cliente' : matchType === 'supplier' ? 'fornecedor especializado' : matchType === 'partner' ? 'parceria estratégica' : 'mentorship'} com alta compatibilidade de ${compatibilityScore}%.`;

      // Verificar se já existe match entre estes usuários
      const { data: existingMatch } = await supabase
        .from('network_matches')
        .select('id')
        .eq('user_id', user_id)
        .eq('matched_user_id', match.id)
        .single();

      if (existingMatch) {
        console.log(`Match já existe com ${match.name}, pulando...`);
        continue;
      }

      // Inserir o match na tabela
      const { error: insertError } = await supabase
        .from('network_matches')
        .insert({
          user_id: user_id,
          matched_user_id: match.id,
          match_type: matchType,
          compatibility_score: compatibilityScore,
          match_reason: matchReason,
          ai_analysis: aiAnalysis,
          month_year: monthYear,
          status: 'pending'
        });

      if (insertError) {
        console.error('Erro ao inserir match:', insertError);
        console.error('Dados do match:', {
          user_id,
          matched_user_id: match.id,
          match_type: matchType,
          compatibility_score: compatibilityScore,
          month_year: monthYear
        });
      } else {
        matchesGenerated++;
        console.log(`Match ${matchType} criado com ${match.name} (${compatibilityScore}% compatibilidade)`);
      }
    }

    console.log(`Total de matches gerados: ${matchesGenerated}`);

    return new Response(JSON.stringify({
      success: true,
      matches_generated: matchesGenerated,
      message: matchesGenerated > 0 
        ? `${matchesGenerated} novos matches foram gerados para você!` 
        : 'Nenhum novo match foi gerado. Tente novamente mais tarde.'
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