
// supabase/functions/generate-implementation-trail/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com a função Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Extrair token de autorização do cabeçalho
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Usuário não autenticado')
    }

    // Validar o token e obter usuário autenticado
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError)
      throw new Error('Usuário não autenticado')
    }

    // Obter payload e dados de onboarding
    const { onboardingData } = await req.json()
    console.log('Gerando trilha para usuário:', user.id)
    
    // Buscar dados completos do usuário se necessário
    const { data: onboardingProgress, error: progressError } = await supabaseAdmin
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (progressError) {
      console.error('Erro ao buscar progresso de onboarding:', progressError)
    }
    
    // Coletar todos os dados necessários para a recomendação
    const userData = {
      ...onboardingData,
      ...onboardingProgress
    }

    // Buscar soluções disponíveis
    const { data: solutions, error: solutionsError } = await supabaseAdmin
      .from('solutions')
      .select('id, title, description, category, difficulty, tags')
      .eq('published', true)
    
    if (solutionsError) {
      console.error('Erro ao buscar soluções:', solutionsError)
      throw new Error('Erro ao buscar soluções disponíveis')
    }
    
    // Pegar no máximo 3 soluções aleatórias por enquanto (mock)
    const getRandomSolutions = (arr: any[], count: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    }
    
    // Gerar recomendações em ordem de prioridade
    const priority1Solutions = getRandomSolutions(solutions, 2)
    const priority2Solutions = getRandomSolutions(
      solutions.filter(s => !priority1Solutions.find(p => p.id === s.id)), 
      2
    )
    const priority3Solutions = getRandomSolutions(
      solutions.filter(s => 
        !priority1Solutions.find(p => p.id === s.id) && 
        !priority2Solutions.find(p => p.id === s.id)
      ),
      2
    )
    
    // Construir objeto de recomendações
    const recommendations = {
      priority1: priority1Solutions.map(solution => ({
        solutionId: solution.id,
        justification: `Esta solução de ${solution.category} foi selecionada como alta prioridade baseada no seu perfil e nos seus objetivos de implementação de IA.`
      })),
      priority2: priority2Solutions.map(solution => ({
        solutionId: solution.id,
        justification: `Recomendamos esta solução como uma segunda etapa para complementar sua estratégia de implementação de IA.`
      })),
      priority3: priority3Solutions.map(solution => ({
        solutionId: solution.id,
        justification: `Esta solução adicional pode trazer benefícios complementares à sua estratégia de implementação de IA a longo prazo.`
      }))
    }
    
    // Salvar trilha gerada no banco de dados
    const { data: trail, error: trailError } = await supabaseAdmin
      .from('implementation_trails')
      .upsert({
        user_id: user.id,
        trail_data: recommendations,
        status: 'completed',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
    
    if (trailError) {
      console.error('Erro ao salvar trilha:', trailError)
      throw new Error('Erro ao salvar trilha gerada')
    }
    
    // Atualizar o status de onboarding como completo se ainda não estiver
    const { error: updateError } = await supabaseAdmin
      .from('onboarding_progress')
      .update({ is_completed: true })
      .eq('user_id', user.id)
    
    if (updateError) {
      console.warn('Erro ao atualizar status de onboarding:', updateError)
    }
    
    console.log('Trilha gerada com sucesso para usuário:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        message: 'Trilha de implementação gerada com sucesso!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro na geração da trilha:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Falha ao gerar trilha de implementação'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
