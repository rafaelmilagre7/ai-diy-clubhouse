
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
  
  // Mapeamento simplificado para o onboarding NOVO
  const stepToRouteMappings = {
    'club': {
      'personal_info': '/onboarding/ai-experience',
      'ai_experience': '/onboarding/trail-generation',
      'trail_generation': '/onboarding/completed'
    },
    'formacao': {
      'personal_info': '/onboarding/ai-experience',
      'ai_experience': '/onboarding/formacao/goals',
      'formation_goals': '/onboarding/formacao/preferences',
      'formation_preferences': '/onboarding/formacao/review',
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
