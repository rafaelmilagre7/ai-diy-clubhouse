
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

    console.log('🤖 Enhancing trail with AI for user:', user_id);

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
      .from('lessons')
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

    // Enhance with AI if OpenAI key is available
    if (openaiApiKey && solutions) {
      console.log('🧠 Using AI to enhance justifications...');
      
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
                  console.log(`✅ AI justification for ${solution.title}: ${aiJustification}`);
                }
              }
            } catch (error) {
              console.error(`❌ Error generating AI justification for ${solution.title}:`, error);
            }
          }
        }
      }
    }

    // Add recommended lessons
    if (lessons && lessons.length > 0) {
      enhancedTrail.recommended_lessons = lessons.slice(0, 3).map((lesson, index) => ({
        lessonId: lesson.id,
        moduleId: lesson.learning_modules?.id,
        courseId: lesson.learning_modules?.learning_courses?.id,
        title: lesson.title,
        moduleTitle: lesson.learning_modules?.title,
        courseTitle: lesson.learning_modules?.learning_courses?.title,
        justification: `Aula essencial para complementar sua trilha de implementação`,
        priority: index + 1
      }));
    }

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

    console.log('✅ Trail enhanced successfully');

    return new Response(
      JSON.stringify({
        success: true,
        enhanced_trail: enhancedTrail,
        message: 'Trail enhanced with AI successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error enhancing trail:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
