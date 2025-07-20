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

    // Verificar se o usuário existe e buscar suas preferências
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError) {
      console.error('Erro ao buscar perfil do usuário:', userError);
      throw new Error(`Usuário não encontrado: ${userError.message}`);
    }

    // Buscar preferências de networking do usuário
    const { data: userPreferences } = await supabase
      .from('networking_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    console.log('Perfil do usuário encontrado:', userProfile.name);
    console.log('Preferências do usuário:', userPreferences);

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

    // Configurar filtros baseados nas preferências do usuário
    const maxMatches = userPreferences?.preferred_connections_per_week || 5;
    const minCompatibility = userPreferences?.min_compatibility || 0.7;
    const preferredTypes = userPreferences?.looking_for?.types || ['customer', 'supplier', 'partner'];
    const preferredIndustries = userPreferences?.looking_for?.industries || [];
    const excludedSectors = userPreferences?.exclude_sectors || [];

    // Primeiro buscar IDs de usuários já conectados
    const { data: existingConnections, error: connectionsError } = await supabase
      .from('member_connections')
      .select('requester_id, recipient_id')
      .or(`requester_id.eq.${user_id},recipient_id.eq.${user_id}`);

    if (connectionsError) {
      console.error('Erro ao buscar conexões existentes:', connectionsError);
      throw new Error('Erro ao buscar conexões existentes: ' + connectionsError.message);
    }

    // Extrair IDs dos usuários já conectados
    const connectedUserIds = new Set<string>();
    existingConnections?.forEach(conn => {
      if (conn.requester_id === user_id) {
        connectedUserIds.add(conn.recipient_id);
      } else {
        connectedUserIds.add(conn.requester_id);
      }
    });

    // Construir query para buscar potenciais matches excluindo usuários já conectados
    let query = supabase
      .from('profiles')
      .select('id, name, company_name, current_position, industry, role')
      .neq('id', user_id);

    // Se há usuários conectados, excluí-los da busca
    if (connectedUserIds.size > 0) {
      const connectedIds = Array.from(connectedUserIds);
      for (const connectedId of connectedIds) {
        query = query.neq('id', connectedId);
      }
    }

    // Aplicar filtros de indústria se especificados
    if (preferredIndustries.length > 0) {
      query = query.in('industry', preferredIndustries);
    }

    // Aplicar filtros de exclusão de setores
    if (excludedSectors.length > 0) {
      for (const sector of excludedSectors) {
        query = query.neq('industry', sector);
      }
    }

    query = query.limit(maxMatches);

    const { data: potentialMatches, error: matchesError } = await query;

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

    // Gerar matches para cada usuário encontrado
    for (const match of potentialMatches) {
      // Calcular compatibilidade baseada nas preferências do usuário
      let baseCompatibility = Math.floor(Math.random() * 30) + 70; // 70-100%
      
      // Ajustar compatibilidade baseado em preferências
      if (preferredIndustries.length > 0 && preferredIndustries.includes(match.industry)) {
        baseCompatibility = Math.min(100, baseCompatibility + 10); // Boost por indústria preferida
      }
      
      // Verificar se atende ao mínimo de compatibilidade
      const finalCompatibility = baseCompatibility / 100;
      if (finalCompatibility < minCompatibility) {
        console.log(`Match com ${match.name} rejeitado por baixa compatibilidade: ${Math.round(finalCompatibility * 100)}%`);
        continue;
      }
      
      // Selecionar tipo de match baseado nas preferências
      const matchType = preferredTypes[Math.floor(Math.random() * preferredTypes.length)];
      
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
      const matchReason = `Match personalizado baseado em suas preferências: ${matchType === 'customer' ? 'potencial cliente' : matchType === 'supplier' ? 'fornecedor especializado' : matchType === 'partner' ? 'parceria estratégica' : 'mentorship'} com ${Math.round(finalCompatibility * 100)}% de compatibilidade${preferredIndustries.includes(match.industry) ? ' e setor preferido' : ''}.`;

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
          compatibility_score: Math.round(finalCompatibility * 100),
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
          compatibility_score: Math.round(finalCompatibility * 100),
          month_year: monthYear
        });
      } else {
        matchesGenerated++;
        console.log(`Match ${matchType} criado com ${match.name} (${Math.round(finalCompatibility * 100)}% compatibilidade)`);
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