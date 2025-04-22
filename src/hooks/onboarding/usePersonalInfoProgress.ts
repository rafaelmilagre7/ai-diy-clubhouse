
// Hook para calcular índice do passo e porcentagem de progresso do onboarding pessoal
export function usePersonalInfoProgress() {
  // Este é o primeiro passo após o intro, index 0
  const personalStepIndex = 0;
  const totalSteps = 7;
  const progressPercentage = Math.round(((personalStepIndex + 1) / totalSteps) * 100);

  return {
    personalStepIndex,
    totalSteps,
    progressPercentage
  };
}
