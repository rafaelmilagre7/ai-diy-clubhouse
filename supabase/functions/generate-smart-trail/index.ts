
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()
    
    if (!user_id) {
      throw new Error('user_id é obrigatório')
    }

    console.log('🚀 Gerando trilha para usuário:', user_id)

    // Buscar dados do onboarding do usuário
    const { data: onboardingData, error: onboardingError } = await supabaseClient
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_completed', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (onboardingError) {
      console.error('❌ Erro ao buscar onboarding:', onboardingError)
      throw onboardingError
    }

    if (!onboardingData) {
      // Tentar buscar no quick_onboarding como fallback
      const { data: quickOnboarding, error: quickError } = await supabaseClient
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_completed', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (quickError || !quickOnboarding) {
        throw new Error('Onboarding não encontrado ou não concluído')
      }

      // Converter quick_onboarding para formato esperado
      const convertedData = {
        user_id,
        professional_info: {
          company_name: quickOnboarding.company_name,
          company_segment: quickOnboarding.company_segment,
          role: quickOnboarding.role
        },
        business_goals: {
          ai_knowledge_level: quickOnboarding.ai_knowledge_level
        },
        ai_experience: {
          knowledge_level: quickOnboarding.ai_knowledge_level
        }
      }
      
      return await generateTrailFromData(supabaseClient, user_id, convertedData)
    }

    return await generateTrailFromData(supabaseClient, user_id, onboardingData)

  } catch (error) {
    console.error('❌ Erro na edge function:', error)
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

async function generateTrailFromData(supabaseClient: any, user_id: string, onboardingData: any) {
  console.log('📊 Dados do onboarding:', onboardingData)

  // Buscar todas as soluções disponíveis
  const { data: solutions, error: solutionsError } = await supabaseClient
    .from('solutions')
    .select('*')
    .eq('published', true)

  if (solutionsError) {
    throw solutionsError
  }

  if (!solutions || solutions.length === 0) {
    throw new Error('Nenhuma solução disponível')
  }

  console.log('📋 Soluções encontradas:', solutions.length)

  // Analisar dados do usuário para personalização
  const companySize = onboardingData.professional_info?.company_size || onboardingData.company_size || 'pequena'
  const companySegment = onboardingData.professional_info?.company_segment || onboardingData.company_segment || 'geral'
  const aiKnowledge = onboardingData.ai_experience?.knowledge_level || onboardingData.ai_knowledge_level || 'iniciante'
  
  // Algoritmo de recomendação baseado no perfil
  const scoredSolutions = solutions.map(solution => {
    let score = 0
    
    // Pontuação baseada na categoria
    if (solution.category === 'Receita' && companySize !== 'grande') score += 3
    if (solution.category === 'Operacional') score += 2
    if (solution.category === 'Estratégia' && companySize === 'grande') score += 3
    
    // Pontuação baseada na dificuldade vs conhecimento
    if (solution.difficulty === 'beginner' && aiKnowledge === 'iniciante') score += 3
    if (solution.difficulty === 'intermediate' && aiKnowledge === 'intermediario') score += 3
    if (solution.difficulty === 'advanced' && aiKnowledge === 'avancado') score += 3
    
    // Pontuação baseada em tags relevantes
    if (solution.tags) {
      if (solution.tags.includes('automacao') && companySegment.includes('servico')) score += 2
      if (solution.tags.includes('vendas') && companySegment.includes('comercio')) score += 2
      if (solution.tags.includes('marketing')) score += 1
    }
    
    // Adicionar aleatoriedade para variedade
    score += Math.random() * 2
    
    return {
      ...solution,
      score,
      justification: generateJustification(solution, onboardingData)
    }
  })

  // Ordenar por pontuação e dividir em prioridades
  const sortedSolutions = scoredSolutions.sort((a, b) => b.score - a.score)
  
  const priority1 = sortedSolutions.slice(0, 3).map(s => ({
    solutionId: s.id,
    justification: s.justification
  }))
  
  const priority2 = sortedSolutions.slice(3, 6).map(s => ({
    solutionId: s.id,
    justification: s.justification
  }))
  
  const priority3 = sortedSolutions.slice(6, 9).map(s => ({
    solutionId: s.id,
    justification: s.justification
  }))

  // Buscar cursos recomendados baseados no nível de conhecimento
  const { data: courses } = await supabaseClient
    .from('learning_courses')
    .select('id, title')
    .eq('published', true)
    .limit(3)

  const recommendedCourses = courses?.map(course => ({
    courseId: course.id,
    justification: `Curso recomendado para fortalecer seus conhecimentos em IA`,
    priority: 1
  })) || []

  const trailData = {
    priority1,
    priority2,
    priority3,
    recommended_courses: recommendedCourses
  }

  console.log('✅ Trilha gerada:', trailData)

  // Verificar se já existe uma trilha para este usuário
  const { data: existingTrail } = await supabaseClient
    .from('implementation_trails')
    .select('id')
    .eq('user_id', user_id)
    .maybeSingle()

  if (existingTrail) {
    // Atualizar trilha existente
    const { error: updateError } = await supabaseClient
      .from('implementation_trails')
      .update({
        trail_data: trailData,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingTrail.id)

    if (updateError) {
      throw updateError
    }
  } else {
    // Criar nova trilha
    const { error: insertError } = await supabaseClient
      .from('implementation_trails')
      .insert({
        user_id,
        trail_data: trailData,
        status: 'completed'
      })

    if (insertError) {
      throw insertError
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      trail_data: trailData,
      message: 'Trilha personalizada gerada com sucesso!' 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

function generateJustification(solution: any, onboardingData: any): string {
  const companyName = onboardingData.professional_info?.company_name || onboardingData.company_name || 'sua empresa'
  const segment = onboardingData.professional_info?.company_segment || onboardingData.company_segment || 'seu setor'
  
  const justifications = [
    `Esta solução é ideal para ${companyName} porque pode otimizar processos em ${segment}`,
    `Baseado no seu perfil, esta implementação gerará resultados rápidos para ${companyName}`,
    `Solução recomendada para empresas como ${companyName} que buscam eficiência operacional`,
    `Esta ferramenta se alinha perfeitamente com os objetivos de crescimento de ${companyName}`,
    `Implementação estratégica que pode revolucionar os processos de ${companyName}`
  ]
  
  return justifications[Math.floor(Math.random() * justifications.length)]
}
