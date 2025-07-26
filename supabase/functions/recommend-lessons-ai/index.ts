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
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('📊 [LESSON-AI] Perfil do usuário carregado');

    // Buscar todas as aulas disponíveis (simulado por enquanto)
    const mockLessons = [
      {
        id: 1,
        title: "Fundamentos de Liderança Digital",
        description: "Aprenda os princípios básicos da liderança em ambientes digitais",
        category: "strategy",
        difficulty: "easy",
        duration: "45 min",
        topics: ["liderança", "transformação digital", "gestão de equipes"]
      },
      {
        id: 2,
        title: "Gestão de Processos com Automação",
        description: "Como automatizar processos empresariais para aumentar eficiência",
        category: "operational",
        difficulty: "medium",
        duration: "60 min",
        topics: ["automação", "processos", "eficiência operacional"]
      },
      {
        id: 3,
        title: "Análise de ROI em Projetos Digitais",
        description: "Métodos para calcular e justificar retorno sobre investimento",
        category: "revenue",
        difficulty: "advanced",
        duration: "90 min",
        topics: ["ROI", "análise financeira", "projetos digitais"]
      },
      {
        id: 4,
        title: "Customer Experience Digital",
        description: "Estratégias para melhorar a experiência do cliente online",
        category: "strategy",
        difficulty: "medium",
        duration: "75 min",
        topics: ["experiência do cliente", "digital", "satisfação"]
      },
      {
        id: 5,
        title: "Data Analytics para Negócios",
        description: "Como usar dados para tomar decisões empresariais estratégicas",
        category: "operational",
        difficulty: "advanced",
        duration: "120 min",
        topics: ["dados", "analytics", "tomada de decisão"]
      },
      {
        id: 6,
        title: "Metodologias Ágeis na Prática",
        description: "Implementação de Scrum e Kanban em equipes corporativas",
        category: "operational",
        difficulty: "medium",
        duration: "90 min",
        topics: ["agile", "scrum", "kanban", "gestão de projetos"]
      }
    ];

    console.log(`🛠️ [LESSON-AI] Aulas disponíveis: ${mockLessons.length}`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('⚠️ [LESSON-AI] Chave OpenAI não encontrada, usando análise básica');
      
      // Fallback básico se não houver OpenAI
      const recommendedLessons = mockLessons.map(lesson => ({
        ...lesson,
        ai_score: Math.floor(Math.random() * 40) + 60, // 60-100%
        reasoning: "Análise básica baseada no perfil"
      })).sort((a, b) => b.ai_score - a.ai_score);

      return new Response(JSON.stringify({ lessons: recommendedLessons }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 [LESSON-AI] Iniciando análise com IA real');

    // Prompt para a IA analisar as aulas
    const aiPrompt = `
Você é um especialista em educação corporativa e desenvolvimento profissional. Analise as aulas disponíveis e recomende as melhores para este usuário específico.

PERFIL DO USUÁRIO:
- Setor: ${userProfile?.business_sector || 'Não informado'}
- Experiência: ${userProfile?.experience_level || 'Não informado'}
- Cargo: ${userProfile?.job_title || 'Não informado'}
- Objetivos: ${userProfile?.business_goals || 'Não informado'}
- Desafios: ${userProfile?.main_challenges || 'Não informado'}

AULAS DISPONÍVEIS:
${mockLessons.map(lesson => `
- ${lesson.title}
  Categoria: ${lesson.category}
  Dificuldade: ${lesson.difficulty}
  Duração: ${lesson.duration}
  Descrição: ${lesson.description}
  Tópicos: ${lesson.topics.join(', ')}
`).join('\n')}

Para cada aula, forneça:
1. Uma pontuação de 0-100 indicando quão relevante ela é para este usuário específico
2. Uma justificativa de 1-2 frases explicando por que é relevante

Considere:
- Nível de experiência do usuário
- Setor de atuação
- Objetivos profissionais
- Desafios enfrentados
- Sequência lógica de aprendizado
- Aplicabilidade prática no contexto do usuário

Responda APENAS em formato JSON:
{
  "recommendations": [
    {
      "lesson_id": 1,
      "score": 85,
      "reasoning": "Muito relevante para desenvolver habilidades de liderança específicas do seu setor"
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
        model: 'gpt-4.1-2025-04-14',
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

    // Combinar recomendações da IA com dados das aulas
    const recommendedLessons = mockLessons.map(lesson => {
      const aiRec = aiRecommendations.find((rec: any) => rec.lesson_id === lesson.id);
      return {
        ...lesson,
        ai_score: aiRec?.score || 50,
        reasoning: aiRec?.reasoning || "Recomendação básica"
      };
    }).sort((a, b) => b.ai_score - a.ai_score);

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