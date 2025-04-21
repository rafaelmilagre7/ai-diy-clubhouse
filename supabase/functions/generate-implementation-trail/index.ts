
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

interface ImplementationRecommendation {
  solutionId: string;
  justification: string;
}

interface ImplementationTrail {
  priority1: ImplementationRecommendation[];
  priority2: ImplementationRecommendation[];
  priority3: ImplementationRecommendation[];
}

serve(async (req) => {
  try {
    // Obter dados da requisição
    const { onboardingData } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autorização necessária' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Configurar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Obter dados das soluções disponíveis
    const { data: solutions, error: solutionsError } = await supabaseClient
      .from('solutions')
      .select('*')
      .eq('published', true);
    
    if (solutionsError) {
      throw new Error(`Erro ao buscar soluções: ${solutionsError.message}`);
    }
    
    if (!solutions || solutions.length === 0) {
      throw new Error('Nenhuma solução disponível para recomendação');
    }
    
    // Em um sistema real, aqui teríamos um algoritmo mais sofisticado para
    // personalizar as recomendações com base nos dados do onboarding.
    // Por enquanto, vamos usar um algoritmo simples para demonstração.
    
    // Distribuir soluções por prioridade (simplificado)
    const priority1: ImplementationRecommendation[] = [];
    const priority2: ImplementationRecommendation[] = [];
    const priority3: ImplementationRecommendation[] = [];
    
    // Distribuir soluções por categorias - exemplo simples
    solutions.forEach((solution, index) => {
      const recommendation: ImplementationRecommendation = {
        solutionId: solution.id,
        justification: `Esta solução foi selecionada com base no seu perfil e objetivos de negócio.`
      };
      
      if (index < 2) {
        priority1.push(recommendation);
      } else if (index < 5) {
        priority2.push(recommendation);
      } else if (index < 7) {
        priority3.push(recommendation);
      }
    });
    
    // Criar objeto de resposta
    const recommendations: ImplementationTrail = {
      priority1,
      priority2,
      priority3
    };
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Erro na geração da trilha:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});
