
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()
    console.log('🚀 Iniciando geração inteligente da trilha')

    if (!user_id) {
      throw new Error('user_id é obrigatório')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar perfil do usuário
    console.log('📊 Buscando perfil do usuário...')
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    const { data: quickOnboarding } = await supabase
      .from('quick_onboarding')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const userProfile = {
      company_name: quickOnboarding?.company_name || profile?.company_name,
      company_size: quickOnboarding?.company_size || '1-5',
      company_segment: quickOnboarding?.company_segment || 'geral',
      ai_knowledge_level: quickOnboarding?.ai_knowledge_level || 'iniciante',
      main_goal: quickOnboarding?.main_goal || 'aumentar-receita',
      role: profile?.role || 'member',
      annual_revenue_range: quickOnboarding?.annual_revenue_range || '0-100k'
    }

    console.log('👤 Perfil do usuário:', userProfile)

    // Buscar soluções disponíveis
    console.log('🔍 Buscando soluções disponíveis...')
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('id, title, description, category, difficulty, tags')
      .eq('published', true)

    if (solutionsError) {
      console.error('❌ Erro ao buscar soluções:', solutionsError)
      throw new Error('Erro ao buscar soluções')
    }

    // Buscar aulas disponíveis
    console.log('📚 Buscando aulas disponíveis...')
    const { data: lessons, error: lessonsError } = await supabase
      .from('learning_lessons')
      .select(`
        id, title, description, estimated_time_minutes, difficulty_level, cover_image_url,
        learning_modules!inner(
          id, title,
          learning_courses!inner(id, title, published)
        )
      `)
      .eq('published', true)
      .eq('learning_modules.learning_courses.published', true)

    if (lessonsError) {
      console.error('❌ Erro ao buscar aulas:', lessonsError)
      throw new Error('Erro ao buscar aulas')
    }

    console.log(`✅ Encontradas ${solutions?.length || 0} soluções e ${lessons?.length || 0} aulas`)

    // Gerar trilha inteligente
    const trail = generateSmartTrail(userProfile, solutions || [], lessons || [])
    
    console.log('🎯 Trilha gerada:', {
      priority1_count: trail.priority1?.length || 0,
      priority2_count: trail.priority2?.length || 0,
      priority3_count: trail.priority3?.length || 0,
      lessons_count: trail.recommended_lessons?.length || 0
    })

    // Salvar ou atualizar trilha usando upsert
    console.log('💾 Salvando trilha com upsert...')
    const { error: upsertError } = await supabase
      .from('implementation_trails')
      .upsert({
        user_id,
        trail_data: trail,
        status: 'completed',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })

    if (upsertError) {
      console.error('❌ Erro ao salvar trilha:', upsertError)
      throw new Error(`Erro ao salvar trilha: ${upsertError.message}`)
    }

    console.log('✅ Trilha salva com sucesso')

    return new Response(
      JSON.stringify({
        success: true,
        trail_data: trail,
        message: 'Trilha gerada com sucesso'
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

function generateSmartTrail(userProfile: any, solutions: any[], lessons: any[]) {
  // Filtrar soluções por relevância
  const relevantSolutions = solutions.filter(solution => {
    // Lógica de filtragem baseada no perfil
    if (userProfile.ai_knowledge_level === 'iniciante' && solution.difficulty === 'advanced') {
      return false
    }
    if (userProfile.ai_knowledge_level === 'especialista' && solution.difficulty === 'easy') {
      return false
    }
    return true
  })

  // Ordenar por relevância
  const sortedSolutions = relevantSolutions.sort((a, b) => {
    return calculateRelevanceScore(b, userProfile) - calculateRelevanceScore(a, userProfile)
  })

  // Filtrar e ordenar aulas por relevância
  const relevantLessons = lessons.filter(lesson => {
    if (userProfile.ai_knowledge_level === 'iniciante' && lesson.difficulty_level === 'advanced') {
      return false
    }
    if (userProfile.ai_knowledge_level === 'especialista' && lesson.difficulty_level === 'beginner') {
      return false
    }
    return true
  })

  const sortedLessons = relevantLessons.sort((a, b) => {
    return calculateLessonRelevanceScore(b, userProfile) - calculateLessonRelevanceScore(a, userProfile)
  })

  // Construir trilha
  const trail = {
    priority1: sortedSolutions.slice(0, 3).map(s => ({
      solutionId: s.id,
      justification: generateSolutionJustification(s, userProfile, 1),
      priority: 1
    })),
    priority2: sortedSolutions.slice(3, 5).map(s => ({
      solutionId: s.id,
      justification: generateSolutionJustification(s, userProfile, 2),
      priority: 2
    })),
    priority3: sortedSolutions.slice(5, 7).map(s => ({
      solutionId: s.id,
      justification: generateSolutionJustification(s, userProfile, 3),
      priority: 3
    })),
    recommended_lessons: sortedLessons.slice(0, 5).map((lesson, index) => ({
      lessonId: lesson.id,
      moduleId: lesson.learning_modules.id,
      courseId: lesson.learning_modules.learning_courses.id,
      justification: generateLessonJustification(lesson, userProfile),
      priority: index < 2 ? 1 : 2,
      title: lesson.title,
      moduleTitle: lesson.learning_modules.title,
      courseTitle: lesson.learning_modules.learning_courses.title
    }))
  }

  return trail
}

function calculateRelevanceScore(solution: any, userProfile: any): number {
  let score = 0

  // Pontuação por nível de conhecimento
  if (userProfile.ai_knowledge_level === 'iniciante' && solution.difficulty === 'easy') score += 3
  if (userProfile.ai_knowledge_level === 'intermediario' && solution.difficulty === 'medium') score += 3
  if (userProfile.ai_knowledge_level === 'especialista' && solution.difficulty === 'advanced') score += 3

  // Pontuação por objetivo principal
  if (userProfile.main_goal === 'aumentar-receita' && solution.category === 'Receita') score += 2
  if (userProfile.main_goal === 'reduzir-custos' && solution.category === 'Operacional') score += 2
  if (userProfile.main_goal === 'melhorar-processos' && solution.category === 'Operacional') score += 2

  // Pontuação por tamanho da empresa
  if (userProfile.company_size === '1-5' && solution.difficulty === 'easy') score += 1
  if (userProfile.company_size === '20+' && solution.difficulty === 'advanced') score += 1

  return score
}

function calculateLessonRelevanceScore(lesson: any, userProfile: any): number {
  let score = 0

  // Pontuação por nível de dificuldade
  if (userProfile.ai_knowledge_level === 'iniciante' && lesson.difficulty_level === 'beginner') score += 3
  if (userProfile.ai_knowledge_level === 'intermediario' && lesson.difficulty_level === 'intermediate') score += 3
  if (userProfile.ai_knowledge_level === 'especialista' && lesson.difficulty_level === 'advanced') score += 3

  // Pontuação por tempo estimado (preferir aulas mais curtas para iniciantes)
  if (userProfile.ai_knowledge_level === 'iniciante' && lesson.estimated_time_minutes <= 30) score += 1
  if (userProfile.ai_knowledge_level === 'especialista' && lesson.estimated_time_minutes > 30) score += 1

  return score
}

function generateSolutionJustification(solution: any, userProfile: any, priority: number): string {
  const reasons = []

  if (priority === 1) {
    reasons.push(`Ideal para ${userProfile.company_name || 'sua empresa'}`)
  }

  if (userProfile.ai_knowledge_level === 'iniciante' && solution.difficulty === 'easy') {
    reasons.push('perfeita para quem está começando')
  } else if (userProfile.ai_knowledge_level === 'especialista' && solution.difficulty === 'advanced') {
    reasons.push('adequada para seu nível avançado')
  }

  if (userProfile.main_goal === 'aumentar-receita' && solution.category === 'Receita') {
    reasons.push('focada em gerar receita')
  }

  return reasons.length > 0 ? reasons.join(', ') : `Recomendada para otimizar ${userProfile.main_goal}`
}

function generateLessonJustification(lesson: any, userProfile: any): string {
  const reasons = []

  if (userProfile.ai_knowledge_level === 'iniciante') {
    reasons.push('ideal para construir uma base sólida')
  } else if (userProfile.ai_knowledge_level === 'especialista') {
    reasons.push('aprofunda conhecimentos avançados')
  }

  if (lesson.estimated_time_minutes <= 20) {
    reasons.push('aula rápida e prática')
  } else if (lesson.estimated_time_minutes > 45) {
    reasons.push('conteúdo aprofundado e completo')
  }

  return reasons.length > 0 ? reasons.join(', ') : 'complementa perfeitamente suas soluções prioritárias'
}
