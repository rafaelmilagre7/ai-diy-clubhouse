
import React, { memo, Suspense, lazy, useMemo } from 'react';
import { OnboardingPerformanceOptimizer } from './performance/OnboardingPerformanceOptimizer';
import { PerformanceWrapper } from '@/components/common/performance/PerformanceWrapper';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy loading otimizado dos componentes de onboarding
const OnboardingStepPersonalInfo = lazy(() => 
  import('./steps/OnboardingStepPersonalInfo').then(module => ({ 
    default: module.OnboardingStepPersonalInfo 
  }))
);

const OnboardingStepCompanyInfo = lazy(() => 
  import('./steps/OnboardingStepCompanyInfo').then(module => ({ 
    default: module.OnboardingStepCompanyInfo 
  }))
);

const OnboardingStepBusinessGoals = lazy(() => 
  import('./steps/OnboardingStepBusinessGoals').then(module => ({ 
    default: module.OnboardingStepBusinessGoals 
  }))
);

const OnboardingStepAIExperience = lazy(() => 
  import('./steps/OnboardingStepAIExperience').then(module => ({ 
    default: module.OnboardingStepAIExperience 
  }))
);

const OnboardingStepImplementation = lazy(() => 
  import('./steps/OnboardingStepImplementation').then(module => ({ 
    default: module.OnboardingStepImplementation 
  }))
);

const OnboardingStepCompletion = lazy(() => 
  import('./steps/OnboardingStepCompletion').then(module => ({ 
    default: module.OnboardingStepCompletion 
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
  
  // Memoizar as props dos steps para evitar re-renders
  const stepProps = useMemo(() => ({
    onNext: () => setCurrentStep(prev => prev + 1),
    onBack: () => setCurrentStep(prev => prev - 1),
    onComplete: onComplete || (() => {})
  }), [onComplete]);

  // Memoizar o componente do step atual
  const CurrentStepComponent = useMemo(() => {
    const components = [
      OnboardingStepPersonalInfo,
      OnboardingStepCompanyInfo,
      OnboardingStepBusinessGoals,
      OnboardingStepAIExperience,
      OnboardingStepImplementation,
      OnboardingStepCompletion
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
            <CurrentStepComponent {...stepProps} />
          </Suspense>
        </div>
      </OnboardingPerformanceOptimizer>
    </PerformanceWrapper>
  );
});

SimpleOnboardingFlow.displayName = 'SimpleOnboardingFlow';

export default SimpleOnboardingFlow;
