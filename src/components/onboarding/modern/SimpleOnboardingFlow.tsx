
import React, { memo, Suspense, lazy, useMemo } from 'react';
import { OnboardingPerformanceOptimizer } from './performance/OnboardingPerformanceOptimizer';
import { PerformanceWrapper } from '@/components/common/performance/PerformanceWrapper';
import LoadingScreen from '@/components/common/LoadingScreen';
import { OnboardingFinalData } from '@/types/onboardingFinal';

// Lazy loading otimizado dos componentes de onboarding existentes
const StepPersonalInfo = lazy(() => 
  import('../final/steps/StepPersonalInfo').then(module => ({ 
    default: module.StepPersonalInfo 
  }))
);

const StepCompanyInfo = lazy(() => 
  import('../final/steps/StepBusinessInfo').then(module => ({ 
    default: module.StepBusinessInfo 
  }))
);

const StepBusinessContext = lazy(() => 
  import('../final/steps/StepBusinessContext').then(module => ({ 
    default: module.StepBusinessContext 
  }))
);

const StepAIExperience = lazy(() => 
  import('../final/steps/StepAIExperience').then(module => ({ 
    default: module.StepAIExperience 
  }))
);

const StepGoalsInfo = lazy(() => 
  import('../final/steps/StepGoalsInfo').then(module => ({ 
    default: module.StepGoalsInfo 
  }))
);

const StepDiscoveryInfo = lazy(() => 
  import('../final/steps/StepDiscoveryInfo').then(module => ({ 
    default: module.StepDiscoveryInfo 
  }))
);

interface SimpleOnboardingFlowProps {
  initialStep?: number;
  onComplete?: () => void;
}

export const SimpleOnboardingFlow: React.FC<SimpleOnboardingFlowProps> = memo(({
  initialStep = 1,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = React.useState(initialStep);
  const [data, setData] = React.useState<OnboardingFinalData>({
    personal_info: {
      name: '',
      email: ''
    },
    location_info: {},
    discovery_info: {},
    business_info: {},
    business_context: {},
    goals_info: {},
    ai_experience: {},
    personalization: {}
  });
  
  // Memoizar as props dos steps para evitar re-renders
  const stepProps = useMemo(() => ({
    data,
    onUpdate: (section: keyof OnboardingFinalData, value: any) => {
      setData(prev => ({
        ...prev,
        [section]: value
      }));
    },
    onNext: () => setCurrentStep(prev => prev + 1),
    onPrevious: () => setCurrentStep(prev => prev - 1),
    onComplete: onComplete || (() => {}),
    canProceed: true,
    currentStep,
    totalSteps: 6
  }), [data, onComplete, currentStep]);

  // Memoizar o componente do step atual
  const CurrentStepComponent = useMemo(() => {
    const components = [
      StepPersonalInfo,
      StepCompanyInfo,
      StepBusinessContext,
      StepAIExperience,
      StepGoalsInfo,
      StepDiscoveryInfo
    ];

    const Component = components[currentStep - 1];
    
    if (!Component) {
      return () => <div>Step não encontrado</div>;
    }

    return Component;
  }, [currentStep]);

  return (
    <PerformanceWrapper 
      componentName="SimpleOnboardingFlow" 
      context="onboarding"
    >
      <OnboardingPerformanceOptimizer>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Suspense fallback={
            <LoadingScreen 
              message="Carregando etapa do onboarding"
              variant="skeleton"
              skeletonVariant="page"
            />
          }>
            <div className="container mx-auto px-4 py-8">
              <CurrentStepComponent {...stepProps} />
            </div>
          </Suspense>
        </div>
      </OnboardingPerformanceOptimizer>
    </PerformanceWrapper>
  );
});

SimpleOnboardingFlow.displayName = 'SimpleOnboardingFlow';

export default SimpleOnboardingFlow;
