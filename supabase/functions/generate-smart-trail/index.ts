
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
    const { user_id } = await req.json();

    console.log('🤖 Gerando trilha inteligente com IA para usuário:', user_id);

    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar perfil completo do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(*)
      `)
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      throw new Error('Perfil do usuário não encontrado');
    }

    // 2. Buscar dados de onboarding mais recentes
    const { data: onboardingData } = await supabase
      .from('onboarding_final')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fallback para quick_onboarding se não houver onboarding_final
    const { data: quickOnboarding } = await supabase
      .from('quick_onboarding')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_completed', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const userData = onboardingData || quickOnboarding;
    
    if (!userData) {
      throw new Error('Dados de onboarding não encontrados ou incompletos');
    }

    console.log('📊 Dados do usuário coletados:', {
      role: profile.user_roles?.name || profile.role,
      company: userData.company_name,
      segment: userData.company_segment,
      experience: userData.ai_knowledge_level
    });

    // 3. Buscar soluções publicadas
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (solutionsError || !solutions || solutions.length === 0) {
      throw new Error('Nenhuma solução publicada encontrada');
    }

    // 4. Buscar aulas disponíveis baseado no papel do usuário
    let availableLessons = [];
    const userRole = profile.user_roles?.name || profile.role;
    
    // Verificar quais cursos o usuário pode acessar
    const { data: accessibleCourses } = await supabase.rpc('can_access_course', {
      user_id: user_id,
      course_id: null // Função será chamada para cada curso
    });

    // Buscar aulas de cursos publicados
    const { data: lessons } = await supabase
      .from('learning_lessons')
      .select(`
        *,
        learning_modules(
          id,
          title,
          learning_courses(
            id,
            title,
            published
          )
        )
      `)
      .eq('published', true)
      .eq('learning_modules.learning_courses.published', true);

    availableLessons = lessons || [];
    console.log('📚 Aulas disponíveis encontradas:', availableLessons.length);

    // 5. Usar IA para gerar recomendações personalizadas
    let aiGeneratedTrail = null;
    
    if (openaiApiKey) {
      console.log('🧠 Usando IA para gerar recomendações...');
      
      const userProfile = {
        name: userData.name || profile.name,
        company_name: userData.company_name,
        company_segment: userData.company_segment,
        company_size: userData.company_size,
        role: userData.role || userRole,
        ai_knowledge_level: userData.ai_knowledge_level,
        main_goal: userData.main_goal || userData.primary_goal,
        main_challenge: userData.main_challenge,
        expected_outcome_30days: userData.expected_outcome_30days,
        business_model: userData.business_model,
        annual_revenue_range: userData.annual_revenue_range,
        uses_ai: userData.uses_ai
      };

      const prompt = `
Você é um especialista em IA para negócios brasileiros. Analise o perfil abaixo e crie uma trilha de implementação PERSONALIZADA.

PERFIL DO USUÁRIO:
- Nome: ${userProfile.name}
- Empresa: ${userProfile.company_name}
- Segmento: ${userProfile.company_segment}
- Porte: ${userProfile.company_size}
- Papel: ${userProfile.role}
- Conhecimento IA: ${userProfile.ai_knowledge_level}
- Objetivo Principal: ${userProfile.main_goal}
- Desafio: ${userProfile.main_challenge}
- Expectativa 30 dias: ${userProfile.expected_outcome_30days}
- Modelo de Negócio: ${userProfile.business_model}
- Faturamento: ${userProfile.annual_revenue_range}
- Já usa IA: ${userProfile.uses_ai}

SOLUÇÕES DISPONÍVEIS:
${solutions.map(s => `- ID: ${s.id} | Título: ${s.title} | Categoria: ${s.category} | Dificuldade: ${s.difficulty} | Descrição: ${s.description.substring(0, 100)}...`).join('\n')}

AULAS DISPONÍVEIS:
${availableLessons.map(l => `- ID: ${l.id} | Título: ${l.title} | Curso: ${l.learning_modules?.learning_courses?.title} | Duração: ${l.estimated_time_minutes}min`).join('\n')}

TAREFA:
1. Selecione as 3 MELHORES soluções para prioridade 1 (alta)
2. Selecione 2-3 soluções para prioridade 2 (média)
3. Selecione 1-2 soluções para prioridade 3 (complementar)
4. Para cada solução, crie uma justificativa ESPECÍFICA de 100-120 caracteres explicando por que é ideal para ESTE perfil
5. Selecione 3-5 aulas que complementem as soluções escolhidas
6. Para cada aula, explique como ela apoia a implementação

