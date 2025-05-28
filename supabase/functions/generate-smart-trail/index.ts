
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()
    
    if (!user_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'user_id é obrigatório' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('🚀 Iniciando geração inteligente da trilha')

    // Verificar se já existe uma trilha para o usuário
    const { data: existingTrail } = await supabaseClient
      .from('implementation_trails')
      .select('id, status, trail_data')
      .eq('user_id', user_id)
      .single()

    // Se já existe uma trilha válida, retornar ela
    if (existingTrail && existingTrail.status === 'completed' && existingTrail.trail_data) {
      console.log('✅ Trilha existente encontrada')
      return new Response(JSON.stringify({
        success: true,
        trail: existingTrail.trail_data,
        message: 'Trilha existente recuperada'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log('📊 Buscando perfil do usuário...')

    // Buscar dados do usuário (quick_onboarding e profiles)
    const { data: quickOnboarding } = await supabaseClient
      .from('quick_onboarding')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (!quickOnboarding && !profile) {
      throw new Error('Dados do usuário não encontrados')
    }

    // Consolidar dados do perfil
    const userProfile = {
      company_name: quickOnboarding?.company_name || profile?.company_name || '',
      company_size: quickOnboarding?.company_size || '',
      company_segment: quickOnboarding?.company_segment || '',
      ai_knowledge_level: quickOnboarding?.ai_knowledge_level || 'iniciante',
      main_goal: quickOnboarding?.main_goal || 'aumentar-receita',
      role: profile?.role || 'member',
      annual_revenue_range: quickOnboarding?.annual_revenue_range || ''
    }

    console.log('👤 Perfil do usuário:', userProfile)

    console.log('🔍 Buscando soluções disponíveis...')

    // Buscar soluções disponíveis
    const { data: solutions, error: solutionsError } = await supabaseClient
      .from('solutions')
      .select('id, title, category, difficulty, tags')
      .eq('published', true)

    if (solutionsError) {
      throw new Error(`Erro ao buscar soluções: ${solutionsError.message}`)
    }

    console.log('📚 Buscando aulas disponíveis...')

    // Buscar aulas disponíveis
    const { data: lessons, error: lessonsError } = await supabaseClient
      .from('learning_lessons')
      .select(`
        id, 
        title, 
        difficulty_level,
        estimated_time_minutes,
        module_id,
        learning_modules!inner(
          id,
          title,
          learning_courses!inner(
            id,
            title
          )
        )
      `)
      .eq('published', true)
      .eq('learning_modules.published', true)
      .eq('learning_modules.learning_courses.published', true)

    if (lessonsError) {
      console.warn('Erro ao buscar aulas:', lessonsError.message)
    }

    console.log(`✅ Encontradas ${solutions?.length || 0} soluções e ${lessons?.length || 0} aulas`)

    // Algoritmo simples de recomendação baseado no perfil
    const recommendedSolutions = solutions?.slice(0, 3).map(solution => ({
      solutionId: solution.id,
      justification: `Recomendado para ${userProfile.company_segment} com foco em ${userProfile.main_goal}`,
      priority: 1
    })) || []

    const recommendedLessons = lessons?.slice(0, 5).map((lesson, index) => ({
      lessonId: lesson.id,
      moduleId: lesson.module_id,
      courseId: lesson.learning_modules?.learning_courses?.id,
      justification: `Adequado para nível ${userProfile.ai_knowledge_level}`,
      priority: index + 1,
      title: lesson.title,
      moduleTitle: lesson.learning_modules?.title,
      courseTitle: lesson.learning_modules?.learning_courses?.title
    })) || []

    // Estrutura da trilha
    const trailData = {
      priority1: recommendedSolutions,
      priority2: [],
      priority3: [],
      recommended_lessons: recommendedLessons
    }

    console.log('🎯 Trilha gerada:', {
      priority1_count: trailData.priority1.length,
      priority2_count: trailData.priority2.length,
      priority3_count: trailData.priority3.length,
      lessons_count: trailData.recommended_lessons.length
    })

    console.log('💾 Salvando trilha...')

    // Salvar ou atualizar trilha
    let saveResult
    if (existingTrail) {
      // Atualizar trilha existente
      saveResult = await supabaseClient
        .from('implementation_trails')
        .update({
          trail_data: trailData,
          status: 'completed',
          updated_at: new Date().toISOString(),
          generation_attempts: (existingTrail as any).generation_attempts + 1
        })
        .eq('user_id', user_id)
        .select()
    } else {
      // Criar nova trilha
      saveResult = await supabaseClient
        .from('implementation_trails')
        .insert({
          user_id: user_id,
          trail_data: trailData,
          status: 'completed',
          generation_attempts: 1
        })
        .select()
    }

    if (saveResult.error) {
      console.error('❌ Erro ao salvar trilha:', saveResult.error)
      throw new Error(`Erro ao salvar trilha: ${saveResult.error.message}`)
    }

    console.log('✅ Trilha salva com sucesso!')

    return new Response(JSON.stringify({
      success: true,
      trail: trailData,
      message: 'Trilha gerada e salva com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Erro na geração da trilha:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
