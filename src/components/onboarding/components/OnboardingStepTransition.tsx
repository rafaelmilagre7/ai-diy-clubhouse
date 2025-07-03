import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OnboardingStepTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  direction?: 'forward' | 'backward';
  duration?: number;
  className?: string;
}

export const OnboardingStepTransition: React.FC<OnboardingStepTransitionProps> = ({
  children,
  isActive,
  direction = 'forward',
  duration = 400,
  className
}) => {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isActive) {
      setMounted(true);
      setAnimating(true);
      
      const timer = setTimeout(() => {
        setAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      setAnimating(true);
      
      const timer = setTimeout(() => {
        setMounted(false);
        setAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  if (!mounted && !isActive) {
    return null;
  }

  const getTransitionClasses = () => {
    if (!animating) {
      return "opacity-100 transform translate-x-0 scale-100";
    }

    if (isActive) {
      // Entrando
      const enterFrom = direction === 'forward' 
        ? "opacity-0 transform translate-x-8 scale-95" 
        : "opacity-0 transform -translate-x-8 scale-95";
      return `${enterFrom} transition-all duration-${duration} ease-out`;
    } else {
      // Saindo
      const exitTo = direction === 'forward'
        ? "opacity-0 transform -translate-x-8 scale-95"
        : "opacity-0 transform translate-x-8 scale-95";
      return `${exitTo} transition-all duration-${duration} ease-in`;
    }
  };

  return (
    <div
      className={cn(
        "w-full",
        getTransitionClasses(),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: isActive 
          ? 'cubic-bezier(0.4, 0, 0.2, 1)' 
          : 'cubic-bezier(0.4, 0, 1, 1)'
      }}
    >
      {children}
    </div>
  );
};

// Hook para gerenciar transições entre steps
export const useStepTransition = (currentStep: number, totalSteps: number) => {
  const [previousStep, setPreviousStep] = useState(currentStep);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    if (currentStep !== previousStep) {
      setDirection(currentStep > previousStep ? 'forward' : 'backward');
      setPreviousStep(currentStep);
    }
  }, [currentStep, previousStep]);

  return {
    direction,
    previousStep,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    progress: (currentStep / totalSteps) * 100
  };
};