RESPONDA APENAS EM JSON VÁLIDO (sem comentários):
{
  "priority1": [
    {"solutionId": "uuid", "justification": "justificativa específica de 100-120 chars"}
  ],
  "priority2": [
    {"solutionId": "uuid", "justification": "justificativa específica de 100-120 chars"}
  ],
  "priority3": [
    {"solutionId": "uuid", "justification": "justificativa específica de 100-120 chars"}
  ],
  "recommended_lessons": [
    {"lessonId": "uuid", "moduleId": "uuid", "courseId": "uuid", "justification": "como apoia a implementação", "priority": 1}
  ]
}
`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Você é um consultor especialista em implementação de IA para empresas brasileiras. Seja preciso, analítico e específico. Responda APENAS com JSON válido.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.3,
            response_format: { type: "json_object" }
          }),
        });

        if (response.ok) {
          const aiResponse = await response.json();
          const content = aiResponse.choices[0]?.message?.content;
          
          if (content) {
            try {
              aiGeneratedTrail = JSON.parse(content);
              console.log('✅ IA gerou trilha personalizada:', aiGeneratedTrail);
            } catch (parseError) {
              console.error('❌ Erro ao parsear resposta da IA:', parseError);
            }
          }
        } else {
          console.error('❌ Erro na chamada OpenAI:', response.status);
        }
      } catch (aiError) {
        console.error('❌ Erro na IA:', aiError);
      }
    }

    // 6. Fallback para algoritmo determinístico se IA falhar
    if (!aiGeneratedTrail) {
      console.log('🔄 Usando algoritmo fallback...');
      
      // Algoritmo baseado no perfil
      const isBeginnerAI = userData.ai_knowledge_level === 'iniciante';
      const isSmallCompany = userData.company_size === 'micro' || userData.company_size === 'pequena';
      const focusRevenue = userData.main_goal?.includes('receita') || userData.main_goal?.includes('vendas');
      const focusOperational = userData.main_goal?.includes('operacional') || userData.main_goal?.includes('processo');
      
      let prioritizedSolutions = solutions.slice();
      
      // Lógica de priorização baseada no perfil
      prioritizedSolutions.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        
        // Priorizar por dificuldade para iniciantes
        if (isBeginnerAI) {
          if (a.difficulty === 'Iniciante') scoreA += 3;
          if (b.difficulty === 'Iniciante') scoreB += 3;
        }
        
        // Priorizar por categoria baseada no objetivo
        if (focusRevenue) {
          if (a.category === 'Receita') scoreA += 2;
          if (b.category === 'Receita') scoreB += 2;
        }
        
        if (focusOperational) {
          if (a.category === 'Operacional') scoreA += 2;
          if (b.category === 'Operacional') scoreB += 2;
        }
        
        return scoreB - scoreA;
      });
      
      aiGeneratedTrail = {
        priority1: prioritizedSolutions.slice(0, 3).map(s => ({
          solutionId: s.id,
          justification: `Ideal para ${userData.company_segment || 'seu negócio'} com foco em ${userData.main_goal || 'crescimento'}`
        })),
        priority2: prioritizedSolutions.slice(3, 6).map(s => ({
          solutionId: s.id,
          justification: `Complementa sua estratégia de IA para ${userData.company_size || 'empresa'}`
        })),
        priority3: prioritizedSolutions.slice(6, 8).map(s => ({
          solutionId: s.id,
          justification: `Recurso adicional para otimizar resultados`
        })),
        recommended_lessons: availableLessons.slice(0, 3).map((lesson, index) => ({
          lessonId: lesson.id,
          moduleId: lesson.learning_modules?.id,
          courseId: lesson.learning_modules?.learning_courses?.id,
          justification: 'Aula complementar para implementação',
          priority: index + 1
        }))
      };
    }

    // 7. Salvar trilha no banco
    const { data: existingTrail } = await supabase
      .from('implementation_trails')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (existingTrail) {
      // Atualizar trilha existente
      const { error: updateError } = await supabase
        .from('implementation_trails')
        .update({
          trail_data: aiGeneratedTrail,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);

      if (updateError) {
        console.error('❌ Erro ao atualizar trilha:', updateError);
        throw updateError;
      }
    } else {
      // Criar nova trilha
      const { error: insertError } = await supabase
        .from('implementation_trails')
        .insert({
          user_id: user_id,
          trail_data: aiGeneratedTrail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Erro ao criar trilha:', insertError);
        throw insertError;
      }
    }

    console.log('✅ Trilha inteligente gerada e salva com sucesso!');

    return new Response(
      JSON.stringify({
        success: true,
        trail_data: aiGeneratedTrail,
        user_profile: {
          name: userData.name || profile.name,
          company: userData.company_name,
          role: userRole,
          ai_level: userData.ai_knowledge_level
        },
        stats: {
          solutions_analyzed: solutions.length,
          lessons_available: availableLessons.length,
          ai_powered: !!openaiApiKey,
          recommendations: {
            priority1: aiGeneratedTrail.priority1?.length || 0,
            priority2: aiGeneratedTrail.priority2?.length || 0,
            priority3: aiGeneratedTrail.priority3?.length || 0,
            lessons: aiGeneratedTrail.recommended_lessons?.length || 0
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na geração da trilha:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor',
        details: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
