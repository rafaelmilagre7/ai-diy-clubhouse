
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    // 🚫 NETWORKING PAUSADO - Fase 3 da cleanup
    // Esta Edge Function foi pausada como parte da reorganização do sistema de networking
    // Para reativar: remover este bloco e descomentar o código abaixo
    
    console.log('⏸️ Generate Networking Matches pausada - Fase 3 cleanup');
    
    const { target_user_id } = await req.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Geração de matches temporariamente pausada',
      total_matches_generated: 0,
      user_id: target_user_id || 'unknown',
      status: 'paused',
      phase: 'cleanup_phase_3',
      timestamp: new Date().toISOString(),
      note: 'Sistema sendo reorganizado - matches serão reativados em breve'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

    /* CÓDIGO ORIGINAL COMENTADO PARA ROLLBACK
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { target_user_id, force_regenerate = false } = await req.json()

    // Se não foi especificado um usuário, usar o usuário autenticado
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user && !target_user_id) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = target_user_id || user.id

    // Verificar se o usuário já tem matches do mês atual
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    if (!force_regenerate) {
      const { data: existingMatches } = await supabase
        .from('network_matches')
        .select('id')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .limit(1)

      if (existingMatches && existingMatches.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Matches já existem para este mês',
            total_matches_generated: 0 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Se force_regenerate = true, limpar matches existentes do mês atual
      await supabase
        .from('network_matches')
        .delete()
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
    }

    // Buscar o perfil do usuário
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: 'Perfil do usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar usuários elegíveis para matches (excluindo o próprio usuário)
    const { data: eligibleUsers } = await supabase
      .from('profiles')
      .select('id, name, email, company_name, industry, current_position, role, created_at')
      .neq('id', userId)
      .eq('available_for_networking', true)
      .not('name', 'is', null)
      .not('company_name', 'is', null)
      .order('created_at', { ascending: false })

    if (!eligibleUsers || eligibleUsers.length < 2) {
      return new Response(
        JSON.stringify({ 
          error: 'Não há usuários suficientes para gerar matches',
          total_matches_generated: 0
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalMatches = 0

    // Gerar 5 matches de clientes potenciais
    const customerCandidates = eligibleUsers
      .filter(u => u.role === 'member' || u.role === 'admin')
      .slice(0, 8) // Pegar mais candidatos para ter variedade

    for (let i = 0; i < Math.min(5, customerCandidates.length); i++) {
      const candidate = customerCandidates[i]
      const compatibilityScore = 65 + Math.floor(Math.random() * 30) // 65-95%
      
      const matchReason = generateMatchReason(userProfile, candidate, 'customer')
      const aiAnalysis = generateAiAnalysis(userProfile, candidate, 'customer')

      try {
        await supabase
          .from('network_matches')
          .insert({
            user_id: userId,
            matched_user_id: candidate.id,
            match_type: 'customer',
            compatibility_score: compatibilityScore,
            match_reason: matchReason,
            ai_analysis: aiAnalysis,
            month_year: currentMonth,
            status: 'pending'
          })

        totalMatches++
      } catch (error) {
        console.error('Erro ao inserir match de cliente:', error)
      }
    }

    // Gerar 3 matches de fornecedores potenciais
    const supplierCandidates = eligibleUsers
      .filter(u => u.role === 'formacao' || u.role === 'admin')
      .slice(0, 5) // Pegar mais candidatos para ter variedade

    for (let i = 0; i < Math.min(3, supplierCandidates.length); i++) {
      const candidate = supplierCandidates[i]
      const compatibilityScore = 70 + Math.floor(Math.random() * 25) // 70-95%
      
      const matchReason = generateMatchReason(userProfile, candidate, 'supplier')
      const aiAnalysis = generateAiAnalysis(userProfile, candidate, 'supplier')

      try {
        await supabase
          .from('network_matches')
          .insert({
            user_id: userId,
            matched_user_id: candidate.id,
            match_type: 'supplier',
            compatibility_score: compatibilityScore,
            match_reason: matchReason,
            ai_analysis: aiAnalysis,
            month_year: currentMonth,
            status: 'pending'
          })

        totalMatches++
      } catch (error) {
        console.error('Erro ao inserir match de fornecedor:', error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        total_matches_generated: totalMatches,
        user_id: userId,
        month: currentMonth
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    */

  } catch (error) {
    console.error('💥 Erro na Edge Function pausada:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Edge Function pausada durante cleanup',
      total_matches_generated: 0,
      status: 'paused',
      phase: 'cleanup_phase_3',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
})

// Funções auxiliares originais mantidas para rollback
function generateMatchReason(userProfile: any, candidate: any, matchType: 'customer' | 'supplier'): string {
  const userCompany = userProfile.company_name || 'sua empresa'
  const candidateCompany = candidate.company_name || 'empresa'
  const candidatePosition = candidate.current_position || 'profissional'
  const candidateIndustry = candidate.industry || 'diversos setores'

  if (matchType === 'customer') {
    const reasons = [
      `Potencial cliente identificado: ${candidateCompany} pode se beneficiar das soluções de IA oferecidas por ${userCompany}`,
      `Match baseado em compatibilidade de setor: ${candidatePosition} em ${candidateIndustry} demonstra necessidades alinhadas com sua expertise`,
      `Oportunidade de negócio: perfil de ${candidate.name} indica potencial para implementação de soluções de IA`,
      `Sinergia identificada: ${candidateCompany} possui características ideais para se tornar cliente de ${userCompany}`
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  } else {
    const reasons = [
      `Fornecedor especializado: ${candidate.name} possui expertise em ${candidateIndustry} que pode agregar valor ao seu negócio`,
      `Parceiro estratégico: ${candidateCompany} oferece serviços complementares que podem potencializar seus resultados`,
      `Especialista identificado: ${candidatePosition} demonstra conhecimento técnico relevante para suas necessidades`,
      `Consultoria especializada: perfil de ${candidate.name} indica capacidade de fornecer soluções personalizadas`
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }
}

function generateAiAnalysis(userProfile: any, candidate: any, matchType: 'customer' | 'supplier'): any {
  const strengths = [
    'Experiência complementar',
    'Perfil profissional alinhado',
    'Setor de atuação compatível',
    'Tamanho de empresa adequado',
    'Necessidades identificadas',
    'Potencial de crescimento'
  ]

  const opportunities = matchType === 'customer' 
    ? ['Implementação de IA', 'Automação de processos', 'Otimização operacional', 'Transformação digital']
    : ['Consultoria especializada', 'Serviços personalizados', 'Parceria estratégica', 'Conhecimento técnico']

  const recommendedApproach = matchType === 'customer'
    ? `Iniciar conversa apresentando casos de sucesso em ${candidate.industry || 'seu setor'} e como a IA pode resolver desafios específicos da posição de ${candidate.current_position || 'sua área'}`
    : `Apresentar desafios específicos do seu negócio e explorar como a expertise de ${candidate.name} em ${candidate.industry || 'sua área'} pode agregar valor`

  return {
    strengths: strengths.slice(0, 2 + Math.floor(Math.random() * 2)),
    opportunities: opportunities.slice(0, 2 + Math.floor(Math.random() * 2)),
    recommended_approach: recommendedApproach
  }
}
