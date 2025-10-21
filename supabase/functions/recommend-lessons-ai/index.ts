import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 [TRAIL-AI] Iniciando geração de trilha personalizada com IA');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`👤 [TRAIL-AI] Usuário autenticado: ${user.id}`);

    // Buscar perfil completo do usuário
    const { data: userProfile } = await supabaseClient
      .from('profiles')
      .select(`
        *,
        user_roles (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('id', user.id)
      .single();

    // Buscar dados completos de onboarding para personalização
    console.log('📋 [TRAIL-AI] Buscando dados de onboarding para personalização...');
    const { data: onboardingData, error: onboardingError } = await supabaseClient
      .from('onboarding_final')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (onboardingError) {
      console.error('⚠️ [TRAIL-AI] Erro ao buscar onboarding:', onboardingError);
    } else if (onboardingData) {
      console.log('✅ [TRAIL-AI] Dados de onboarding encontrados para personalização');
    } else {
      console.log('📝 [TRAIL-AI] Onboarding não encontrado, usando dados do perfil básico');
    }

    // Buscar progresso de aprendizado
    const { data: userProgress } = await supabaseClient
      .from('learning_progress')
      .select('*')
      .eq('user_id', user.id);

    // Buscar certificados
    const { data: userCertificates } = await supabaseClient
      .from('learning_certificates')
      .select('*')
      .eq('user_id', user.id);

    // Buscar aulas disponíveis - CONSULTA CORRIGIDA
    const { data: availableLessons, error: lessonsError } = await supabaseClient
      .from('learning_lessons')
      .select(`
        id,
        title,
        description,
        cover_image_url,
        difficulty_level,
        estimated_time_minutes,
        module_id,
        order_index
      `)
      .eq('published', true)
      .order('order_index')
      .limit(15);

    if (lessonsError) {
      console.error('❌ [TRAIL-AI] Erro ao buscar aulas:', lessonsError);
    }

    // Buscar soluções disponíveis
    const { data: availableSolutions } = await supabaseClient
      .from('solutions')
      .select(`
        id,
        title,
        description,
        category,
        difficulty,
        thumbnail_url
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(20);

    console.log(`📊 [TRAIL-AI] Dados coletados - Aulas: ${availableLessons?.length}, Soluções: ${availableSolutions?.length}`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('⚠️ [TRAIL-AI] Chave OpenAI não encontrada');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key não configurada',
        fallback: true
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Criar contexto personalizado baseado no onboarding
    let personalizedContext = null;
    
    if (onboardingData) {
      try {
        // Usar adapter para converter dados de onboarding
        personalizedContext = {
          personalProfile: {
            name: onboardingData.personal_info?.name || userProfile?.name || 'Usuário',
            location: formatLocation(onboardingData.personal_info),
            experienceLevel: onboardingData.ai_experience?.experience_level || 'Iniciante'
          },
          businessContext: {
            company: onboardingData.business_info?.company_name || onboardingData.professional_info?.company_name || userProfile?.company_name || 'Empresa não informada',
            sector: onboardingData.business_info?.company_sector || onboardingData.professional_info?.company_sector || 'Setor não informado',
            size: onboardingData.business_info?.company_size || onboardingData.professional_info?.company_size || 'Tamanho não informado',
            revenue: onboardingData.business_info?.annual_revenue || onboardingData.professional_info?.annual_revenue || 'Não informado',
            position: onboardingData.business_info?.current_position || onboardingData.professional_info?.current_position || userProfile?.current_position || 'Cargo não informado',
            mainChallenge: onboardingData.business_info?.main_challenge || onboardingData.professional_info?.main_challenge
          },
          aiReadiness: {
            currentStatus: onboardingData.ai_experience?.implementation_status || 'Não implementado',
            approach: onboardingData.ai_experience?.implementation_approach || 'Gradual',
            experienceLevel: onboardingData.ai_experience?.experience_level || 'Iniciante'
          },
          objectives: {
            primaryGoal: onboardingData.goals_info?.primary_goal || onboardingData.business_context?.primary_goal || 'Aumentar eficiência',
            timeline: onboardingData.goals_info?.timeline || onboardingData.business_context?.timeline,
            successMetrics: onboardingData.goals_info?.success_metrics || onboardingData.business_context?.success_metrics || [],
            investment: onboardingData.goals_info?.investment_capacity || onboardingData.business_context?.investment_capacity,
            priorityAreas: onboardingData.goals_info?.priority_areas || onboardingData.business_context?.priority_areas || [],
            specificObjectives: onboardingData.goals_info?.specific_objectives || onboardingData.business_context?.specific_objectives
          },
          learningPreferences: {
            style: onboardingData.personalization?.learning_style || 'Visual e prático',
            contentPreference: onboardingData.personalization?.preferred_content || [],
            supportLevel: onboardingData.personalization?.support_level,
            availability: onboardingData.personalization?.availability,
            frequency: onboardingData.personalization?.communication_frequency
          }
        };
        
        console.log('🎯 [TRAIL-AI] Contexto personalizado criado:', {
          name: personalizedContext.personalProfile.name,
          sector: personalizedContext.businessContext.sector,
          experience: personalizedContext.aiReadiness.experienceLevel,
          goal: personalizedContext.objectives.primaryGoal
        });
        
      } catch (error) {
        console.error('❌ [TRAIL-AI] Erro ao processar dados de onboarding:', error);
        personalizedContext = null;
      }
    }

    // Contexto básico de fallback
    const userContext = {
      profile: {
        name: userProfile?.name || 'Usuário',
        email: userProfile?.email,
        company: userProfile?.company_name,
        position: userProfile?.current_position,
        industry: userProfile?.industry,
        role: userProfile?.user_roles?.name,
        created_at: userProfile?.created_at,
        skills: userProfile?.skills || []
      },
      progress: {
        completed_lessons: userProgress?.filter(p => p.completed_at)?.length || 0,
        in_progress_lessons: userProgress?.filter(p => !p.completed_at && p.progress_percentage > 0)?.length || 0,
        certificates_earned: userCertificates?.length || 0,
        total_progress: userProgress?.length || 0
      },
      available_resources: {
        lessons: availableLessons?.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          difficulty: lesson.difficulty_level,
          duration: lesson.estimated_time_minutes
        })) || [],
        solutions: availableSolutions?.map(solution => ({
          id: solution.id,
          title: solution.title,
          description: solution.description,
          category: solution.category,
          difficulty: solution.difficulty
        })) || []
      },
      personalized: personalizedContext
    };

    console.log('🤖 [TRAIL-AI] Iniciando análise personalizada com IA');

    // Prompt avançado personalizado baseado no onboarding
    let aiPrompt = '';
    
    if (personalizedContext) {
      // Prompt personalizado com dados de onboarding
      aiPrompt = `
Você é um especialista em implementação de IA corporativa com 15 anos de experiência em transformação digital. Sua missão é criar uma trilha de implementação ALTAMENTE PERSONALIZADA para este usuário específico baseada em dados detalhados de onboarding.

🎯 PERFIL PERSONALIZADO COMPLETO:

👤 DADOS PESSOAIS:
- Nome: ${personalizedContext.personalProfile.name}
- Localização: ${personalizedContext.personalProfile.location}
- Nível de experiência em IA: ${personalizedContext.personalProfile.experienceLevel}

🏢 CONTEXTO EMPRESARIAL DETALHADO:
- Empresa: ${personalizedContext.businessContext.company}
- Setor: ${personalizedContext.businessContext.sector}
- Tamanho da empresa: ${personalizedContext.businessContext.size}
- Receita anual: ${personalizedContext.businessContext.revenue}
- Cargo/Posição: ${personalizedContext.businessContext.position}
- Desafio principal: ${personalizedContext.businessContext.mainChallenge || 'Não especificado'}

🤖 MATURIDADE E PRONTIDÃO PARA IA:
- Status atual de implementação: ${personalizedContext.aiReadiness.currentStatus}
- Abordagem preferida: ${personalizedContext.aiReadiness.approach}
- Nível de experiência: ${personalizedContext.aiReadiness.experienceLevel}

🎯 OBJETIVOS ESPECÍFICOS E ESTRATÉGICOS:
- Meta principal: ${personalizedContext.objectives.primaryGoal}
- Timeline desejado: ${personalizedContext.objectives.timeline || 'Não especificado'}
- Métricas de sucesso: ${personalizedContext.objectives.successMetrics?.join(', ') || 'Não especificadas'}
- Capacidade de investimento: ${personalizedContext.objectives.investment || 'Não especificada'}
- Áreas prioritárias: ${personalizedContext.objectives.priorityAreas?.join(', ') || 'Não especificadas'}
- Objetivos específicos: ${personalizedContext.objectives.specificObjectives || 'Não especificados'}

📚 PREFERÊNCIAS DE APRENDIZADO:
- Estilo de aprendizado: ${personalizedContext.learningPreferences.style}
- Tipo de conteúdo preferido: ${personalizedContext.learningPreferences.contentPreference?.join(', ') || 'Não especificado'}
- Nível de suporte desejado: ${personalizedContext.learningPreferences.supportLevel || 'Não especificado'}
- Disponibilidade de tempo: ${personalizedContext.learningPreferences.availability || 'Não especificada'}
- Frequência de comunicação: ${personalizedContext.learningPreferences.frequency || 'Não especificada'}

📈 PROGRESSO ATUAL NO SISTEMA:
- Aulas concluídas: ${userContext.progress.completed_lessons}
- Aulas em andamento: ${userContext.progress.in_progress_lessons}
- Certificados obtidos: ${userContext.progress.certificates_earned}
- Total de atividades: ${userContext.progress.total_progress}

📚 AULAS DISPONÍVEIS PARA RECOMENDAÇÃO (${userContext.available_resources.lessons.length} aulas):
${userContext.available_resources.lessons.map((lesson, index) => `
${index + 1}. "${lesson.title}"
   - ID: ${lesson.id}
   - Dificuldade: ${lesson.difficulty || 'Não especificada'}
   - Duração: ${lesson.duration ? `${lesson.duration} min` : 'Não especificada'}
   - Descrição: ${lesson.description || 'Sem descrição'}
`).join('\n')}

🛠️ SOLUÇÕES DISPONÍVEIS (${userContext.available_resources.solutions.length} soluções):
${userContext.available_resources.solutions.map((solution, index) => `
${index + 1}. "${solution.title}"
   - ID: ${solution.id}
   - Categoria: ${solution.category || 'Não especificada'}
   - Dificuldade: ${solution.difficulty || 'Não especificada'}
   - Descrição: ${solution.description || 'Sem descrição'}
`).join('\n')}`;
    } else {
      // Prompt básico de fallback
      aiPrompt = `
Você é um especialista em implementação de IA corporativa. Crie uma trilha personalizada baseada nos dados básicos disponíveis.

PERFIL BÁSICO DO USUÁRIO:
👤 Dados Pessoais:
- Nome: ${userContext.profile.name}
- Email: ${userContext.profile.email || 'Não informado'}
- Empresa: ${userContext.profile.company || 'Não informado'}
- Cargo: ${userContext.profile.position || 'Não informado'}
- Setor: ${userContext.profile.industry || 'Não informado'}

📈 Progresso Atual:
- Aulas concluídas: ${userContext.progress.completed_lessons}
- Aulas em andamento: ${userContext.progress.in_progress_lessons}
- Certificados obtidos: ${userContext.progress.certificates_earned}

📚 AULAS DISPONÍVEIS (${userContext.available_resources.lessons.length} aulas):
${userContext.available_resources.lessons.map((lesson, index) => `
${index + 1}. "${lesson.title}" (ID: ${lesson.id})
   - Dificuldade: ${lesson.difficulty || 'Não especificada'}
   - Duração: ${lesson.duration ? `${lesson.duration} min` : 'Não especificada'}
`).join('\n')}`;
    }

    // MISSÃO CRÍTICA: Criar uma trilha de implementação ALTAMENTE PERSONALIZADA
    const systemPrompt = `
1. **ANÁLISE CONTEXTUAL PROFUNDA**: 
   - Analise ESPECIFICAMENTE o perfil detalhado fornecido
   - Identifique oportunidades de IA únicas para este setor, cargo e contexto empresarial
   - Considere o nível de experiência atual e objetivos declarados
   - Leve em conta preferências de aprendizado e disponibilidade

2. **RECOMENDAÇÕES DE AULAS ESTRATÉGICAS**:
   - Selecione 6-8 aulas que sejam ALTAMENTE relevantes para este perfil específico
   - Priorize baseado em: experiência atual + setor + objetivos + preferências
   - Crie uma progressão lógica: fundamentos → aplicação → especialização
   - Conecte cada aula aos objetivos e desafios específicos do usuário
   - Considere a disponibilidade e estilo de aprendizado declarados

3. **JUSTIFICATIVAS PERSONALIZADAS**:
   - Para cada aula, explique POR QUE é relevante para ESTE usuário específico
   - Use o nome, empresa, cargo e contexto real
   - Conecte com os objetivos e desafios mencionados
   - Seja específico sobre como cada aula ajuda no contexto empresarial deles

INSTRUÇÕES CRÍTICAS:
- Use SEMPRE o nome real: ${personalizedContext ? personalizedContext.personalProfile.name : userContext.profile.name}
- Mencione o setor específico: ${personalizedContext ? personalizedContext.businessContext.sector : (userContext.profile.industry || 'tecnologia')}
- Considere o nível de experiência: ${personalizedContext ? personalizedContext.aiReadiness.experienceLevel : 'iniciante'}
- Foque no objetivo principal: ${personalizedContext ? personalizedContext.objectives.primaryGoal : 'aumentar eficiência'}
- Seja EXTREMAMENTE específico e personalizado - não use respostas genéricas
- Crie conexões lógicas: perfil real → objetivos reais → aulas específicas → resultados esperados

RESPONDA APENAS EM JSON:
{
  "overview": {
    "analysis": "Análise detalhada do perfil e contexto do usuário",
    "opportunities": "Oportunidades específicas de IA identificadas",
    "strategic_goals": "3-4 objetivos estratégicos personalizados",
    "implementation_phases": ["Fase 1: Fundação", "Fase 2: Expansão", "Fase 3: Otimização"]
  },
  "solutions_guide": {
    "quick_wins": [
      {
        "solution_id": "uuid",
        "priority_score": 95,
        "category": "Primeiras Vitórias",
        "reasoning": "Por que é prioritário para ESTE usuário específico",
        "expected_impact": "Impacto esperado no contexto dele",
        "implementation_timeframe": "1-2 semanas"
      }
    ],
    "growth_solutions": [
      {
        "solution_id": "uuid",
        "priority_score": 88,
        "category": "Crescimento",
        "reasoning": "Justificativa personalizada",
        "expected_impact": "Impacto esperado",
        "implementation_timeframe": "3-4 semanas"
      }
    ],
    "optimization_solutions": [
      {
        "solution_id": "uuid",
        "priority_score": 82,
        "category": "Otimização",
        "reasoning": "Justificativa personalizada",
        "expected_impact": "Impacto esperado",
        "implementation_timeframe": "4-6 semanas"
      }
    ]
  },
  "lessons_guide": {
    "learning_path": [
      {
        "lesson_id": "uuid",
        "sequence": 1,
        "category": "Fundamentos",
        "reasoning": "Por que começar com esta aula",
        "connects_to_solutions": ["solution_id1", "solution_id2"],
        "estimated_completion": "Semana 1"
      }
    ],
    "total_learning_time": "8-12 semanas",
    "learning_objectives": ["Objetivo 1", "Objetivo 2", "Objetivo 3"]
  },
  "personalized_message": "Mensagem motivacional personalizada de 2-3 frases usando o nome e contexto do usuário"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um consultor sênior especializado em implementação de IA corporativa com PhD em Engenharia de Software e 15 anos de experiência consultando Fortune 500. 

            Sua especialidade é criar trilhas de aprendizado ALTAMENTE PERSONALIZADAS que geram resultados reais e mensuráveis para cada perfil específico.

            REGRAS CRÍTICAS:
            1. Seja EXTREMAMENTE específico - use nome real, empresa real, setor real, cargo real
            2. Base TODAS as recomendações no perfil detalhado fornecido
            3. Conecte cada aula aos objetivos e desafios específicos declarados
            4. Considere nível de experiência, disponibilidade e preferências de aprendizado
            5. Responda SEMPRE em JSON válido e estruturado conforme solicitado
            6. Foque em resultados práticos e aplicáveis ao contexto empresarial específico

            Você não dá respostas genéricas - cada trilha é única para cada usuário.`
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log('✅ [TRAIL-AI] Resposta da IA recebida');

    const aiContent = aiResult.choices[0].message.content;
    console.log('Conteúdo recebido:', aiContent);
    
    // Limpar o conteúdo para extrair JSON válido
    let cleanContent = aiContent.trim();
    
    // Remover blocos de código markdown se presentes
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    let personalizedTrail;
    try {
      personalizedTrail = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ [TRAIL-AI] Erro ao fazer parse do JSON:', parseError);
      console.error('❌ [TRAIL-AI] Conteúdo limpo que falhou:', cleanContent);
      throw new Error('Resposta da IA inválida');
    }

    // Enriquecer com dados reais das soluções e aulas
    const enrichedTrail = {
      ...personalizedTrail,
      solutions_guide: {
        quick_wins: await enrichSolutions(personalizedTrail.solutions_guide?.quick_wins || [], availableSolutions || []),
        growth_solutions: await enrichSolutions(personalizedTrail.solutions_guide?.growth_solutions || [], availableSolutions || []),
        optimization_solutions: await enrichSolutions(personalizedTrail.solutions_guide?.optimization_solutions || [], availableSolutions || [])
      },
      lessons_guide: {
        ...personalizedTrail.lessons_guide,
        learning_path: await enrichLessons(personalizedTrail.lessons_guide?.learning_path || [], availableLessons || [])
      },
      user_profile: userProfile,
      generation_timestamp: new Date().toISOString(),
      analysis_type: 'ai_powered_personalized'
    };

    console.log('🎯 [TRAIL-AI] Trilha personalizada gerada com sucesso');

    return new Response(JSON.stringify(enrichedTrail), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [TRAIL-AI] Erro:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Função auxiliar para enriquecer soluções com dados reais
async function enrichSolutions(aiSolutions: any[], availableSolutions: any[]) {
  return aiSolutions.map(aiSol => {
    const realSolution = availableSolutions.find(sol => sol.id === aiSol.solution_id);
    return {
      ...aiSol,
      solution_data: realSolution || null
    };
  }).filter(sol => sol.solution_data); // Remove soluções não encontradas
}

// Função auxiliar para formatar localização
function formatLocation(personalInfo: any): string {
  if (!personalInfo) return 'Localização não informada';
  
  const city = personalInfo.city;
  const state = personalInfo.state;
  
  if (city && state) {
    return `${city}, ${state}`;
  } else if (state) {
    return state;
  } else if (city) {
    return city;
  }
  
  return 'Localização não informada';
}

// Função auxiliar para enriquecer aulas com dados reais
async function enrichLessons(aiLessons: any[], availableLessons: any[]) {
  return aiLessons.map(aiLesson => {
    const realLesson = availableLessons.find(lesson => lesson.id === aiLesson.lesson_id);
    return {
      ...aiLesson,
      lesson_data: realLesson || null
    };
  }).filter(lesson => lesson.lesson_data); // Remove aulas não encontradas
}