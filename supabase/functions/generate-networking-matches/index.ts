
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OnboardingData {
  user_id: string;
  company_name?: string;
  company_sector?: string;
  company_size?: string;
  current_position?: string;
  business_goals?: any;
  ai_experience?: any;
  professional_info?: any;
  business_context?: any;
  annual_revenue?: string;
  goals?: string[];
  priority_areas?: string[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  company_name?: string;
  current_position?: string;
  onboarding_data?: OnboardingData;
}

interface MatchResult {
  user_id: string;
  type: 'customer' | 'supplier';
  score: number;
  reason: string;
  analysis: {
    strengths: string[];
    opportunities: string[];
    recommended_approach: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário tem acesso (Club ou Admin)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, name')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'formacao')) {
      throw new Error('Acesso negado. Apenas membros Club e Admin podem usar o networking.');
    }

    const body = await req.json();
    const { target_user_id, force_regenerate = false, batch_size = 20 } = body;

    // Se target_user_id for fornecido, gerar matches apenas para esse usuário
    // Caso contrário, gerar para todos os usuários elegíveis
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    let userIds: string[] = [];
    
    if (target_user_id) {
      userIds = [target_user_id];
    } else {
      // Buscar todos os usuários elegíveis para networking (com onboarding completo)
      const { data: eligibleUsers } = await supabaseClient
        .from('onboarding_profile_view')
        .select('user_id')
        .eq('is_completed', true)
        .in('role', ['admin', 'formacao'])
        .limit(batch_size);
      
      userIds = eligibleUsers?.map(u => u.user_id).filter(Boolean) || [];
    }

    console.log(`Gerando matches para ${userIds.length} usuários no mês ${currentMonth}`);

    let totalMatches = 0;
    let errors: string[] = [];

    for (const userId of userIds) {
      try {
        // Verificar se já tem matches para este mês (a menos que force_regenerate seja true)
        if (!force_regenerate) {
          const { data: existingMatches } = await supabaseClient
            .from('network_matches')
            .select('id')
            .eq('user_id', userId)
            .eq('month_year', currentMonth)
            .limit(1);

          if (existingMatches && existingMatches.length > 0) {
            console.log(`Usuário ${userId} já tem matches para ${currentMonth}, pulando...`);
            continue;
          }
        }

        // Buscar dados completos do usuário atual
        const { data: currentUser } = await supabaseClient
          .from('onboarding_profile_view')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!currentUser) {
          console.log(`Dados do usuário ${userId} não encontrados, pulando...`);
          errors.push(`Dados do usuário ${userId} não encontrados`);
          continue;
        }

        // Buscar outros usuários para matching (excluindo o próprio usuário)
        const { data: potentialMatches } = await supabaseClient
          .from('onboarding_profile_view')
          .select('*')
          .neq('user_id', userId)
          .eq('is_completed', true)
          .in('role', ['admin', 'formacao'])
          .limit(50); // Limitar para otimizar performance

        if (!potentialMatches || potentialMatches.length === 0) {
          console.log(`Nenhum potencial match encontrado para usuário ${userId}`);
          continue;
        }

        // Usar Claude Sonnet para analisar e gerar matches
        const matches = await generateMatchesWithClaude(currentUser, potentialMatches);

        // Remover matches existentes se force_regenerate for true
        if (force_regenerate) {
          await supabaseClient
            .from('network_matches')
            .delete()
            .eq('user_id', userId)
            .eq('month_year', currentMonth);
        }

        // Salvar matches no banco
        let userMatches = 0;
        for (const match of matches) {
          try {
            const { error: insertError } = await supabaseClient
              .from('network_matches')
              .insert({
                user_id: userId,
                matched_user_id: match.user_id,
                match_type: match.type,
                compatibility_score: match.score,
                match_reason: match.reason,
                ai_analysis: match.analysis,
                month_year: currentMonth
              });
            
            if (insertError) {
              console.error(`Erro ao salvar match para usuário ${userId}:`, insertError);
              errors.push(`Erro ao salvar match: ${insertError.message}`);
            } else {
              userMatches++;
              totalMatches++;
            }
          } catch (error) {
            console.error(`Exceção ao salvar match para usuário ${userId}:`, error);
            errors.push(`Exceção ao salvar match: ${error.message}`);
          }
        }

        // Criar notificação de novos matches
        if (userMatches > 0) {
          try {
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: userId,
                type: 'new_matches',
                title: 'Novos matches disponíveis!',
                message: `Temos ${userMatches} novos matches de networking para você este mês.`,
                data: {
                  match_count: userMatches,
                  month: currentMonth
                }
              });
          } catch (notificationError) {
            console.error(`Erro ao criar notificação para usuário ${userId}:`, notificationError);
            errors.push(`Erro ao criar notificação: ${notificationError.message}`);
          }
        }

        console.log(`✅ Processado usuário ${userId}: ${userMatches} matches criados`);

      } catch (userError) {
        console.error(`Erro ao processar usuário ${userId}:`, userError);
        errors.push(`Erro ao processar usuário ${userId}: ${userError.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total_matches_generated: totalMatches,
      users_processed: userIds.length,
      month: currentMonth,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total_users: userIds.length,
        successful_matches: totalMatches,
        error_count: errors.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na geração de matches:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Erro interno do servidor durante a geração de matches'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function generateMatchesWithClaude(currentUser: any, potentialMatches: any[]): Promise<MatchResult[]> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!anthropicApiKey) {
    console.warn('ANTHROPIC_API_KEY não configurada, usando algoritmo básico');
    return generateBasicMatches(currentUser, potentialMatches);
  }

  const prompt = `
Você é um especialista em networking de negócios da plataforma Viver de IA. Analise o perfil do usuário atual e a lista de potenciais conexões para gerar matches inteligentes de alta qualidade.

USUÁRIO ATUAL:
Nome: ${currentUser.profile_name || 'N/A'}
Empresa: ${currentUser.company_name || 'N/A'}
Setor: ${currentUser.company_sector || 'N/A'}
Posição: ${currentUser.current_position || 'N/A'}
Tamanho da empresa: ${currentUser.company_size || 'N/A'}
Receita anual: ${currentUser.annual_revenue || 'N/A'}
Objetivos: ${JSON.stringify(currentUser.goals || [])}
Áreas prioritárias: ${JSON.stringify(currentUser.priority_areas || [])}
Contexto de negócio: ${JSON.stringify(currentUser.business_context || {})}

POTENCIAIS CONEXÕES (${potentialMatches.length} usuários):
${potentialMatches.map((user, index) => `
${index + 1}. ID: ${user.user_id}
   Nome: ${user.profile_name || 'N/A'}
   Empresa: ${user.company_name || 'N/A'}
   Setor: ${user.company_sector || 'N/A'}
   Posição: ${user.current_position || 'N/A'}
   Tamanho: ${user.company_size || 'N/A'}
   Receita: ${user.annual_revenue || 'N/A'}
   Objetivos: ${JSON.stringify(user.goals || [])}
`).join('\n')}

INSTRUÇÕES PARA ANÁLISE:
1. Analise cada potencial conexão e determine se seria um bom match como CLIENTE ou FORNECEDOR
2. Considere fatores como: complementaridade de setores, tamanho das empresas, objetivos de negócio, nível de conhecimento em IA, posições estratégicas
3. Gere até 8 matches (máximo) priorizando os de maior qualidade
4. Para cada match, forneça score de compatibilidade (60-100), razão clara do match e análise detalhada
5. Foque em matches que tenham potencial real de negócio, não apenas compatibilidade superficial

CRITÉRIOS DE QUALIDADE:
- Score 90-100: Compatibilidade excepcional, alta probabilidade de negócio
- Score 80-89: Muito boa compatibilidade, bom potencial
- Score 70-79: Boa compatibilidade, potencial moderado
- Score 60-69: Compatibilidade básica, vale a conexão

RESPONDA APENAS com um JSON válido no formato:
[
  {
    "user_id": "id_do_usuario",
    "type": "customer" | "supplier",
    "score": 85,
    "reason": "Explicação clara e específica do motivo do match (máximo 150 caracteres)",
    "analysis": {
      "strengths": ["força específica 1", "força específica 2"],
      "opportunities": ["oportunidade concreta 1", "oportunidade concreta 2"],
      "recommended_approach": "Como abordar esta conexão de forma estratégica (máximo 200 caracteres)"
    }
  }
]

IMPORTANTE: 
- Retorne apenas o JSON, sem markdown ou texto adicional
- Máximo 8 matches por usuário
- Score mínimo de 60
- Seja específico e relevante nas análises
`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      console.error(`Claude API error: ${response.status}`);
      return generateBasicMatches(currentUser, potentialMatches);
    }

    const result = await response.json();
    const content = result.content[0].text;
    
    try {
      const matches = JSON.parse(content);
      console.log(`✅ Claude gerou ${matches.length} matches para usuário ${currentUser.user_id}`);
      return matches;
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta do Claude:', content);
      return generateBasicMatches(currentUser, potentialMatches);
    }
  } catch (error) {
    console.error('Erro ao chamar Claude API:', error);
    return generateBasicMatches(currentUser, potentialMatches);
  }
}

function generateBasicMatches(currentUser: any, potentialMatches: any[]): MatchResult[] {
  const matches: MatchResult[] = [];
  const maxMatches = 5;

  // Algoritmo básico de matching baseado em compatibilidade de setores e tamanhos
  for (const match of potentialMatches.slice(0, maxMatches * 2)) {
    if (matches.length >= maxMatches) break;

    const sectorCompatibility = calculateSectorCompatibility(
      currentUser.company_sector,
      match.company_sector
    );
    
    const sizeCompatibility = calculateSizeCompatibility(
      currentUser.company_size,
      match.company_size
    );

    const score = Math.round((sectorCompatibility + sizeCompatibility) / 2);

    if (score >= 60) {
      const matchType = determineMatchType(currentUser, match);
      
      matches.push({
        user_id: match.user_id,
        type: matchType,
        score,
        reason: `Compatibilidade entre setores ${currentUser.company_sector || 'diversos'} e ${match.company_sector || 'diversos'}`,
        analysis: {
          strengths: ['Setores complementares', 'Potencial de sinergia'],
          opportunities: ['Troca de experiências', 'Possíveis parcerias'],
          recommended_approach: 'Iniciar conversa sobre desafios comuns do setor'
        }
      });
    }
  }

  return matches;
}

function calculateSectorCompatibility(sector1?: string, sector2?: string): number {
  if (!sector1 || !sector2) return 65;
  
  // Setores complementares têm score mais alto
  const complementarySectors = [
    ['tecnologia', 'educacao'],
    ['saude', 'tecnologia'],
    ['financeiro', 'tecnologia'],
    ['varejo', 'logistica'],
    ['industria', 'tecnologia']
  ];

  const s1 = sector1.toLowerCase();
  const s2 = sector2.toLowerCase();

  if (s1 === s2) return 70; // Mesmo setor
  
  for (const [sec1, sec2] of complementarySectors) {
    if ((s1.includes(sec1) && s2.includes(sec2)) || 
        (s1.includes(sec2) && s2.includes(sec1))) {
      return 85; // Setores complementares
    }
  }

  return 65; // Score neutro
}

function calculateSizeCompatibility(size1?: string, size2?: string): number {
  if (!size1 || !size2) return 70;

  const sizeOrder = ['1-10', '11-50', '51-200', '201-500', '500+'];
  const index1 = sizeOrder.findIndex(s => size1.includes(s.split('-')[0]));
  const index2 = sizeOrder.findIndex(s => size2.includes(s.split('-')[0]));

  if (index1 === -1 || index2 === -1) return 70;

  const difference = Math.abs(index1 - index2);
  
  if (difference === 0) return 75; // Mesmo tamanho
  if (difference === 1) return 85; // Tamanhos próximos (alta compatibilidade)
  if (difference === 2) return 80; // Compatibilidade boa
  return 65; // Compatibilidade básica
}

function determineMatchType(currentUser: any, match: any): 'customer' | 'supplier' {
  // Lógica simples: empresas maiores podem ser clientes, menores fornecedores
  const currentSize = getSizeValue(currentUser.company_size);
  const matchSize = getSizeValue(match.company_size);

  return matchSize > currentSize ? 'customer' : 'supplier';
}

function getSizeValue(size?: string): number {
  if (!size) return 2;
  if (size.includes('1-10')) return 1;
  if (size.includes('11-50')) return 2;
  if (size.includes('51-200')) return 3;
  if (size.includes('201-500')) return 4;
  if (size.includes('500')) return 5;
  return 2;
}
