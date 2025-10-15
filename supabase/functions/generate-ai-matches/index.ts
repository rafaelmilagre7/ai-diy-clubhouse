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
      .limit(200);

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
      let matchTypeWeight = 0; // Peso adicional baseado no tipo
      
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
        
        // Adicionar bônus de compatibilidade baseado em dados de onboarding
        // Indústrias complementares
        if (userOnboarding.business_segment && candidate.business_segment) {
          if (userOnboarding.business_segment === candidate.business_segment) {
            compatibilityScore = Math.min(1.0, compatibilityScore + 0.1); // +10% para mesma indústria
          }
        }
        
        // Objetivos alinhados
        if (userOnboarding.main_objectives && candidate.main_objectives) {
          const userObjectives = Array.isArray(userOnboarding.main_objectives) ? userOnboarding.main_objectives : [];
          const candidateObjectives = Array.isArray(candidate.main_objectives) ? candidate.main_objectives : [];
          const commonObjectives = userObjectives.filter((obj: string) => candidateObjectives.includes(obj));
          if (commonObjectives.length > 0) {
            compatibilityScore = Math.min(1.0, compatibilityScore + (0.05 * commonObjectives.length)); // +5% por objetivo comum
          }
        }
      } else {
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
          // Último fallback: score variado baseado em dados disponíveis
          let baseScore = 0.5;
          
          // Variar score baseado em indústria
          if (userProfile.industry && candidate.industry) {
            if (userProfile.industry === candidate.industry) {
              baseScore += 0.15; // +15% para mesma indústria
            }
          }
          
          // Variar score baseado em tamanho de empresa
          if (userProfile.company_size && candidate.company_size) {
            if (userProfile.company_size === candidate.company_size) {
              baseScore += 0.1; // +10% para mesmo porte
            }
          }
          
          // Adicionar variação aleatória menor
          compatibilityScore = Math.min(1.0, baseScore + (Math.random() * 0.25)); // 50-100%
        }
      }
      
      // Determinar tipo de match e peso de prioridade
      const preferredType = preferredTypes[Math.floor(Math.random() * preferredTypes.length)];
      
      // Pesos de prioridade por tipo (quanto maior, mais prioritário)
      const typeWeights: Record<string, number> = {
        'customer': 1.0,        // Maior prioridade: oportunidades comerciais
        'cliente': 1.0,
        'partner': 0.8,         // Alta prioridade: parcerias estratégicas
        'parceiro': 0.8,
        'investor': 0.7,        // Média-alta: investidores/mentores
        'mentor': 0.7,
        'supplier': 0.6,        // Média: fornecedores
        'fornecedor': 0.6,
        'knowledge_exchange': 0.5 // Base: troca de conhecimento
      };
      
      matchTypeWeight = typeWeights[preferredType] || 0.5;
      
      // Calcular score final combinando compatibilidade + peso do tipo
      const finalScore = (compatibilityScore * 0.7) + (matchTypeWeight * 0.3);
      
      // Verificar se atende ao mínimo de compatibilidade
      if (finalScore < minCompatibility) {
        console.log(`Match rejeitado por baixa compatibilidade final: ${Math.round(finalScore * 100)}%`);
        continue;
      }

      matchesWithScore.push({
        candidate,
        score: finalScore,
        matchType: preferredType
      });
    }

    // Ordenar por score final (compatibilidade + prioridade de tipo) e limitar aos TOP 50
    matchesWithScore.sort((a, b) => b.score - a.score);
    const topMatches = matchesWithScore.slice(0, 50);

    console.log(`${topMatches.length} matches qualificados encontrados, ordenados por relevância`);

    // Gerar matches para os usuários com melhor compatibilidade
    for (const { candidate, score, matchType: preferredType } of topMatches) {
      
      // Mapear tipos do código para valores aceitos pelo banco
      // Banco aceita: commercial_opportunity, strategic_partnership, knowledge_exchange, supplier, investor
      let matchType: string;
      if (preferredType === 'customer' || preferredType === 'cliente') {
        matchType = 'commercial_opportunity';
      } else if (preferredType === 'supplier' || preferredType === 'fornecedor') {
        matchType = 'supplier';
      } else if (preferredType === 'partner' || preferredType === 'parceiro') {
        matchType = 'strategic_partnership';
      } else if (preferredType === 'mentor' || preferredType === 'investor' || preferredType === 'investidor') {
        matchType = 'investor';
      } else {
        matchType = 'strategic_partnership'; // default
      }
      
      console.log(`Preparando match tipo ${preferredType} → ${matchType} com ${candidate.name}`);
      
      // Personalizar análise baseada no tipo de match
      const getAnalysisByType = (type: string) => {
        switch (type) {
          case 'commercial_opportunity':
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
          case 'strategic_partnership':
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
          case 'investor':
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
          case 'knowledge_exchange':
            return {
              strengths: [
                "Conhecimento complementar e experiências valiosas",
                "Oportunidade de aprendizado mútuo",
                "Potencial para troca de melhores práticas"
              ],
              opportunities: [
                "Compartilhamento de conhecimentos especializados",
                "Aceleração de aprendizado em áreas estratégicas",
                "Networking baseado em desenvolvimento profissional"
              ],
              recommended_approach: "Propor sessões de troca de experiências e discussão de cases práticos."
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
      
      // Criar match reason personalizado com tom da Nina
      const generateMatchReason = (type: string, targetName: string, compatScore: number) => {
        const scorePercent = Math.round(compatScore * 100);
        const companyInfo = candidate.company_name ? ` de ${candidate.company_name}` : '';
        const positionInfo = candidate.current_position ? `, ${candidate.current_position}` : '';
        
        const reasons = {
          commercial_opportunity: `Olá! Selecionei ${targetName}${companyInfo} especialmente para você. Vi que o perfil dele${positionInfo} tem tudo a ver com o que você oferece. Analisando os dados, identifiquei ${scorePercent}% de compatibilidade entre vocês - isso significa grandes chances de negócio! Vale muito a pena iniciar essa conversa.`,
          supplier: `Oi! Encontrei ${targetName}${companyInfo} e achei que vocês precisam se conhecer. Pela experiência dele${positionInfo}, ele pode ser exatamente o parceiro que você está buscando. A compatibilidade de ${scorePercent}% entre vocês me deixou animada com as possibilidades de parceria!`,
          strategic_partnership: `Olha só quem eu encontrei para você: ${targetName}${companyInfo}! Analisando o perfil dele${positionInfo}, vi várias sinergias com seus objetivos. Com ${scorePercent}% de compatibilidade, acredito que vocês podem criar algo incrível juntos. Que tal começar uma conversa?`,
          investor: `Tenho uma indicação especial: ${targetName}${companyInfo}. A trajetória dele${positionInfo} é impressionante e pode agregar muito ao seu desenvolvimento. Com ${scorePercent}% de alinhamento entre seus objetivos, essa pode ser uma conexão transformadora para você!`,
          knowledge_exchange: `Que legal encontrar ${targetName}${companyInfo}! Vi que vocês têm muito a trocar em termos de conhecimento e experiências${positionInfo}. Com ${scorePercent}% de compatibilidade, tenho certeza que uma conversa entre vocês vai render insights valiosos para ambos!`
        };
        
        return reasons[type as keyof typeof reasons] || 
          `Ei! ${targetName}${companyInfo} tem um perfil muito interessante${positionInfo}. Com ${scorePercent}% de compatibilidade entre vocês, vi potencial real de vocês se ajudarem mutuamente. Vale a pena conhecer!`;
      };
      
      const matchReason = generateMatchReason(matchType, candidate.name, score);

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

      // Gerar ice breaker personalizado com tom natural
      const generateIceBreaker = (type: string, targetName: string) => {
        const companyMention = candidate.company_name ? ` na ${candidate.company_name}` : '';
        const industryMention = candidate.industry ? ` no segmento de ${candidate.industry}` : '';
        
        const iceBreakers = {
          commercial_opportunity: `Oi ${targetName}! A Nina me apresentou você e fiquei interessado no trabalho que você faz${companyMention}. Tenho algumas soluções que podem fazer sentido para vocês${industryMention}. Que tal conversarmos?`,
          supplier: `Olá ${targetName}! A Nina sugeriu que a gente se conhecesse. Estou procurando parceiros especializados${industryMention} e seu perfil${companyMention} chamou minha atenção. Podemos trocar uma ideia?`,
          strategic_partnership: `E aí ${targetName}! A Nina conectou a gente porque viu que nossos objetivos se complementam. Trabalho${userProfile.company_name ? ` na ${userProfile.company_name}` : ''} e achei seu perfil${companyMention} bem interessante. Vamos explorar possíveis parcerias?`,
          investor: `Olá ${targetName}! A Nina me indicou você e fiquei admirado com sua trajetória${companyMention}. Estou em um momento de crescimento profissional e seria incrível poder aprender com sua experiência. Você teria disponibilidade para trocarmos algumas ideias?`,
          knowledge_exchange: `Oi ${targetName}! A Nina viu que temos muito a aprender um com o outro. Seu trabalho${companyMention}${industryMention} é fascinante e acho que podemos trocar experiências valiosas. Que tal marcarmos um bate-papo?`
        };
        
        return iceBreakers[type as keyof typeof iceBreakers] || 
          `Oi ${targetName}! A Nina nos apresentou e achei seu perfil${companyMention} muito interessante. Vamos conectar para explorarmos sinergias?`;
      };

      // Inserir o match na tabela strategic_matches_v2
      // CRÍTICO: Converter score final para inteiro 0-100
      const finalCompatibilityScore = Math.round(score * 100);
      
      console.log(`Score para ${candidate.name}: decimal=${score.toFixed(3)}, integer=${finalCompatibilityScore}`);
      
      const { error: insertError } = await supabase
        .from('strategic_matches_v2')
        .insert({
          user_id: user_id,
          matched_user_id: candidate.id,
          match_type: matchType,
          compatibility_score: finalCompatibilityScore, // Sempre um inteiro entre 0-100
          why_connect: matchReason,
          ice_breaker: generateIceBreaker(matchType, candidate.name),
          connection_copy: matchReason,
          opportunities: aiAnalysis.opportunities,
          ai_analysis: aiAnalysis,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (insertError) {
        console.error(`❌ Erro ao inserir match ${matchType} com ${candidate.name}:`, insertError.message);
        console.error('Detalhes completos do erro:', JSON.stringify(insertError, null, 2));
        console.error('Dados do match que causou erro:', {
          user_id,
          matched_user_id: candidate.id,
          match_type: matchType,
          compatibility_score: Math.round(score * 100),
          month_year: monthYear
        });
      } else {
        matchesGenerated++;
        console.log(`✅ Match ${matchType} criado com ${candidate.name} (Score: ${score.toFixed(2)} - ${Math.round(score * 100)}% compatibilidade)`);
      }
    }

    console.log(`✅ Total de matches gerados: ${matchesGenerated}/${topMatches.length} candidatos processados`);

    return new Response(JSON.stringify({
      success: matchesGenerated > 0,
      matches_generated: matchesGenerated,
      candidates_analyzed: topMatches.length,
      message: matchesGenerated > 0 
        ? `${matchesGenerated} conexões estratégicas foram geradas com sucesso!` 
        : 'Não foi possível gerar novos matches no momento. Tente novamente mais tarde.'
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