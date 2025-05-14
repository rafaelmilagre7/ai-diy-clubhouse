
/**
 * Função de navegação após completar uma etapa
 * Determina qual é a próxima etapa com base no ID da etapa atual
 */
export function navigateAfterStep(
  stepId: string, 
  currentStepIndex: number, 
  navigate: (path: string) => void, 
  shouldNavigate: boolean = true,
  onboardingType: 'club' | 'formacao' = 'club'
) {
  console.log(`[stepNavigator] Navegando após etapa ${stepId} (índice ${currentStepIndex}) - tipo ${onboardingType}`);
  
  if (!shouldNavigate) {
    console.log("[stepNavigator] Navegação automática desativada");
    return;
  }
  
  // Mapeamento de etapas para rotas (caminho completo)
  const stepIdToPath: Record<string, string> = {
    // Rotas para Club
    personal_info: "/onboarding/personal-info",
    professional_info: "/onboarding/professional-data",
    professional_data: "/onboarding/professional-data", // Alias para compatibilidade
    business_context: "/onboarding/business-context",
    ai_experience: "/onboarding/ai-experience",
    business_goals: "/onboarding/club-goals",
    experience_personalization: "/onboarding/customization",
    complementary_info: "/onboarding/complementary",
    review: "/onboarding/review",
    trail_generation: "/onboarding/trail-generation",
    
    // Rotas para Formação
    formation_personal: "/onboarding/formacao/personal-info",
    formation_ai_experience: "/onboarding/formacao/ai-experience",
    formation_goals: "/onboarding/formacao/goals",
    formation_preferences: "/onboarding/formacao/preferences",
    formation_review: "/onboarding/formacao/review"
  };
  
  // Sequência de etapas para cada tipo de onboarding
  const stepSequence = {
    club: [
      "personal_info",
      "professional_info",
      "business_context",
      "ai_experience",
      "business_goals", 
      "experience_personalization",
      "complementary_info",
      "review",
      "trail_generation"
    ],
    formacao: [
      "formation_personal",
      "formation_ai_experience",
      "formation_goals",
      "formation_preferences",
      "formation_review"
    ]
  };
  
  // Selecionar a sequência correta com base no tipo de onboarding
  const sequence = stepSequence[onboardingType];
  
  // Encontrar o índice da etapa atual na sequência
  const currentStepSequenceIndex = sequence.indexOf(stepId);
  
  if (currentStepSequenceIndex === -1) {
    console.warn(`[stepNavigator] Etapa ${stepId} não encontrada na sequência de ${onboardingType}`);
    
    // Log completo para ajudar no debug
    console.log("[stepNavigator] Sequência completa:", sequence);
    console.log("[stepNavigator] Mapeamento de rotas:", stepIdToPath);
    
    // Tratamento especial para aliases conhecidos
    if (stepId === "professional_data") {
      console.log("[stepNavigator] Convertendo alias professional_data para professional_info");
      const path = stepIdToPath["professional_info"];
      console.log(`[stepNavigator] Navegando para ${path}`);
      navigate(path);
      return;
    }
    
    // Fallback para a primeira etapa
    console.log(`[stepNavigator] Fallback para a primeira etapa: ${sequence[0]}`);
    navigate(stepIdToPath[sequence[0]]);
    return;
  }
  
  // Verificar se é a última etapa
  if (currentStepSequenceIndex === sequence.length - 1) {
    console.log("[stepNavigator] Esta é a última etapa, não navegando automaticamente");
    return;
  }
  
  // Obter o ID da próxima etapa na sequência
  const nextStepId = sequence[currentStepSequenceIndex + 1];
  const nextPath = stepIdToPath[nextStepId];
  
  if (!nextPath) {
    console.warn(`[stepNavigator] Caminho para próxima etapa ${nextStepId} não encontrado`);
    console.log("[stepNavigator] Mapeamento completo:", stepIdToPath);
    return;
  }
  
  console.log(`[stepNavigator] Navegando para próxima etapa: ${nextStepId} (${nextPath})`);
  
  // Usar timeout para dar tempo de completar qualquer processamento pendente
  setTimeout(() => {
    navigate(nextPath);
  }, 100);
}
