
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, trail_data, user_profile } = await req.json();

    console.log('🤖 Aprimorando trilha com IA para usuário:', user_id);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get solutions details
    const allSolutionIds = [
      ...trail_data.priority1.map((s: any) => s.solutionId),
      ...trail_data.priority2.map((s: any) => s.solutionId),
      ...trail_data.priority3.map((s: any) => s.solutionId)
    ];

    const { data: solutions } = await supabase
      .from('solutions')
      .select('*')
      .in('id', allSolutionIds);

    let enhancedTrail = { ...trail_data };

    // Se não há aulas recomendadas ou há poucas, buscar mais aulas inteligentemente
    if (!enhancedTrail.recommended_lessons || enhancedTrail.recommended_lessons.length < 5) {
      console.log('🔍 Buscando mais aulas para recomendação inteligente...');
      
      // Buscar todas as aulas disponíveis
      const { data: allLessons, error: lessonsError } = await supabase
        .from('learning_lessons')
        .select(`
          id,
          title,
          description,
          difficulty_level,
          estimated_time_minutes,
          cover_image_url,
          learning_modules(
            id,
            title,
            learning_courses(
              id,
              title
            )
          )
        `)
        .eq('published', true);

      if (!lessonsError && allLessons && allLessons.length > 0) {
        console.log(`📚 ${allLessons.length} aulas encontradas para análise IA`);
        
        // Usar IA para selecionar as melhores aulas
        if (openaiApiKey && user_profile) {
          const intelligentLessons = await selectLessonsWithAI(allLessons, user_profile, openaiApiKey);
          if (intelligentLessons.length > 0) {
            enhancedTrail.recommended_lessons = intelligentLessons;
            console.log(`✅ ${intelligentLessons.length} aulas selecionadas pela IA`);
          }
        } else {
          // Fallback: usar lógica simples se não tiver OpenAI
          const selectedLessons = allLessons
            .filter(lesson => lesson.learning_modules?.learning_courses?.id)
            .slice(0, 6)
            .map((lesson, index) => ({
              lessonId: lesson.id,
              moduleId: lesson.learning_modules?.id,
              courseId: lesson.learning_modules?.learning_courses?.id,
              title: lesson.title,
              justification: 'Aula selecionada com base no seu perfil e objetivos',
              priority: Math.floor(index / 2) + 1
            }));
          
          enhancedTrail.recommended_lessons = selectedLessons;
          console.log(`✅ ${selectedLessons.length} aulas selecionadas por lógica simples`);
        }
      }
    }

    // Generate personalized AI message
    if (openaiApiKey && user_profile) {
      console.log('🧠 Gerando mensagem personalizada...');
      
      try {
        const messagePrompt = `
Como especialista em IA para negócios, crie uma mensagem de boas-vindas personalizada e motivadora (máximo 200 palavras) para o usuário baseado em seu perfil:

Empresa: ${user_profile?.company_name || 'Empresa'}
Segmento: ${user_profile?.company_segment || 'Não especificado'}
Porte: ${user_profile?.company_size || 'Não especificado'}
Conhecimento em IA: ${user_profile?.ai_knowledge_level || 'Não especificado'}
Objetivo principal: ${user_profile?.main_goal || 'Não especificado'}

A mensagem deve:
1. Ser acolhedora e motivadora
2. Reconhecer o contexto específico da empresa
3. Destacar o potencial de transformação através da IA
4. Mencionar que a trilha foi criada especificamente para o perfil
5. Inspirar ação e confiança
6. Usar linguagem profissional mas acessível

Responda apenas com a mensagem personalizada, sem aspas ou explicações.`;

        const messageResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Você é um consultor especialista em implementação de IA para empresas brasileiras. Seja motivador, preciso e inspirador.' },
              { role: 'user', content: messagePrompt }
            ],
            max_tokens: 200,
            temperature: 0.8
          }),
        });

        if (messageResponse.ok) {
          const aiMessageResponse = await messageResponse.json();
          const personalizedMessage = aiMessageResponse.choices[0]?.message?.content?.trim();
          
          if (personalizedMessage) {
            enhancedTrail.ai_message = personalizedMessage;
            console.log('✅ Mensagem personalizada gerada');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao gerar mensagem personalizada:', error);
      }
    }

    // Enhance with AI if OpenAI key is available
    if (openaiApiKey && solutions) {
      console.log('🧠 Aprimorando justificativas com IA...');
      
      for (let priority of ['priority1', 'priority2', 'priority3']) {
        const items = enhancedTrail[priority];
        
        for (let i = 0; i < items.length; i++) {
          const solution = solutions.find(s => s.id === items[i].solutionId);
          if (solution) {
            try {
              const prompt = `
Como especialista em IA para negócios, crie uma justificativa personalizada e convincente (máximo 150 caracteres) para a seguinte recomendação:

Empresa: ${user_profile?.company_name || 'Empresa'}
Segmento: ${user_profile?.company_segment || 'Não especificado'}
Porte: ${user_profile?.company_size || 'Não especificado'}
Conhecimento em IA: ${user_profile?.ai_knowledge_level || 'Não especificado'}
Objetivo principal: ${user_profile?.main_goal || 'Não especificado'}

Solução recomendada: ${solution.title}
Descrição: ${solution.description}
Categoria: ${solution.category}
Dificuldade: ${solution.difficulty}

Prioridade: ${priority === 'priority1' ? 'Alta' : priority === 'priority2' ? 'Média' : 'Complementar'}

Crie uma justificativa que:
1. Conecte diretamente com o perfil da empresa
2. Destaque o benefício específico para o objetivo
3. Seja motivadora e clara
4. Use linguagem profissional mas acessível
5. Máximo 150 caracteres

Responda apenas com a justificativa, sem aspas ou explicações.`;

              const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openaiApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    { role: 'system', content: 'Você é um consultor especialista em implementação de IA para empresas brasileiras. Seja preciso, motivador e direto.' },
                    { role: 'user', content: prompt }
                  ],
                  max_tokens: 100,
                  temperature: 0.7
                }),
              });

              if (response.ok) {
                const aiResponse = await response.json();
                const aiJustification = aiResponse.choices[0]?.message?.content?.trim();
                
                if (aiJustification && aiJustification.length <= 150) {
                  enhancedTrail[priority][i].justification = aiJustification;
                  enhancedTrail[priority][i].aiScore = Math.round(Math.random() * 25 + 75);
                  enhancedTrail[priority][i].estimatedTime = '2-4 semanas';
                  console.log(`✅ Justificativa IA para ${solution.title}: ${aiJustification}`);
                }
              }
            } catch (error) {
              console.error(`❌ Erro ao gerar justificativa IA para ${solution.title}:`, error);
            }
          }
        }
      }
    }

    // Enhance lesson justifications with AI
    if (openaiApiKey && enhancedTrail.recommended_lessons && enhancedTrail.recommended_lessons.length > 0) {
      console.log('🎓 Aprimorando justificativas das aulas com IA...');
      
      for (let i = 0; i < enhancedTrail.recommended_lessons.length; i++) {
        const lesson = enhancedTrail.recommended_lessons[i];
        
        try {
          const lessonPrompt = `
Como especialista em IA para negócios, crie uma justificativa personalizada (máximo 120 caracteres) explicando por que esta aula é importante para o usuário:

Perfil do usuário:
- Empresa: ${user_profile?.company_name || 'Empresa'}
- Segmento: ${user_profile?.company_segment || 'Não especificado'}
- Conhecimento em IA: ${user_profile?.ai_knowledge_level || 'Não especificado'}
- Objetivo principal: ${user_profile?.main_goal || 'Não especificado'}

Aula: ${lesson.title}

Explique de forma concisa e motivadora por que esta aula é relevante para o perfil. Máximo 120 caracteres.

Responda apenas com a justificativa, sem aspas.`;

          const lessonResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'Você é um consultor especialista em implementação de IA. Seja conciso, motivador e direto.' },
                { role: 'user', content: lessonPrompt }
              ],
              max_tokens: 80,
              temperature: 0.7
            }),
          });

          if (lessonResponse.ok) {
            const lessonAiResponse = await lessonResponse.json();
            const aiLessonJustification = lessonAiResponse.choices[0]?.message?.content?.trim();
            
            if (aiLessonJustification && aiLessonJustification.length <= 120) {
              enhancedTrail.recommended_lessons[i].justification = aiLessonJustification;
              console.log(`✅ Justificativa IA para aula ${lesson.title}: ${aiLessonJustification}`);
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao gerar justificativa para aula ${lesson.title}:`, error);
        }
      }
    }

    // Add generation timestamp
    enhancedTrail.generated_at = new Date().toISOString();

    // Save enhanced trail
    const { error: updateError } = await supabase
      .from('implementation_trails')
      .update({
        trail_data: enhancedTrail,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (updateError) {
      throw new Error('Failed to save enhanced trail');
    }

    console.log('✅ Trilha aprimorada com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        enhanced_trail: enhancedTrail,
        message: 'Trilha aprimorada com IA com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao aprimorar trilha:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function selectLessonsWithAI(lessons: any[], userProfile: any, openaiApiKey: string): Promise<any[]> {
  try {
    console.log('🧠 Usando IA para selecionar as melhores aulas...');
    
    // Preparar dados das aulas para a IA
    const lessonsData = lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || 'Sem descrição',
      difficulty: lesson.difficulty_level || 'beginner',
      duration: lesson.estimated_time_minutes || 0,
      course: lesson.learning_modules?.learning_courses?.title || 'Curso não especificado',
      module: lesson.learning_modules?.title || 'Módulo não especificado'
    }));

    const prompt = `
Como especialista em IA e educação corporativa, analise o perfil do usuário e selecione as 5-6 melhores aulas da lista para acelerar sua jornada de implementação de IA.

PERFIL DO USUÁRIO:
- Empresa: ${userProfile?.company_name || 'Não especificado'}
- Segmento: ${userProfile?.company_segment || 'Não especificado'}
- Porte: ${userProfile?.company_size || 'Não especificado'}
- Conhecimento em IA: ${userProfile?.ai_knowledge_level || 'Não especificado'}
- Objetivo principal: ${userProfile?.main_goal || 'Não especificado'}

AULAS DISPONÍVEIS:
${lessonsData.map((lesson, index) => 
  `${index + 1}. ID: ${lesson.id}
     Título: ${lesson.title}
     Descrição: ${lesson.description}
     Dificuldade: ${lesson.difficulty}
     Duração: ${lesson.duration} min
     Curso: ${lesson.course}
     Módulo: ${lesson.module}`
).join('\n\n')}

CRITÉRIOS DE SELEÇÃO:
1. Relevância para o objetivo principal do usuário
2. Adequação ao nível de conhecimento em IA
3. Aplicabilidade ao segmento e porte da empresa
4. Progressão lógica de aprendizado
5. Potencial de impacto nos resultados

Selecione 5-6 aulas e retorne APENAS um JSON válido no formato:
[
  {
    "lessonId": "uuid-da-aula",
    "priority": 1,
    "justification": "Justificativa personalizada de até 100 caracteres"
  }
]

Distribua as prioridades: 1 (mais importante), 2 (complementar), 3 (aprofundamento).
Responda APENAS com o JSON, sem explicações adicionais.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um especialista em IA e educação corporativa. Responda apenas com JSON válido.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (response.ok) {
      const aiResponse = await response.json();
      const aiContent = aiResponse.choices[0]?.message?.content?.trim();
      
      if (aiContent) {
        try {
          const selectedLessons = JSON.parse(aiContent);
          
          // Mapear para o formato esperado
          const formattedLessons = selectedLessons.map((selection: any) => {
            const lesson = lessons.find(l => l.id === selection.lessonId);
            if (lesson) {
              return {
                lessonId: lesson.id,
                moduleId: lesson.learning_modules?.id,
                courseId: lesson.learning_modules?.learning_courses?.id,
                title: lesson.title,
                justification: selection.justification || 'Aula selecionada pela IA para seu perfil',
                priority: selection.priority || 1
              };
            }
            return null;
          }).filter(Boolean);
          
          console.log(`✅ IA selecionou ${formattedLessons.length} aulas`);
          return formattedLessons;
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse da resposta da IA:', parseError);
          console.log('Resposta da IA:', aiContent);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro na seleção de aulas com IA:', error);
  }
  
  return [];
}
