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
    const { data: userPreferences, error: preferencesError } = await supabase
      .from('networking_preferences')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    console.log('Perfil do usuário encontrado:', userProfile.name);
    console.log('Preferências do usuário:', userPreferences);
    
    // Se não há preferências, criar preferências padrão
    if (!userPreferences) {
      console.log('Usuário sem preferências de networking, criando preferências padrão...');
      
      const { data: newPreferences, error: createError } = await supabase
        .from('networking_preferences')
        .insert({
          user_id: user_id,
          looking_for: {
            types: ['customer', 'supplier', 'partner'],
            industries: [],
            company_sizes: ['startup', 'pequena', 'media', 'grande']
          },
          exclude_sectors: [],
          min_compatibility: 0.7,
          preferred_connections_per_week: 5,
          is_active: true
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Erro ao criar preferências padrão:', createError);
        throw new Error(`Erro ao criar preferências de networking: ${createError.message}`);
      }
      
      console.log('Preferências padrão criadas:', newPreferences);
    }

    const currentDate = new Date();
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Buscar dados de onboarding do usuário para matches mais inteligentes
    const { data: userOnboarding, error: onboardingError } = await supabase
      .from('quick_onboarding')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_completed', true)
      .maybeSingle();

    if (onboardingError) {
      console.error('Erro ao buscar onboarding do usuário:', onboardingError);
    }

    console.log('Dados de onboarding do usuário:', userOnboarding);

    // Configurar filtros baseados nas preferências do usuário (usar preferências existentes ou padrão)
    const activePrefs = userPreferences || {
      preferred_connections_per_week: 5,
      min_compatibility: 0.7,
      looking_for: { types: ['customer', 'supplier', 'partner'] },
      exclude_sectors: []
    };
    
    const maxMatches = activePrefs.preferred_connections_per_week || 5;
    const minCompatibility = activePrefs.min_compatibility || 0.7;
    const preferredTypes = activePrefs.looking_for?.types || ['customer', 'supplier', 'partner'];
    const preferredIndustries = activePrefs.looking_for?.industries || [];
    const excludedSectors = activePrefs.exclude_sectors || [];

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

    // Buscar usuários que completaram onboarding com seus dados
    const { data: candidatesWithOnboarding, error: candidatesError } = await supabase
      .from('quick_onboarding')
      .select(`
        user_id,
        business_segment,
        current_position,
        ai_level,
        main_objectives,
        company_size,
        profiles!inner (
          id,
          name,
          company_name,
          current_position,
          industry,
          role
        )
      `)
      .eq('is_completed', true)
      .neq('user_id', user_id);

    if (candidatesError) {
      console.error('Erro ao buscar candidatos com onboarding:', candidatesError);
      throw new Error(`Erro ao buscar candidatos: ${candidatesError.message}`);
    }

    if (!candidatesWithOnboarding || candidatesWithOnboarding.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        matches_generated: 0,
        message: 'Não há usuários com onboarding completo disponíveis para matches.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filtrar usuários já conectados
    const potentialMatches = candidatesWithOnboarding.filter(candidate => 
      !connectedUserIds.has(candidate.user_id)
    );


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

    // Gerar matches usando dados de onboarding
    const matchesWithScore = [];
    
    for (const candidate of potentialMatches) {
      if (!userOnboarding) {
        console.log('Usuário sem onboarding completo, pulando cálculo avançado');
        continue;
      }

      // Usar a função calculate_business_compatibility para calcular compatibilidade real
      const { data: compatibilityResult, error: compatibilityError } = await supabase
        .rpc('calculate_business_compatibility', {
          user1_segment: userOnboarding.business_segment,
          user1_ai_level: userOnboarding.ai_level,
          user1_objectives: userOnboarding.main_objectives,
          user1_company_size: userOnboarding.company_size,
          user2_segment: candidate.business_segment,
          user2_ai_level: candidate.ai_level,
          user2_objectives: candidate.main_objectives,
          user2_company_size: candidate.company_size
        });

      if (compatibilityError) {
        console.error('Erro ao calcular compatibilidade:', compatibilityError);
        continue;
      }

      const compatibilityScore = compatibilityResult || 0.5;
      
      // Verificar se atende ao mínimo de compatibilidade
      if (compatibilityScore < minCompatibility) {
        console.log(`Match com ${candidate.profiles.name} rejeitado por baixa compatibilidade: ${Math.round(compatibilityScore * 100)}%`);
        continue;
      }

      matchesWithScore.push({
        candidate,
        score: compatibilityScore
      });
    }

    // Ordenar por compatibilidade e limitar
    matchesWithScore.sort((a, b) => b.score - a.score);
    const topMatches = matchesWithScore.slice(0, maxMatches);

    console.log(`${topMatches.length} matches qualificados encontrados`);

    // Gerar matches para os usuários com melhor compatibilidade
    for (const { candidate, score } of topMatches) {
      
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

      // Criar análise inteligente baseada nos dados de onboarding
      const aiAnalysis = getAnalysisByType(matchType);
      
      // Criar match reason baseado nos dados reais de compatibilidade
      const matchReason = `Match IA baseado em compatibilidade de ${Math.round(score * 100)}% entre perfis de negócio. Segmentos: ${userOnboarding.business_segment} ↔ ${candidate.business_segment}. Objetivos alinhados e potencial de sinergia identificado.`;

      // Verificar se já existe match entre estes usuários
      const { data: existingMatch } = await supabase
        .from('network_matches')
        .select('id')
        .eq('user_id', user_id)
        .eq('matched_user_id', candidate.user_id)
        .maybeSingle();

      if (existingMatch) {
        console.log(`Match já existe com ${candidate.profiles.name}, pulando...`);
        continue;
      }

      // Inserir o match na tabela
      const { error: insertError } = await supabase
        .from('network_matches')
        .insert({
          user_id: user_id,
          matched_user_id: candidate.user_id,
          match_type: matchType,
          compatibility_score: Math.round(score * 100),
          match_reason: matchReason,
          ai_analysis: aiAnalysis,
          month_year: monthYear,
          status: 'pending'
        });

      if (insertError) {
        console.error('Erro ao inserir match:', insertError);
        console.error('Dados do match:', {
          user_id,
          matched_user_id: candidate.user_id,
          match_type: matchType,
          compatibility_score: Math.round(score * 100),
          month_year: monthYear
        });
      } else {
        matchesGenerated++;
        console.log(`Match ${matchType} criado com ${candidate.profiles.name} (${Math.round(score * 100)}% compatibilidade)`);
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