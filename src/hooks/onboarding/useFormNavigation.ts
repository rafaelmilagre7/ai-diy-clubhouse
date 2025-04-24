
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useFormNavigation() {
  const navigate = useNavigate();

  // Função para navegar para o próximo passo ou para o passo anterior se o delta for negativo
  const nextStep = useCallback((delta: number = 1) => {
    if (delta === -1) {
      // Volta para a página anterior
      navigate(-1);
      return;
    }

    // Por padrão, navega para a próxima etapa na sequência de onboarding
    // Esta é uma lógica simplificada, pode precisar ser adaptada conforme a estrutura de rotas
    const currentPath = window.location.pathname;
    
    const routes = {
      "/onboarding": "/onboarding/professional-data",
      "/onboarding/professional-data": "/onboarding/business-context",
      "/onboarding/business-context": "/onboarding/ai-experience",
      "/onboarding/ai-experience": "/onboarding/club-goals",
      "/onboarding/club-goals": "/onboarding/customization",
      "/onboarding/customization": "/onboarding/complementary",
      "/onboarding/complementary": "/onboarding/review",
    };

    const nextPath = routes[currentPath as keyof typeof routes];
    if (nextPath) {
      navigate(nextPath);
    }
  }, [navigate]);

  return { nextStep };
}
