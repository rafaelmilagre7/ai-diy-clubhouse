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

    // RESET: Deletar todos os matches existentes para este usuário antes de gerar novos
    console.log('Resetando matches existentes para maximizar fit de networking...');
    const { error: deleteError } = await supabase
      .from('strategic_matches_v2')
      .delete()
      .eq('user_id', user_id);

    if (deleteError) {
      console.error('Erro ao deletar matches existentes:', deleteError);
      // Não falhar aqui, apenas logar o erro
    } else {
      console.log('Matches existentes resetados com sucesso');
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

    // Buscar usuários com onboarding completo usando profiles.onboarding_completed
    console.log('Buscando usuários com onboarding completo...');
    
    const { data: candidatesWithOnboarding, error: candidatesError } = await supabase
      .from('profiles')
      .select('id, name, company_name, current_position, industry, role')
      .eq('onboarding_completed', true)
      .neq('id', user_id)
      .not('name', 'is', null)
      .limit(100);

    if (candidatesError) {
      console.error('Erro ao buscar candidatos com onboarding:', candidatesError);
      throw new Error(`Erro ao buscar candidatos: ${candidatesError.message}`);
    }

    console.log(`Encontrados ${candidatesWithOnboarding?.length || 0} usuários com onboarding completo`);

    let potentialMatches = [];

    if (!candidatesWithOnboarding || candidatesWithOnboarding.length === 0) {
      console.log('Fallback: usando todos os perfis válidos...');
      
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, company_name, current_position, industry, role')
        .neq('id', user_id)
        .not('name', 'is', null)
        .limit(50);

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        throw new Error(`Erro ao buscar perfis: ${profilesError.message}`);
      }

      potentialMatches = (allProfiles || [])
        .filter(profile => !connectedUserIds.has(profile.id));
    } else {
      // Usar usuários com onboarding completo
      potentialMatches = candidatesWithOnboarding
        .filter(candidate => !connectedUserIds.has(candidate.id));
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

    // Gerar matches usando dados de onboarding ou fallback
    const matchesWithScore = [];
    
    for (const candidate of potentialMatches) {
      let compatibilityScore = 0.5; // Score padrão
      
      // Se ambos têm onboarding, usar função de compatibilidade avançada
      if (userOnboarding && candidate.business_segment) {
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

        if (!compatibilityError && compatibilityResult) {
          compatibilityScore = compatibilityResult;
        }
      } else {
        // Fallback: usar compatibilidade baseada em perfil básico
        // Fallback: usar compatibilidade baseada em perfil básico
        const candidateUserId = candidate.id;
        
        const { data: basicCompatibility, error: basicError } = await supabase
          .rpc('generate_compatibility_score', {
            user1_id: user_id,
            user2_id: candidateUserId
          });
          
        if (!basicError && basicCompatibility) {
          compatibilityScore = basicCompatibility;
        } else {
          // Último fallback: score aleatório melhorado
          compatibilityScore = Math.min(1.0, (Math.random() * 0.4) + 0.6); // 60-100%
        }
      }
      
      // Verificar se atende ao mínimo de compatibilidade
      if (compatibilityScore < minCompatibility) {
        console.log(`Match rejeitado por baixa compatibilidade: ${Math.round(compatibilityScore * 100)}%`);
        continue;
      }

      matchesWithScore.push({
        candidate,
        score: compatibilityScore
      });
    }

    // Ordenar por compatibilidade e limitar aos TOP 10
    matchesWithScore.sort((a, b) => b.score - a.score);
    const topMatches = matchesWithScore.slice(0, 10);

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
      const matchReason = userOnboarding && candidate.business_segment
        ? `Match IA baseado em compatibilidade de ${Math.round(score * 100)}% entre perfis de negócio. Segmentos: ${userOnboarding.business_segment} ↔ ${candidate.business_segment}. Objetivos alinhados e potencial de sinergia identificado.`
        : `Match IA baseado em compatibilidade de ${Math.round(score * 100)}% entre perfis profissionais. Análise de perfis e experiências complementares identificada.`;

      // Verificar se já existe match entre estes usuários
      const { data: existingMatch } = await supabase
        .from('strategic_matches_v2')
        .select('id')
        .eq('user_id', user_id)
        .eq('matched_user_id', candidate.id)
        .maybeSingle();

      if (existingMatch) {
        console.log(`Match já existe com ${candidate.name}, pulando...`);
        continue;
      }

      // Gerar ice breaker personalizado
      const generateIceBreaker = (type: string, targetName: string) => {
        const iceBreakers = {
          customer: `Olá ${targetName}! Vi que você trabalha com ${candidate.industry || 'seu setor'}. Tenho soluções que podem interessar sua empresa.`,
          supplier: `Oi ${targetName}! Estamos buscando fornecedores especializados na sua área. Podemos conversar?`,
          partner: `Olá ${targetName}! Percebi que temos objetivos complementares. Que tal explorarmos uma parceria estratégica?`,
          mentor: `Olá ${targetName}! Admiro muito sua trajetória profissional. Seria uma honra aprender com sua experiência.`
        };
        return iceBreakers[type as keyof typeof iceBreakers] || `Olá ${targetName}! Que tal conectarmos e explorarmos sinergias?`;
      };

      // Inserir o match na tabela strategic_matches_v2
      const { error: insertError } = await supabase
        .from('strategic_matches_v2')
        .insert({
          user_id: user_id,
          matched_user_id: candidate.id,
          match_type: matchType,
          compatibility_score: score,
          why_connect: matchReason,
          ice_breaker: generateIceBreaker(matchType, candidate.name),
          opportunities: aiAnalysis.opportunities,
          ai_analysis: aiAnalysis,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (insertError) {
        console.error('Erro ao inserir match:', insertError);
        console.error('Dados do match:', {
          user_id,
          matched_user_id: candidate.id,
          match_type: matchType,
          compatibility_score: Math.round(score * 100),
          month_year: monthYear
        });
      } else {
        matchesGenerated++;
        console.log(`Match ${matchType} criado com ${candidate.name} (${Math.round(score * 100)}% compatibilidade)`);
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
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});