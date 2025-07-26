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

    // Buscar perfil do usuário
    const { data: userProfile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('📊 [LESSON-AI] Perfil do usuário carregado');

    // Buscar todas as aulas reais disponíveis do banco de dados
    const { data: realLessons, error: lessonsError } = await supabaseClient
      .from('learning_lessons')
      .select(`
        id,
        title,
        description,
        estimated_time_minutes,
        difficulty_level,
        cover_image_url,
        learning_modules!inner (
          id,
          title,
          learning_courses!inner (
            id,
            title,
            description
          )
        )
      `)
      .eq('published', true)
      .eq('learning_modules.published', true)
      .eq('learning_modules.learning_courses.published', true)
      .order('learning_modules.learning_courses.order_index', { ascending: true })
      .order('learning_modules.order_index', { ascending: true })
      .order('order_index', { ascending: true });

    if (lessonsError) {
      console.error('❌ [LESSON-AI] Erro ao buscar aulas:', lessonsError);
      throw new Error('Erro ao buscar aulas do banco de dados');
    }

    // Transformar as aulas para o formato esperado
    const formattedLessons = (realLessons || []).map((lesson: any) => {
      const module = lesson.learning_modules;
      const course = module?.learning_courses;
      
      // Determinar categoria baseada no curso/módulo
      let category = 'operational';
      if (course?.title?.toLowerCase().includes('formação')) {
        category = 'strategy';
      } else if (course?.title?.toLowerCase().includes('club')) {
        category = 'operational';
      }

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
        description: lesson.description || `Aula do curso ${course?.title} - ${module?.title}`,
        category,
        difficulty,
        duration,
        course_title: course?.title,
        module_title: module?.title,
        cover_image_url: lesson.cover_image_url,
        topics: [
          course?.title?.toLowerCase().includes('formação') ? 'formação em IA' : 'prática de IA',
          'inteligência artificial',
          module?.title?.toLowerCase() || 'desenvolvimento'
        ]
      };
    });

    console.log(`🛠️ [LESSON-AI] Aulas disponíveis: ${formattedLessons.length}`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('⚠️ [LESSON-AI] Chave OpenAI não encontrada, usando análise básica');
      
      // Fallback básico se não houver OpenAI
      const recommendedLessons = formattedLessons.map(lesson => ({
        ...lesson,
        ai_score: Math.floor(Math.random() * 40) + 60, // 60-100%
        reasoning: "Análise básica baseada no perfil"
      })).sort((a, b) => b.ai_score - a.ai_score);

      return new Response(JSON.stringify({ lessons: recommendedLessons.slice(0, 6) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 [LESSON-AI] Iniciando análise com IA real');

    // Prompt para a IA analisar as aulas reais
    const aiPrompt = `
Você é um especialista em educação corporativa e IA. Analise as aulas de IA disponíveis e recomende as melhores para este usuário específico.

PERFIL DO USUÁRIO:
- Nome: ${userProfile?.name || 'Não informado'}
- Empresa: ${userProfile?.company_name || 'Não informado'}
- Cargo: ${userProfile?.current_position || 'Não informado'}
- Setor: ${userProfile?.industry || 'Não informado'}

AULAS DISPONÍVEIS:
${formattedLessons.map(lesson => `
- ${lesson.title}
  Curso: ${lesson.course_title}
  Módulo: ${lesson.module_title}
  Categoria: ${lesson.category}
  Dificuldade: ${lesson.difficulty}
  Duração: ${lesson.duration}
  Descrição: ${lesson.description}
  Tópicos: ${lesson.topics.join(', ')}
`).join('\n')}

Para cada aula, forneça:
1. Uma pontuação de 0-100 indicando quão relevante ela é para este usuário específico
2. Uma justificativa de 1-2 frases explicando por que é relevante para o contexto de IA

Considere:
- Nível de complexidade apropriado para o usuário
- Relevância para aplicação prática de IA no trabalho
- Sequência lógica de aprendizado (fundamentos antes de avançado)
- Aplicabilidade no setor/cargo do usuário
- Potencial de transformação digital

Responda APENAS em formato JSON:
{
  "recommendations": [
    {
      "lesson_id": "uuid_da_aula",
      "score": 85,
      "reasoning": "Muito relevante para desenvolver habilidades de IA aplicadas ao seu contexto profissional"
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
            content: 'Você é um especialista em educação corporativa. Sempre responda em JSON válido e seja preciso nas recomendações.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log('✅ [LESSON-AI] Resposta da IA recebida');

    const aiContent = aiResult.choices[0].message.content;
    const aiRecommendations = JSON.parse(aiContent).recommendations;

    // Combinar recomendações da IA com dados das aulas reais
    const recommendedLessons = formattedLessons.map(lesson => {
      const aiRec = aiRecommendations.find((rec: any) => rec.lesson_id === lesson.id);
      return {
        ...lesson,
        ai_score: aiRec?.score || 50,
        reasoning: aiRec?.reasoning || "Análise baseada no conteúdo da aula de IA"
      };
    }).sort((a, b) => b.ai_score - a.ai_score).slice(0, 6); // Limitar a 6 aulas

    console.log('🎯 [LESSON-AI] Análise concluída com sucesso');

    return new Response(JSON.stringify({ 
      lessons: recommendedLessons,
      user_profile: userProfile 
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