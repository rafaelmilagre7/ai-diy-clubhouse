
import { supabase } from '@/lib/supabase';
import { OnboardingProgress } from '@/types/onboarding';

/**
 * Gera uma trilha personalizada baseada nos dados do onboarding
 * @param onboardingData Dados do onboarding do usuário
 * @returns Trilha personalizada gerada
 */
export async function generateTrail(onboardingData: OnboardingProgress): Promise<any[]> {
  try {
    console.log("Iniciando geração de trilha personalizada", { userId: onboardingData.user_id });
    
    // Implementação simplificada para gerar uma trilha básica
    // Em uma implementação real, usaríamos algoritmos de personalização baseados nos dados de onboarding
    
    // Buscar soluções disponíveis
    const { data: solutions, error } = await supabase
      .from('solutions')
      .select('*')
      .limit(10);
      
    if (error) {
      console.error("Erro ao buscar soluções:", error);
      throw new Error("Falha ao buscar soluções para a trilha");
    }
    
    if (!solutions || solutions.length === 0) {
      console.warn("Nenhuma solução encontrada para gerar trilha");
      return [];
    }
    
    // Personalizar baseado em dados do onboarding
    const businessGoals = onboardingData.business_goals || {};
    const aiExperience = onboardingData.ai_experience || {};
    
    // Extrair preferências e obter soluções relevantes
    const primaryGoal = businessGoals.primary_goal || '';
    const experienceLevel = aiExperience.knowledge_level || 'iniciante';
    
    // Aplicar regras de personalização
    const trail = solutions.map((solution: any, index: number) => ({
      ...solution,
      priority: index < 3 ? 1 : index < 6 ? 2 : 3
    }));
    
    // Salvar a trilha gerada (opcional)
    await saveGeneratedTrail(onboardingData.user_id, trail);
    
    return trail;
  } catch (error) {
    console.error("Erro ao gerar trilha:", error);
    throw error;
  }
}

/**
 * Salva a trilha gerada no banco de dados
 */
async function saveGeneratedTrail(userId: string, trail: any[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_trails')
      .upsert({
        user_id: userId,
        trail: trail,
        created_at: new Date(),
      });
      
    if (error) {
      console.error("Erro ao salvar trilha gerada:", error);
    }
  } catch (error) {
    console.error("Exceção ao salvar trilha gerada:", error);
  }
}
