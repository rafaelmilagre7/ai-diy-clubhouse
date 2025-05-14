
import { toast } from "sonner";

/**
 * Navega para a próxima etapa após salvar os dados
 */
export const navigateAfterStep = (
  stepId: string,
  currentStepIndex: number,
  navigate: (path: string) => void,
  shouldNavigate: boolean,
  onboardingType: string = 'club'
) => {
  if (!shouldNavigate) return;
  
  try {
    // Mapeamento de etapas para rotas de navegação
    const stepToNextPath: Record<string, string> = {
      // Club
      'personal_info': '/onboarding/professional-data',
      'personal': '/onboarding/professional-data',
      'professional_info': '/onboarding/business-context',
      'professional_data': '/onboarding/business-context',
      'business_context': '/onboarding/ai-experience',
      'ai_experience': '/onboarding/club-goals',
      'ai_exp': '/onboarding/club-goals',
      'business_goals': '/onboarding/customization',
      'experience_personalization': '/onboarding/complementary',
      'complementary_info': '/onboarding/review',
      'review': '/onboarding/trail-generation',
      
      // Formação (se necessário)
      'formacao_personal': '/onboarding/formacao/ai-experience',
      'formacao_ai_experience': '/onboarding/formacao/goals',
      'formacao_goals': '/onboarding/formacao/preferences',
      'formacao_preferences': '/onboarding/formacao/review'
    };
    
    // Buscar o próximo caminho com base no ID da etapa
    const nextPath = stepToNextPath[stepId];
    
    // Se não encontrou o próximo caminho, tentar com base no índice atual
    if (!nextPath) {
      console.warn(`[AVISO] Próximo caminho não encontrado para etapa ${stepId}, tentando usar índice ${currentStepIndex}`);
      
      // Navegação baseada em índice como fallback
      switch (onboardingType) {
        case 'club':
          // Caminhos do Club
          const clubPaths = [
            '/onboarding/personal-info',
            '/onboarding/professional-data',
            '/onboarding/business-context',
            '/onboarding/ai-experience',
            '/onboarding/club-goals',
            '/onboarding/customization',
            '/onboarding/complementary',
            '/onboarding/review',
            '/onboarding/trail-generation'
          ];
          
          if (currentStepIndex >= 0 && currentStepIndex < clubPaths.length - 1) {
            navigate(clubPaths[currentStepIndex + 1]);
          } else {
            navigate('/onboarding/review');
          }
          break;
          
        case 'formacao':
          // Caminhos da Formação
          const formacaoPaths = [
            '/onboarding/formacao/personal-info',
            '/onboarding/formacao/ai-experience',
            '/onboarding/formacao/goals',
            '/onboarding/formacao/preferences',
            '/onboarding/formacao/review'
          ];
          
          if (currentStepIndex >= 0 && currentStepIndex < formacaoPaths.length - 1) {
            navigate(formacaoPaths[currentStepIndex + 1]);
          } else {
            navigate('/onboarding/formacao/review');
          }
          break;
          
        default:
          console.error(`[ERRO] Tipo de onboarding desconhecido: ${onboardingType}`);
          navigate('/onboarding/personal-info');
      }
    } else {
      // Navegação normal com base no mapeamento de etapas
      console.log(`[DEBUG] Navegando de ${stepId} para ${nextPath}`);
      navigate(nextPath);
    }
  } catch (error) {
    console.error("[ERRO] Erro ao navegar após salvar etapa:", error);
    toast.error("Erro na navegação. Tente novamente.");
    
    // Usar navegação de fallback básica em caso de erro
    if (onboardingType === 'formacao') {
      navigate('/onboarding/formacao');
    } else {
      navigate('/onboarding/personal-info');
    }
  }
};
