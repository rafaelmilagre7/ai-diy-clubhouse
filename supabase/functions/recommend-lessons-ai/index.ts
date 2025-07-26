import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    // Criar contexto do usuário para análise personalizada
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
      }
    };

    console.log('🤖 [TRAIL-AI] Iniciando análise personalizada com IA');

    // Prompt avançado para criar trilha de implementação personalizada
    const aiPrompt = `
Você é um especialista em implementação de IA corporativa com 15 anos de experiência em transformação digital. Sua missão é criar uma trilha de implementação personalizada e estratégica para este usuário específico.

PERFIL DETALHADO DO USUÁRIO:
👤 Dados Pessoais:
- Nome: ${userContext.profile.name}
- Email: ${userContext.profile.email}
- Empresa: ${userContext.profile.company || 'Não informado'}
- Cargo: ${userContext.profile.position || 'Não informado'}
- Setor: ${userContext.profile.industry || 'Não informado'}
- Papel no sistema: ${userContext.profile.role || 'member'}
- Membro desde: ${userContext.profile.created_at ? new Date(userContext.profile.created_at).toLocaleDateString('pt-BR') : 'Data não informada'}
- Habilidades: ${userContext.profile.skills.length > 0 ? userContext.profile.skills.join(', ') : 'Não informadas'}

📈 Progresso Atual:
- Aulas concluídas: ${userContext.progress.completed_lessons}
- Aulas em andamento: ${userContext.progress.in_progress_lessons}
- Certificados obtidos: ${userContext.progress.certificates_earned}
- Total de atividades: ${userContext.progress.total_progress}

🎯 RECURSOS DISPONÍVEIS:

📚 AULAS DISPONÍVEIS (${userContext.available_resources.lessons.length} aulas):
${userContext.available_resources.lessons.map((lesson, index) => `
${index + 1}. "${lesson.title}"
   - ID: ${lesson.id}
   - Dificuldade: ${lesson.difficulty}
   - Duração: ${lesson.duration ? `${lesson.duration} min` : 'Não especificada'}
   - Descrição: ${lesson.description}
`).join('\n')}

🛠️ SOLUÇÕES DISPONÍVEIS (${userContext.available_resources.solutions.length} soluções):
${userContext.available_resources.solutions.map((solution, index) => `
${index + 1}. "${solution.title}"
   - ID: ${solution.id}
   - Categoria: ${solution.category}
   - Dificuldade: ${solution.difficulty}
   - Descrição: ${solution.description}
`).join('\n')}

🎯 MISSÃO: Criar uma trilha de implementação de IA personalizada com:

1. **VISÃO GERAL PERSONALIZADA**: 
   - Análise do perfil e contexto do usuário
   - Identificação de oportunidades específicas de IA para seu contexto
   - Definição de objetivos estratégicos baseados no perfil
   - Roadmap de implementação em fases

2. **GUIA DE SOLUÇÕES PRIORITÁRIAS**:
   - Selecionar 6-8 soluções mais relevantes para este usuário específico
   - Ordenar por prioridade estratégica (não apenas por score)
   - Justificar cada recomendação baseada no perfil
   - Agrupar em categorias estratégicas (Primeiras Vitórias, Crescimento, Otimização)

3. **GUIA DE AULAS RECOMENDADAS**:
   - Selecionar 6-8 aulas que criem uma jornada de aprendizado lógica
   - Ordenar pedagogicamente (fundamentos antes de avançado)
   - Conectar com as soluções recomendadas
   - Incluir cronograma sugerido

INSTRUÇÕES CRÍTICAS:
- Sea MUITO específico para este usuário (use nome, empresa, cargo)
- Base tudo no perfil real fornecido
- Crie conexões lógicas entre perfil → objetivos → soluções → aulas
- Seja estratégico, não apenas técnico
- Foque no ROI e aplicabilidade prática

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
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em implementação de IA corporativa com PhD em Engenharia de Software e 15 anos de experiência consultando Fortune 500. 
            
            Você cria trilhas de implementação personalizadas que geram resultados reais e mensuráveis. 
            
            Seja EXTREMAMENTE específico e personalizado - use o nome, empresa e contexto real do usuário.
            
            Sempre responda em JSON válido e estruturado.`
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
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
        quick_wins: await enrichSolutions(personalizedTrail.solutions_guide?.quick_wins || [], availableSolutions),
        growth_solutions: await enrichSolutions(personalizedTrail.solutions_guide?.growth_solutions || [], availableSolutions),
        optimization_solutions: await enrichSolutions(personalizedTrail.solutions_guide?.optimization_solutions || [], availableSolutions)
      },
      lessons_guide: {
        ...personalizedTrail.lessons_guide,
        learning_path: await enrichLessons(personalizedTrail.lessons_guide?.learning_path || [], availableLessons)
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
      details: error.message 
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