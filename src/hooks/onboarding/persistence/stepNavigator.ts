
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
  console.log(`[DEBUG] Navegando após etapa ${stepId} (índice ${currentStepIndex}) - tipo ${onboardingType}`);
  
  if (!shouldNavigate) {
    console.log("[DEBUG] Navegação automática desativada");
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
      "review"
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
    console.warn(`[AVISO] Etapa ${stepId} não encontrada na sequência de ${onboardingType}`);
    // Fallback para a primeira etapa
    navigate(stepIdToPath[sequence[0]]);
    return;
  }
  
  // Verificar se é a última etapa
  if (currentStepSequenceIndex === sequence.length - 1) {
    console.log("[DEBUG] Esta é a última etapa, não navegando automaticamente");
    return;
  }
  
  // Obter o ID da próxima etapa na sequência
  const nextStepId = sequence[currentStepSequenceIndex + 1];
  const nextPath = stepIdToPath[nextStepId];
  
  if (!nextPath) {
    console.warn(`[AVISO] Caminho para próxima etapa ${nextStepId} não encontrado`);
    return;
  }
  
  console.log(`[DEBUG] Navegando para próxima etapa: ${nextStepId} (${nextPath})`);
  navigate(nextPath);
}
