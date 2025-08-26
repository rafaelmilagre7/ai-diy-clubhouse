import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NPSData {
  overall: number;
  distribution: {
    promoters: number;
    neutrals: number; 
    detractors: number;
  };
}

interface FeedbackData {
  id: string;
  score: number;
  feedback: string;
  lessonTitle: string;
  userName: string;
  createdAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { npsData, feedbackData, timeRange } = await req.json();

    console.log('🔍 Iniciando análise de plano de ação para NPS:', npsData?.overall);

    // Buscar contexto da plataforma para recomendações específicas
    const [solutionsData, lessonsData, coursesData] = await Promise.all([
      supabase.from('solutions').select('id, title, category, description, difficulty').limit(50),
      supabase.from('learning_lessons').select(`
        id, title, description,
        learning_modules!inner(
          title,
          learning_courses!inner(title)
        )
      `).limit(30),
      supabase.from('learning_courses').select('id, title, description').limit(20)
    ]);

    console.log('📊 Contexto da plataforma carregado:', {
      solutions: solutionsData.data?.length,
      lessons: lessonsData.data?.length,
      courses: coursesData.data?.length
    });

    // Analisar feedbacks negativos para identificar problemas específicos
    const negativeFeeds = feedbackData?.filter((f: FeedbackData) => f.score <= 6 && f.feedback?.trim()) || [];
    const neutralFeeds = feedbackData?.filter((f: FeedbackData) => f.score >= 7 && f.score <= 8 && f.feedback?.trim()) || [];

    // Criar contexto estruturado para o AI
    const platformContext = {
      solutions: solutionsData.data?.map(s => ({
        title: s.title,
        category: s.category,
        description: s.description,
        difficulty: s.difficulty
      })) || [],
      courses: coursesData.data?.map(c => ({
        title: c.title,
        description: c.description
      })) || [],
      lessons: lessonsData.data?.map(l => ({
        title: l.title,
        description: l.description,
        course: l.learning_modules?.learning_courses?.title
      })) || []
    };

    const prompt = `Você é um especialista em Customer Success e Experiência do Usuário, analisando uma plataforma educacional de IA chamada "Viver de IA".

**DADOS ATUAIS DE NPS:**
- Score NPS: ${npsData?.overall || 0}
- Promotores: ${npsData?.distribution?.promoters || 0}%
- Neutros: ${npsData?.distribution?.neutrals || 0}%
- Detratores: ${npsData?.distribution?.detractors || 0}%
- Total de feedbacks: ${feedbackData?.length || 0}
- Período analisado: ${timeRange || 'últimos 30 dias'}

**CONTEÚDO DA PLATAFORMA:**
A plataforma oferece:

*Soluções disponíveis:*
${platformContext.solutions.slice(0, 10).map(s => `- ${s.title} (${s.category}) - ${s.difficulty}`).join('\n')}

*Cursos principais:*
${platformContext.courses.slice(0, 5).map(c => `- ${c.title}`).join('\n')}

*Aulas em destaque:*
${platformContext.lessons.slice(0, 10).map(l => `- ${l.title} (Curso: ${l.course})`).join('\n')}

**FEEDBACKS NEGATIVOS RECENTES:**
${negativeFeeds.slice(0, 5).map((f: FeedbackData) => 
  `- Nota ${f.score}/10 na aula "${f.lessonTitle}": "${f.feedback}"`
).join('\n') || 'Nenhum feedback negativo detalhado encontrado.'}

**FEEDBACKS NEUTROS:**
${neutralFeeds.slice(0, 3).map((f: FeedbackData) => 
  `- Nota ${f.score}/10 na aula "${f.lessonTitle}": "${f.feedback}"`
).join('\n') || 'Nenhum feedback neutro detalhado encontrado.'}

**TAREFA:**
Baseado nos dados reais da plataforma e feedbacks dos usuários, crie um plano de ação estratégico e específico para melhorar o NPS. 

Suas recomendações DEVEM:
1. Ser específicas e acionáveis (não genéricas)
2. Referenciar conteúdos/cursos/soluções reais da plataforma quando relevante
3. Abordar problemas identificados nos feedbacks
4. Incluir métricas e prazos realistas
5. Priorizar ações por impacto x esforço

Estruture sua resposta em:
- **Diagnóstico** (análise dos dados)
- **Problemas Identificados** (específicos dos feedbacks)
- **Ações Prioritárias** (3-5 ações com detalhes)
- **Melhorias de Conteúdo** (referenciando cursos/aulas específicas)
- **Métricas de Acompanhamento** (KPIs específicos)
- **Cronograma** (próximos 30-90 dias)

Seja direto, específico e focado em resultados mensuráveis.`;

    console.log('🤖 Enviando prompt para OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em Customer Success com 15 anos de experiência, especializado em plataformas educacionais. Você analisa dados de NPS de forma científica e propõe ações específicas baseadas em evidências reais.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na OpenAI:', errorData);
      throw new Error(`Erro na OpenAI: ${response.status} - ${errorData}`);
    }

    const aiResponse = await response.json();
    const actionPlan = aiResponse.choices[0].message.content;

    console.log('✅ Plano de ação gerado com sucesso');

    // Log da análise para auditoria
    await supabase.from('audit_logs').insert({
      event_type: 'nps_ai_analysis',
      action: 'generate_action_plan',
      details: {
        nps_score: npsData?.overall,
        total_feedbacks: feedbackData?.length,
        negative_feedbacks: negativeFeeds.length,
        time_range: timeRange,
        ai_model_used: 'gpt-4.1-2025-04-14',
        platform_context_loaded: {
          solutions: platformContext.solutions.length,
          courses: platformContext.courses.length,
          lessons: platformContext.lessons.length
        }
      },
      severity: 'info'
    });

    return new Response(JSON.stringify({ 
      success: true,
      actionPlan,
      analysis: {
        npsScore: npsData?.overall || 0,
        totalFeedbacks: feedbackData?.length || 0,
        negativeFeedbacks: negativeFeeds.length,
        neutralFeedbacks: neutralFeeds.length,
        platformContext: {
          solutionsAnalyzed: platformContext.solutions.length,
          coursesAnalyzed: platformContext.courses.length,
          lessonsAnalyzed: platformContext.lessons.length
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      details: 'Erro interno ao gerar plano de ação'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});