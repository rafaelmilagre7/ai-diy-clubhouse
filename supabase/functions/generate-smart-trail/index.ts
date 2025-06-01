
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OnboardingData {
  personal_info?: any;
  location_info?: any;
  business_info?: any;
  business_context?: any;
  goals_info?: any;
  ai_experience?: any;
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  annual_revenue?: string;
  main_goal?: string;
  ai_knowledge_level?: string;
}

interface Solution {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tags?: string[];
}

interface TrailSolution {
  solutionId: string;
  justification: string;
  priority?: number;
}

interface ImplementationTrail {
  priority1: TrailSolution[];
  priority2: TrailSolution[];
  priority3: TrailSolution[];
  recommended_courses?: any[];
  recommended_lessons?: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando geração inteligente da trilha');
    
    const { user_id } = await req.json();
    console.log('👤 User ID:', user_id);

    if (!user_id) {
      throw new Error('user_id é obrigatório');
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📊 Buscando perfil do usuário...');

    // Buscar dados de onboarding na tabela onboarding_final primeiro
    console.log('🔍 Buscando onboarding_final...');
    const { data: onboardingFinal, error: onboardingFinalError } = await supabase
      .from('onboarding_final')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_completed', true)
      .single();

    let onboardingData: OnboardingData | null = null;

    if (onboardingFinal && !onboardingFinalError) {
      console.log('✅ onboarding_final encontrado:', JSON.stringify(onboardingFinal, null, 2));
      
      // Extrair dados da estrutura aninhada do onboarding_final
      onboardingData = {
        personal_info: onboardingFinal.personal_info || {},
        location_info: onboardingFinal.location_info || {},
        business_info: onboardingFinal.business_info || {},
        business_context: onboardingFinal.business_context || {},
        goals_info: onboardingFinal.goals_info || {},
        ai_experience: onboardingFinal.ai_experience || {},
        // Dados diretos da tabela (se existirem)
        company_name: onboardingFinal.company_name || onboardingFinal.business_info?.company_name,
        company_size: onboardingFinal.company_size || onboardingFinal.business_info?.company_size,
        company_sector: onboardingFinal.company_sector || onboardingFinal.business_info?.company_sector,
        annual_revenue: onboardingFinal.annual_revenue || onboardingFinal.business_info?.annual_revenue,
        main_goal: onboardingFinal.main_goal || onboardingFinal.goals_info?.primary_goal,
        ai_knowledge_level: onboardingFinal.ai_knowledge_level || onboardingFinal.ai_experience?.ai_knowledge_level
      };
    } else {
      console.log('⚠️ onboarding_final não encontrado, tentando quick_onboarding...');
      
      // Fallback para quick_onboarding
      const { data: quickOnboarding, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_completed', true)
        .single();

      if (quickOnboarding && !quickError) {
        console.log('✅ quick_onboarding encontrado');
        onboardingData = {
          company_name: quickOnboarding.company_name,
          company_size: quickOnboarding.company_size,
          company_sector: quickOnboarding.company_segment,
          main_goal: quickOnboarding.main_goal,
          ai_knowledge_level: quickOnboarding.ai_knowledge_level
        };
      } else {
        console.log('⚠️ quick_onboarding não encontrado, tentando onboarding legacy...');
        
        // Fallback final para onboarding legacy
        const { data: legacyOnboarding, error: legacyError } = await supabase
          .from('onboarding')
          .select('*')
          .eq('user_id', user_id)
          .eq('is_completed', true)
          .single();

        if (legacyOnboarding && !legacyError) {
          console.log('✅ onboarding legacy encontrado');
          onboardingData = {
            company_name: legacyOnboarding.company_name,
            company_size: legacyOnboarding.company_size,
            company_sector: legacyOnboarding.company_sector,
            annual_revenue: legacyOnboarding.annual_revenue,
            main_goal: legacyOnboarding.primary_goal,
            ai_knowledge_level: legacyOnboarding.knowledge_level
          };
        }
      }
    }

    if (!onboardingData) {
      console.log('❌ Nenhum onboarding completo encontrado para o usuário');
      throw new Error('Onboarding não encontrado ou não concluído');
    }

    console.log('📈 Dados de onboarding processados:', JSON.stringify(onboardingData, null, 2));

    // Buscar soluções disponíveis
    console.log('🔍 Buscando soluções disponíveis...');
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('id, title, category, difficulty, tags')
      .eq('published', true);

    if (solutionsError || !solutions) {
      console.log('❌ Erro ao buscar soluções:', solutionsError);
      throw new Error('Erro ao buscar soluções disponíveis');
    }

    console.log(`✅ ${solutions.length} soluções encontradas`);

    // Algoritmo de recomendação inteligente
    function scoreAndRecommendSolutions(onboarding: OnboardingData, solutions: Solution[]): ImplementationTrail {
      console.log('🤖 Iniciando algoritmo de recomendação...');
      
      const recommendations: Array<{ solution: Solution; score: number; justification: string }> = [];

      for (const solution of solutions) {
        let score = 0;
        let justification = '';
        const reasons: string[] = [];

        // Pontuação baseada na categoria e objetivo principal
        const goal = onboarding.main_goal || onboarding.goals_info?.primary_goal;
        if (goal) {
          if (goal.includes('receita') || goal.includes('vendas')) {
            if (solution.category === 'Receita') {
              score += 40;
              reasons.push('alinhada com objetivo de aumentar receita');
            }
          }
          if (goal.includes('operacional') || goal.includes('processo')) {
            if (solution.category === 'Operacional') {
              score += 40;
              reasons.push('otimiza processos operacionais');
            }
          }
          if (goal.includes('estratégia') || goal.includes('planejamento')) {
            if (solution.category === 'Estratégia') {
              score += 40;
              reasons.push('apoia planejamento estratégico');
            }
          }
        }

        // Pontuação baseada na experiência em IA
        const aiLevel = onboarding.ai_knowledge_level || onboarding.ai_experience?.ai_knowledge_level;
        if (aiLevel) {
          if (aiLevel === 'beginner' || aiLevel === 'iniciante') {
            if (solution.difficulty === 'beginner') {
              score += 30;
              reasons.push('adequada para nível iniciante');
            }
          } else if (aiLevel === 'intermediate' || aiLevel === 'intermediário') {
            if (solution.difficulty === 'intermediate') {
              score += 30;
              reasons.push('ideal para nível intermediário');
            }
          } else if (aiLevel === 'advanced' || aiLevel === 'avançado') {
            if (solution.difficulty === 'advanced') {
              score += 30;
              reasons.push('desafia conhecimento avançado');
            }
          }
        }

        // Pontuação baseada no setor da empresa
        const sector = onboarding.company_sector || onboarding.business_info?.company_sector;
        if (sector && solution.tags) {
          const sectorLower = sector.toLowerCase();
          const matchingTags = solution.tags.filter(tag => 
            sectorLower.includes(tag.toLowerCase()) || 
            tag.toLowerCase().includes(sectorLower)
          );
          if (matchingTags.length > 0) {
            score += 20;
            reasons.push(`relevante para setor ${sector}`);
          }
        }

        // Pontuação baseada no tamanho da empresa
        const companySize = onboarding.company_size || onboarding.business_info?.company_size;
        if (companySize) {
          if (companySize.includes('pequena') || companySize.includes('startup')) {
            if (solution.tags?.some(tag => tag.toLowerCase().includes('startup') || tag.toLowerCase().includes('pequena'))) {
              score += 15;
              reasons.push('adequada para empresas pequenas');
            }
          } else if (companySize.includes('média') || companySize.includes('medium')) {
            if (solution.tags?.some(tag => tag.toLowerCase().includes('média') || tag.toLowerCase().includes('escala'))) {
              score += 15;
              reasons.push('ideal para empresas em crescimento');
            }
          }
        }

        // Pontuação base por categoria (diversificação)
        if (solution.category === 'Receita') score += 10;
        if (solution.category === 'Operacional') score += 8;
        if (solution.category === 'Estratégia') score += 6;

        justification = reasons.length > 0 ? reasons.join(', ') : 'Solução recomendada baseada no seu perfil';

        recommendations.push({ solution, score, justification });
      }

      // Ordenar por pontuação
      recommendations.sort((a, b) => b.score - a.score);

      console.log('📊 Top 10 recomendações:');
      recommendations.slice(0, 10).forEach((rec, idx) => {
        console.log(`${idx + 1}. ${rec.solution.title} (Score: ${rec.score}) - ${rec.justification}`);
      });

      // Dividir em prioridades
      const priority1: TrailSolution[] = recommendations.slice(0, 3).map(rec => ({
        solutionId: rec.solution.id,
        justification: rec.justification,
        priority: 1
      }));

      const priority2: TrailSolution[] = recommendations.slice(3, 6).map(rec => ({
        solutionId: rec.solution.id,
        justification: rec.justification,
        priority: 2
      }));

      const priority3: TrailSolution[] = recommendations.slice(6, 9).map(rec => ({
        solutionId: rec.solution.id,
        justification: rec.justification,
        priority: 3
      }));

      return {
        priority1,
        priority2,
        priority3,
        recommended_courses: [],
        recommended_lessons: []
      };
    }

    // Gerar recomendações
    const trail = scoreAndRecommendSolutions(onboardingData, solutions);
    console.log('✅ Trilha gerada com sucesso:', JSON.stringify(trail, null, 2));

    // Salvar trilha no banco usando upsert
    console.log('💾 Salvando trilha no banco...');
    const { data: savedTrail, error: saveError } = await supabase
      .from('implementation_trails')
      .upsert({
        user_id: user_id,
        trail_data: trail,
        status: 'completed',
        generation_attempts: 1
      }, { 
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (saveError) {
      console.log('❌ Erro ao salvar trilha:', saveError);
      throw new Error(`Erro ao salvar trilha: ${saveError.message}`);
    }

    console.log('✅ Trilha salva com sucesso:', savedTrail?.id);

    return new Response(
      JSON.stringify({
        success: true,
        trail_data: trail,
        message: 'Trilha personalizada gerada com sucesso!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.log('❌ Erro na edge function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Verifique os logs para mais detalhes'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
