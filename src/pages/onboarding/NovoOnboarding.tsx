
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import { MoticonAnimation } from '@/components/onboarding/MoticonAnimation';
import { useOnboardingGuard } from '@/hooks/onboarding/useOnboardingGuard';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { Loader2 } from 'lucide-react';

const NovoOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { isOnboardingComplete, isLoading } = useOnboardingGuard(false);
  const { progress } = useProgress();

  useEffect(() => {
    if (isLoading) return;

    if (isOnboardingComplete) {
      console.log("[NovoOnboarding] Onboarding completo, redirecionando para página de sucesso");
      navigate('/onboarding/completed', { replace: true });
      return;
    }

    // Se não está completo, verificar qual é a próxima etapa
    if (progress) {
      const currentStep = progress.current_step;
      const completedSteps = progress.completed_steps || [];

      // Determinar próxima etapa baseada no progresso
      if (!completedSteps.includes('personal_info')) {
        navigate('/onboarding/personal-info');
      } else if (!completedSteps.includes('professional_info')) {
        navigate('/onboarding/professional-data');
      } else if (!completedSteps.includes('business_context')) {
        navigate('/onboarding/business-context');
      } else if (!completedSteps.includes('ai_experience')) {
        navigate('/onboarding/ai-experience');
      } else if (!completedSteps.includes('business_goals')) {
        navigate('/onboarding/club-goals');
      } else if (!completedSteps.includes('experience_personalization')) {
        navigate('/onboarding/customization');
      } else if (!completedSteps.includes('complementary_info')) {
        navigate('/onboarding/complementary');
      } else {
        navigate('/onboarding/review');
      }
    } else {
      // Sem progresso, começar do início
      navigate('/onboarding/personal-info');
    }
  }, [navigate, isOnboardingComplete, isLoading, progress]);

  // Mostrar loading enquanto determina para onde ir
  return (
    <MemberLayout>
      <div className="bg-gradient-to-b from-[#0F111A] to-[#161A2C] min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <MoticonAnimation />
          </div>
          <Loader2 className="h-12 w-12 animate-spin text-viverblue mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Preparando seu onboarding...
          </h1>
          <p className="text-viverblue-light">
            Redirecionando para a próxima etapa
          </p>
        </div>
      </div>
    </MemberLayout>
  );
};

export default NovoOnboarding;
