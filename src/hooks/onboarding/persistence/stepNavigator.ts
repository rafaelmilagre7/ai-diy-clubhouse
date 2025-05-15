
export function navigateAfterStep(
  stepId: string,
  currentStepIndex: number,
  navigate: (path: string) => void,
  shouldNavigate: boolean = true,
  onboardingType: 'club' | 'formacao' = 'club'
): void {
  if (!shouldNavigate) {
    console.log("[DEBUG] Navegação desativada, ignorando");
    return;
  }
  
  // Mapeamento de etapas para rotas
  const stepToRouteMappings = {
    'club': {
      'personal': '/onboarding/professional-data',
      'personal_info': '/onboarding/professional-data',
      'professional_data': '/onboarding/business-context',
      'professional_info': '/onboarding/business-context',
      'business_context': '/onboarding/ai-experience',
      'ai_exp': '/onboarding/club-goals',
      'ai_experience': '/onboarding/club-goals',
      'business_goals': '/onboarding/customization',
      'experience_personalization': '/onboarding/complementary',
      'complementary': '/onboarding/review',
      'complementary_info': '/onboarding/review',
      'review': '/onboarding/trail-generation'
    },
    'formacao': {
      'personal': '/onboarding/professional-data',
      'personal_info': '/onboarding/professional-data',
      'professional_data': '/onboarding/ai-experience',
      'professional_info': '/onboarding/ai-experience',
      'ai_exp': '/onboarding/formation-goals',
      'ai_experience': '/onboarding/formation-goals',
      'formation_goals': '/onboarding/formation-preferences',
      'formation_preferences': '/onboarding/complementary',
      'complementary': '/onboarding/review',
      'complementary_info': '/onboarding/review',
      'review': '/learning'
    }
  };
  
  // Pegar o mapeamento certo com base no tipo de onboarding
  const mappings = stepToRouteMappings[onboardingType];
  
  // Verificar se há um caminho definido para este stepId
  const nextRoute = mappings[stepId as keyof typeof mappings];
  
  if (nextRoute) {
    console.log(`[DEBUG] Navegando para a próxima etapa: ${nextRoute}`);
    navigate(nextRoute);
  } else {
    console.warn(`[AVISO] Não há rota definida para a etapa ${stepId}, permanecendo na página atual`);
  }
}
