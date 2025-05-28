
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
    console.log('=== INÍCIO DA GERAÇÃO DA TRILHA ===')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('Configurando cliente Supabase com URL:', supabaseUrl)
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const requestData = await req.json()
    console.log('Dados recebidos:', JSON.stringify(requestData, null, 2))
    
    const { user_id, onboarding_data } = requestData
    
    if (!user_id) {
      throw new Error('user_id é obrigatório')
    }
    
    console.log('=== BUSCANDO DADOS DE ONBOARDING ===')
    
    // Buscar dados do quick_onboarding se não fornecidos
    let userData = onboarding_data
    if (!userData) {
      console.log('Buscando dados do quick_onboarding para user_id:', user_id)
      
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user_id)
        .single()
      
      if (quickError) {
        console.error('Erro ao buscar quick_onboarding:', quickError)
        throw new Error(`Erro ao buscar dados de onboarding: ${quickError.message}`)
      }
      
      if (!quickData) {
        throw new Error('Nenhum dado de onboarding encontrado para este usuário')
      }
      
      console.log('Dados do quick_onboarding encontrados:', JSON.stringify(quickData, null, 2))
      
      // Mapear dados do quick_onboarding para o formato esperado
      userData = {
        personal_info: {
          name: quickData.name || '',
          email: quickData.email || ''
        },
        professional_info: {
          company_name: quickData.company_name || '',
          role: quickData.role || '',
          company_size: quickData.company_size || '',
          company_segment: quickData.company_segment || '',
          annual_revenue_range: quickData.annual_revenue_range || ''
        },
        ai_experience: {
          knowledge_level: quickData.ai_knowledge_level || '',
          uses_ai: quickData.uses_ai || '',
          main_goal: quickData.main_goal || ''
        }
      }
    }
    
    console.log('=== DADOS ESTRUTURADOS PARA ANÁLISE ===')
    console.log('UserData estruturado:', JSON.stringify(userData, null, 2))
    
    // Validar dados essenciais
    if (!userData.professional_info?.company_name) {
      throw new Error('Nome da empresa é obrigatório para gerar a trilha')
    }
    
    if (!userData.ai_experience?.knowledge_level) {
      throw new Error('Nível de conhecimento em IA é obrigatório para gerar a trilha')
    }
    
    console.log('=== BUSCANDO SOLUÇÕES DISPONÍVEIS ===')
    
    // Buscar soluções disponíveis
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('*')
      .eq('published', true)
    
    if (solutionsError) {
      console.error('Erro ao buscar soluções:', solutionsError)
      throw new Error(`Erro ao buscar soluções: ${solutionsError.message}`)
    }
    
    console.log('Soluções encontradas:', solutions?.length || 0)
    
    if (!solutions || solutions.length === 0) {
      throw new Error('Nenhuma solução publicada encontrada')
    }
    
    console.log('=== GERANDO TRILHA BASEADA NO PERFIL ===')
    
    // Lógica de geração da trilha baseada no perfil do usuário
    const companySize = userData.professional_info.company_size
    const knowledgeLevel = userData.ai_experience.knowledge_level
    const mainGoal = userData.ai_experience.main_goal
    const segment = userData.professional_info.company_segment
    
    console.log('Critérios de análise:', {
      companySize,
      knowledgeLevel,
      mainGoal,
      segment
    })
    
    // Algoritmo de priorização das soluções
    const prioritizedSolutions = solutions.map(solution => {
      let score = 0
      let justification = ''
      
      // Pontuação baseada no objetivo principal
      if (mainGoal === 'aumentar-receita' && solution.category === 'revenue') {
        score += 30
        justification += 'Alinhada com objetivo de aumentar receita. '
      } else if (mainGoal === 'reduzir-custos' && solution.category === 'operational') {
        score += 30
        justification += 'Foca em eficiência operacional. '
      } else if (mainGoal === 'automatizar-processos' && solution.category === 'operational') {
        score += 25
        justification += 'Ideal para automação de processos. '
      }
      
      // Pontuação baseada no nível de conhecimento
      if (knowledgeLevel === 'iniciante' && solution.difficulty === 'easy') {
        score += 20
        justification += 'Adequada para iniciantes. '
      } else if (knowledgeLevel === 'intermediario' && solution.difficulty === 'medium') {
        score += 20
        justification += 'Desafio adequado para nível intermediário. '
      } else if (knowledgeLevel === 'avancado' && solution.difficulty === 'advanced') {
        score += 15
        justification += 'Aproveita conhecimento avançado. '
      }
      
      // Pontuação baseada no tamanho da empresa
      if (companySize === '1-5' && solution.difficulty === 'easy') {
        score += 15
        justification += 'Ideal para empresas pequenas. '
      } else if (companySize === '6-20' && solution.difficulty === 'medium') {
        score += 15
        justification += 'Adequada para empresas em crescimento. '
      } else if (['21-50', '51-200', '200+'].includes(companySize) && solution.difficulty === 'advanced') {
        score += 10
        justification += 'Recursos para implementação complexa. '
      }
      
      // Pontuação baseada no segmento
      if (segment === 'inteligencia-artificial' && solution.category === 'strategy') {
        score += 10
        justification += 'Estratégica para setor de IA. '
      }
      
      return {
        solutionId: solution.id,
        score,
        justification: justification.trim() || 'Recomendação personalizada para seu perfil de negócio.',
        solution
      }
    })
    
    // Ordenar por pontuação
    prioritizedSolutions.sort((a, b) => b.score - a.score)
    
    console.log('Soluções priorizadas:', prioritizedSolutions.map(s => ({ 
      id: s.solutionId, 
      score: s.score, 
      title: s.solution.title 
    })))
    
    // Dividir em prioridades
    const totalSolutions = prioritizedSolutions.length
    const priority1Count = Math.min(3, Math.ceil(totalSolutions * 0.3))
    const priority2Count = Math.min(3, Math.ceil(totalSolutions * 0.4))
    const priority3Count = Math.min(3, Math.ceil(totalSolutions * 0.3))
    
    const trail = {
      priority1: prioritizedSolutions.slice(0, priority1Count).map(s => ({
        solutionId: s.solutionId,
        justification: s.justification
      })),
      priority2: prioritizedSolutions.slice(priority1Count, priority1Count + priority2Count).map(s => ({
        solutionId: s.solutionId,
        justification: s.justification
      })),
      priority3: prioritizedSolutions.slice(priority1Count + priority2Count, priority1Count + priority2Count + priority3Count).map(s => ({
        solutionId: s.solutionId,
        justification: s.justification
      })),
      recommended_courses: [],
      recommended_lessons: []
    }
    
    console.log('=== TRILHA GERADA ===')
    console.log('Trilha completa:', JSON.stringify(trail, null, 2))
    
    console.log('=== SALVANDO TRILHA NO BANCO ===')
    
    // Salvar a trilha no banco
    const { data: existingTrail } = await supabase
      .from('implementation_trails')
      .select('id')
      .eq('user_id', user_id)
      .single()
    
    if (existingTrail) {
      console.log('Atualizando trilha existente:', existingTrail.id)
      const { error: updateError } = await supabase
        .from('implementation_trails')
        .update({
          trail_data: trail,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTrail.id)
      
      if (updateError) {
        console.error('Erro ao atualizar trilha:', updateError)
        throw new Error(`Erro ao atualizar trilha: ${updateError.message}`)
      }
    } else {
      console.log('Criando nova trilha')
      const { error: insertError } = await supabase
        .from('implementation_trails')
        .insert({
          user_id: user_id,
          trail_data: trail,
          status: 'completed'
        })
      
      if (insertError) {
        console.error('Erro ao inserir trilha:', insertError)
        throw new Error(`Erro ao inserir trilha: ${insertError.message}`)
      }
    }
    
    console.log('=== TRILHA SALVA COM SUCESSO ===')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        trail_data: trail,
        message: 'Trilha gerada com sucesso'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('=== ERRO NA GERAÇÃO DA TRILHA ===')
    console.error('Erro completo:', error)
    console.error('Stack trace:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Verifique os logs da edge function para mais detalhes'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
