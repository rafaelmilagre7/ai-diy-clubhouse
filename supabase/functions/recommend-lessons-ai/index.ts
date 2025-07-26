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
    console.log('🚀 [LESSON-AI] Iniciando recomendação de aulas');
    
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

    console.log(`👤 [LESSON-AI] Usuário autenticado: ${user.id}`);

    // Buscar perfil completo do usuário com dados para análise
    const { data: userProfile, error: profileError } = await supabaseClient
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

    if (profileError) {
      console.error('❌ [LESSON-AI] Erro ao buscar perfil:', profileError);
    }

    // Buscar progresso de aprendizado do usuário (simplificado)
    const { data: userProgress } = await supabaseClient
      .from('learning_progress')
      .select(`
        lesson_id,
        progress_percentage,
        completed_at
      `)
      .eq('user_id', user.id);

    // Buscar certificados obtidos (simplificado)
    const { data: userCertificates } = await supabaseClient
      .from('learning_certificates')
      .select(`
        course_id,
        issued_at
      `)
      .eq('user_id', user.id);

    console.log('📊 [LESSON-AI] Perfil e progresso do usuário carregados');

    // Buscar todas as aulas reais disponíveis (simplificado para evitar erros)
    const { data: realLessons, error: lessonsError } = await supabaseClient
      .from('learning_lessons')
      .select(`
        id,
        title,
        description,
        estimated_time_minutes,
        difficulty_level,
        cover_image_url,
        order_index,
        module_id,
        published
      `)
      .eq('published', true)
      .order('order_index', { ascending: true })
      .limit(20);

    if (lessonsError) {
      console.error('❌ [LESSON-AI] Erro ao buscar aulas:', lessonsError);
      throw new Error('Erro ao buscar aulas do banco de dados');
    }

    // Transformar as aulas para o formato esperado (simplificado)
    const formattedLessons = (realLessons || []).map((lesson: any) => {
      // Determinar duração estimada
      const duration = lesson.estimated_time_minutes 
        ? `${lesson.estimated_time_minutes} min`
        : '45-60 min';

      // Mapear dificuldade
      const difficultyMap: { [key: string]: string } = {
        'beginner': 'easy',
        'intermediate': 'medium',
        'advanced': 'advanced'
      };

      const difficulty = difficultyMap[lesson.difficulty_level] || 'medium';

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || 'Aula de Inteligência Artificial',
        category: 'operational', // Categoria padrão
        difficulty,
        duration,
        course_title: 'Viver de IA',
        module_title: 'Módulo de IA',
        cover_image_url: lesson.cover_image_url,
        tags: ['inteligência artificial', 'desenvolvimento', 'prática de IA']
      };
    });

    console.log(`🛠️ [LESSON-AI] Aulas disponíveis: ${formattedLessons.length}`);

    // Criar contexto detalhado do usuário para análise
    const userContext = {
      profile: {
        name: userProfile?.name || 'Usuário',
        email: userProfile?.email,
        company: userProfile?.company_name,
        position: userProfile?.current_position,
        industry: userProfile?.industry,
        role: userProfile?.user_roles?.name,
        created_at: userProfile?.created_at
      },
      learning_progress: {
        completed_lessons: userProgress?.filter(p => p.completed_at)?.length || 0,
        in_progress_lessons: userProgress?.filter(p => !p.completed_at && p.progress_percentage > 0)?.length || 0,
        certificates_earned: userCertificates?.length || 0,
        average_progress: userProgress?.length > 0 
          ? Math.round(userProgress.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / userProgress.length)
          : 0
      },
      completed_courses: [], // Simplificado para evitar erros
      current_lessons: [] // Simplificado para evitar erros
    };

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('⚠️ [LESSON-AI] Chave OpenAI não encontrada, usando análise básica');
      
      // Fallback básico se não houver OpenAI
      const recommendedLessons = formattedLessons.map(lesson => ({
        ...lesson,
        ai_score: Math.floor(Math.random() * 40) + 60, // 60-100%
        reasoning: "Recomendação baseada na estrutura do curso - configure OpenAI para análise personalizada"
      })).sort((a, b) => b.ai_score - a.ai_score);

      return new Response(JSON.stringify({ 
        lessons: recommendedLessons.slice(0, 6),
        analysis_type: 'basic',
        message: 'Configure OPENAI_API_KEY para análise personalizada com IA'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 [LESSON-AI] Iniciando análise personalizada com IA real');

    // Prompt avançado para análise personalizada com IA
    const aiPrompt = `
Você é um especialista em educação corporativa e inteligência artificial com 10 anos de experiência. Sua missão é analisar o perfil do usuário e recomendar as melhores aulas de IA para maximizar seu aprendizado e aplicação prática.

PERFIL DETALHADO DO USUÁRIO:
📊 Informações Pessoais:
- Nome: ${userContext.profile.name}
- Cargo/Posição: ${userContext.profile.position || 'Não informado'}
- Empresa: ${userContext.profile.company || 'Não informado'}
- Setor: ${userContext.profile.industry || 'Não informado'}
- Papel no sistema: ${userContext.profile.role || 'member'}
- Membro desde: ${userContext.profile.created_at ? new Date(userContext.profile.created_at).toLocaleDateString('pt-BR') : 'Não informado'}

📈 Progresso de Aprendizado:
- Aulas concluídas: ${userContext.learning_progress.completed_lessons}
- Aulas em andamento: ${userContext.learning_progress.in_progress_lessons}
- Certificados obtidos: ${userContext.learning_progress.certificates_earned}
- Progresso médio: ${userContext.learning_progress.average_progress}%

✅ Cursos já concluídos: ${userContext.completed_courses.length > 0 ? userContext.completed_courses.join(', ') : 'Nenhum'}
⏳ Aulas em andamento: ${userContext.current_lessons.length > 0 ? userContext.current_lessons.join(', ') : 'Nenhuma'}

AULAS DISPONÍVEIS PARA ANÁLISE:
${formattedLessons.map((lesson, index) => `
${index + 1}. "${lesson.title}"
   - ID: ${lesson.id}
   - Curso: ${lesson.course_title}
   - Módulo: ${lesson.module_title}
   - Dificuldade: ${lesson.difficulty}
   - Duração: ${lesson.duration}
   - Categoria: ${lesson.category}
   - Tags: ${lesson.tags.join(', ')}
   - Descrição: ${lesson.description}
`).join('\n')}

INSTRUÇÕES PARA ANÁLISE:
1. Analise profundamente o perfil do usuário (experiência, cargo, progresso)
2. Considere o que já foi concluído para evitar redundância
3. Identifique lacunas de conhecimento e próximos passos lógicos
4. Priorize aulas que agregam valor prático ao contexto profissional
5. Balance entre desafio apropriado e aplicabilidade imediata
6. Considere a sequência pedagógica (fundamentos antes de avançado)

Para cada aula, forneça:
- Score de 0-100 (quão relevante é para ESTE usuário específico)
- Justificativa personalizada de 2-3 frases explicando POR QUE esta aula é importante para este usuário específico

RESPONDA APENAS EM JSON:
{
  "analysis_summary": "Resumo em 2-3 frases sobre o perfil do usuário e estratégia de recomendação",
  "recommendations": [
    {
      "lesson_id": "uuid_da_aula",
      "score": 85,
      "reasoning": "Justificativa personalizada específica para este usuário"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em educação corporativa e IA com PhD em Ciência da Computação. 
            
            Analise perfis de usuários e recomende aulas de IA de forma personalizada e estratégica. 
            Sempre responda em JSON válido e seja específico nas justificativas.
            
            Foque em:
            - Relevância prática para o contexto profissional
            - Progressão lógica de aprendizado
            - Aplicabilidade imediata no trabalho
            - ROI educacional maximizado`
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log('✅ [LESSON-AI] Resposta da IA recebida');

    const aiContent = aiResult.choices[0].message.content;
    let aiData;
    
    try {
      aiData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('❌ [LESSON-AI] Erro ao fazer parse do JSON:', parseError);
      console.log('Conteúdo recebido:', aiContent);
      throw new Error('Resposta da IA inválida');
    }

    const aiRecommendations = aiData.recommendations || [];
    const analysisSummary = aiData.analysis_summary || 'Análise personalizada concluída';

    // Combinar recomendações da IA com dados das aulas reais
    const recommendedLessons = formattedLessons.map(lesson => {
      const aiRec = aiRecommendations.find((rec: any) => rec.lesson_id === lesson.id);
      return {
        ...lesson,
        ai_score: aiRec?.score || 50,
        reasoning: aiRec?.reasoning || "Aula relevante para desenvolvimento em IA"
      };
    }).sort((a, b) => b.ai_score - a.ai_score).slice(0, 6); // Top 6 aulas

    console.log('🎯 [LESSON-AI] Análise personalizada concluída com sucesso');

    return new Response(JSON.stringify({ 
      lessons: recommendedLessons,
      user_profile: userProfile,
      analysis_summary: analysisSummary,
      analysis_type: 'ai_powered',
      user_context: userContext,
      total_lessons_analyzed: formattedLessons.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [LESSON-AI] Erro:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});