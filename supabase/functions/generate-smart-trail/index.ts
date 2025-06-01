
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Iniciando geração inteligente da trilha')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { user_id } = await req.json()
    
    if (!user_id) {
      console.error('❌ user_id não fornecido')
      return new Response(
        JSON.stringify({ success: false, error: 'user_id é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('👤 User ID:', user_id)

    // 1. Buscar perfil do usuário (primeiro onboarding_final, depois quick_onboarding, depois onboarding)
    console.log('📊 Buscando perfil do usuário...')
    
    let userProfile = null;
    
    // Primeira tentativa: onboarding_final
    const { data: finalOnboarding, error: finalError } = await supabaseClient
      .from('onboarding_final')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_completed', true)
      .single()

    if (finalOnboarding && !finalError) {
      console.log('✅ Encontrado onboarding_final completo')
      userProfile = {
        company_name: finalOnboarding.company_name,
        company_size: finalOnboarding.company_size,
        company_segment: finalOnboarding.company_sector,
        ai_knowledge_level: finalOnboarding.ai_knowledge_level,
        main_goal: finalOnboarding.main_goal,
        role: 'member',
        annual_revenue_range: finalOnboarding.annual_revenue
      }
    } else {
      console.log('⚠️ onboarding_final não encontrado, tentando quick_onboarding...')
      
      // Segunda tentativa: quick_onboarding
      const { data: quickOnboarding, error: quickError } = await supabaseClient
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_completed', true)
        .single()

      if (quickOnboarding && !quickError) {
        console.log('✅ Encontrado quick_onboarding completo')
        userProfile = {
          company_name: quickOnboarding.company_name,
          company_size: quickOnboarding.company_size,
          company_segment: quickOnboarding.company_segment,
          ai_knowledge_level: quickOnboarding.ai_knowledge_level,
          main_goal: quickOnboarding.main_goal,
          role: 'member',
          annual_revenue_range: quickOnboarding.annual_revenue_range
        }
      } else {
        console.log('⚠️ quick_onboarding não encontrado, tentando onboarding legacy...')
        
        // Terceira tentativa: onboarding legacy
        const { data: legacyOnboarding, error: legacyError } = await supabaseClient
          .from('onboarding')
          .select('*')
          .eq('user_id', user_id)
          .eq('is_completed', true)
          .single()

        if (legacyOnboarding && !legacyError) {
          console.log('✅ Encontrado onboarding legacy completo')
          userProfile = {
            company_name: legacyOnboarding.company_name,
            company_size: legacyOnboarding.company_size,
            company_segment: legacyOnboarding.company_sector,
            ai_knowledge_level: legacyOnboarding.knowledge_level,
            main_goal: legacyOnboarding.primary_goal,
            role: 'member',
            annual_revenue_range: legacyOnboarding.annual_revenue
          }
        }
      }
    }

    if (!userProfile) {
      console.error('❌ Nenhum onboarding completo encontrado para o usuário')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não possui onboarding completo. Complete seu onboarding primeiro.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('👤 Perfil do usuário:', userProfile)

    // 2. Buscar soluções disponíveis
    console.log('🔍 Buscando soluções disponíveis...')
    const { data: solutions, error: solutionsError } = await supabaseClient
      .from('solutions')
      .select('*')
      .eq('published', true)

    if (solutionsError) {
      console.error('❌ Erro ao buscar soluções:', solutionsError)
      throw new Error(`Erro ao buscar soluções: ${solutionsError.message}`)
    }

    // 3. Buscar aulas disponíveis
    console.log('📚 Buscando aulas disponíveis...')
    const { data: lessons, error: lessonsError } = await supabaseClient
      .from('learning_lessons')
      .select(`
        *,
        module:learning_modules!inner(
          id,
          title,
          course:learning_courses!inner(
            id,
            title,
            published
          )
        )
      `)
      .eq('published', true)
      .eq('module.course.published', true)

    if (lessonsError) {
      console.error('❌ Erro ao buscar aulas:', lessonsError)
      throw new Error(`Erro ao buscar aulas: ${lessonsError.message}`)
    }

    console.log(`✅ Encontradas ${solutions?.length || 0} soluções e ${lessons?.length || 0} aulas`)

    // 4. Gerar trilha inteligente baseada no perfil
    const trail = generateSmartTrail(userProfile, solutions || [], lessons || [])

    console.log('🎯 Trilha gerada:', {
      priority1_count: trail.priority1.length,
      priority2_count: trail.priority2.length,
      priority3_count: trail.priority3.length,
      lessons_count: trail.recommended_lessons?.length || 0
    })

    // 5. Salvar trilha no banco usando upsert
    console.log('💾 Salvando trilha com upsert...')
    const { data: savedTrail, error: saveError } = await supabaseClient
      .from('implementation_trails')
      .upsert(
        {
          user_id: user_id,
          trail_data: trail,
          status: 'completed',
          generation_attempts: 1,
          error_message: null
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (saveError) {
      console.error('❌ Erro ao salvar trilha:', saveError)
      throw new Error(`Erro ao salvar trilha: ${saveError.message}`)
    }

    console.log('✅ Trilha salva com sucesso:', savedTrail?.id)

    return new Response(
      JSON.stringify({
        success: true,
        trail_data: trail,
        trail_id: savedTrail?.id,
        message: 'Trilha gerada com sucesso!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro na geração da trilha:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateSmartTrail(userProfile: any, solutions: any[], lessons: any[]) {
  console.log('🤖 Gerando trilha inteligente...')
  
  // Filtros baseados no perfil
  const isBeginnerLevel = ['iniciante', 'beginner', 'básico'].includes(userProfile.ai_knowledge_level?.toLowerCase() || '')
  const isRevenueGoal = ['aumentar-receita', 'receita', 'vendas'].includes(userProfile.main_goal?.toLowerCase() || '')
  const isSmallCompany = ['1-5', '6-10', 'pequena'].includes(userProfile.company_size?.toLowerCase() || '')

  // Priorizar soluções baseadas no perfil
  const prioritizedSolutions = solutions
    .filter(solution => solution.published)
    .map(solution => {
      let priority = 3 // Prioridade baixa por padrão
      let justification = 'Solução relevante para seu perfil.'

      // Lógica de priorização
      if (isRevenueGoal && solution.category === 'Receita') {
        priority = 1
        justification = 'Alinhada com seu objetivo de aumentar receita.'
      } else if (isBeginnerLevel && solution.difficulty === 'Fácil') {
        priority = Math.min(priority, 2)
        justification = 'Adequada para seu nível de conhecimento em IA.'
      } else if (isSmallCompany && solution.title.toLowerCase().includes('pequen')) {
        priority = Math.min(priority, 2)
        justification = 'Ideal para empresas de pequeno porte.'
      }

      return {
        solutionId: solution.id,
        justification,
        priority,
        ...solution
      }
    })
    .sort((a, b) => a.priority - b.priority)

  // Distribuir soluções por prioridade
  const priority1 = prioritizedSolutions.filter(s => s.priority === 1).slice(0, 3)
  const priority2 = prioritizedSolutions.filter(s => s.priority === 2).slice(0, 2)
  const priority3 = prioritizedSolutions.filter(s => s.priority === 3).slice(0, 2)

  // Selecionar aulas recomendadas
  const recommendedLessons = lessons
    .filter(lesson => lesson.published && lesson.module?.course?.published)
    .slice(0, 5)
    .map(lesson => ({
      lessonId: lesson.id,
      moduleId: lesson.module_id,
      courseId: lesson.module.course.id,
      justification: `Aula recomendada para ${isBeginnerLevel ? 'iniciantes' : 'seu nível'} em IA.`,
      priority: isBeginnerLevel && lesson.difficulty_level === 'beginner' ? 1 : 2,
      title: lesson.title,
      moduleTitle: lesson.module.title,
      courseTitle: lesson.module.course.title
    }))

  return {
    priority1: priority1.map(s => ({
      solutionId: s.solutionId,
      justification: s.justification
    })),
    priority2: priority2.map(s => ({
      solutionId: s.solutionId,
      justification: s.justification
    })),
    priority3: priority3.map(s => ({
      solutionId: s.solutionId,
      justification: s.justification
    })),
    recommended_lessons: recommendedLessons
  }
}
