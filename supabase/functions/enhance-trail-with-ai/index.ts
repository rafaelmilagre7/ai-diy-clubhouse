
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

    // Get recommended lessons
    const { data: lessons } = await supabase
      .from('learning_lessons')
      .select(`
        *,
        learning_modules(
          id,
          title,
          learning_courses(
            id,
            title
          )
        )
      `)
      .eq('published', true)
      .limit(6);

    let enhancedTrail = { ...trail_data };

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
                  enhancedTrail[priority][i].aiScore = Math.round(Math.random() * 25 + 75); // Score between 75-100
                  enhancedTrail[priority][i].estimatedTime = '2-4 semanas'; // Default estimation
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

    // Add recommended lessons with AI justifications
    if (lessons && lessons.length > 0) {
      const selectedLessons = lessons.slice(0, 3);
      
      enhancedTrail.recommended_lessons = [];
      
      for (let i = 0; i < selectedLessons.length; i++) {
        const lesson = selectedLessons[i];
        let justification = `Aula essencial para complementar sua trilha de implementação`;
        
        // Generate AI justification for lessons if OpenAI is available
        if (openaiApiKey && user_profile) {
          try {
            const lessonPrompt = `
Como especialista em IA para negócios, crie uma justificativa personalizada (máximo 100 caracteres) explicando por que esta aula é importante para o usuário:

Perfil do usuário:
- Empresa: ${user_profile?.company_name || 'Empresa'}
- Segmento: ${user_profile?.company_segment || 'Não especificado'}
- Conhecimento em IA: ${user_profile?.ai_knowledge_level || 'Não especificado'}
- Objetivo principal: ${user_profile?.main_goal || 'Não especificado'}

Aula: ${lesson.title}
Descrição: ${lesson.description || 'Aula sobre implementação de IA'}
Módulo: ${lesson.learning_modules?.title || ''}
Curso: ${lesson.learning_modules?.learning_courses?.title || ''}

Explique de forma concisa por que esta aula é relevante para o perfil. Máximo 100 caracteres.

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
                  { role: 'system', content: 'Você é um consultor especialista em implementação de IA. Seja conciso e direto.' },
                  { role: 'user', content: lessonPrompt }
                ],
                max_tokens: 50,
                temperature: 0.7
              }),
            });

            if (lessonResponse.ok) {
              const lessonAiResponse = await lessonResponse.json();
              const aiLessonJustification = lessonAiResponse.choices[0]?.message?.content?.trim();
              
              if (aiLessonJustification && aiLessonJustification.length <= 100) {
                justification = aiLessonJustification;
              }
            }
          } catch (error) {
            console.error(`❌ Erro ao gerar justificativa para aula ${lesson.title}:`, error);
          }
        }
        
        enhancedTrail.recommended_lessons.push({
          lessonId: lesson.id,
          moduleId: lesson.learning_modules?.id,
          courseId: lesson.learning_modules?.learning_courses?.id,
          title: lesson.title,
          moduleTitle: lesson.learning_modules?.title,
          courseTitle: lesson.learning_modules?.learning_courses?.title,
          justification: justification,
          priority: i + 1
        });
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
        error: error.message || 'Erro interno do servidor'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
