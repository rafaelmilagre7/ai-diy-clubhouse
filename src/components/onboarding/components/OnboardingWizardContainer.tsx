import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { toast } from 'sonner';

interface OnboardingWizardContainerProps {
  children: (props: {
    currentStep: number;
    isSubmitting: boolean;
    data: OnboardingData;
    isLoading: boolean;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
    validationErrors: Array<{ field: string; message: string }>;
    getFieldError: (field: string) => string | undefined;
    handleNext: () => void;
    handlePrevious: () => void;
    handleDataChange: (stepData: Partial<OnboardingData>) => void;
    handleSubmit: () => Promise<void>;
    isCurrentStepValid: boolean;
    totalSteps: number;
  }) => React.ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);

  const totalSteps = 6;

  // Carregar dados do onboarding
  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        const { data: onboardingData } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (onboardingData) {
          const mappedData: OnboardingData = {
            name: onboardingData.name || profile?.name,
            email: onboardingData.email || user.email,
            phone: onboardingData.phone,
            instagram: onboardingData.instagram,
            linkedin: onboardingData.linkedin,
            state: onboardingData.state,
            city: onboardingData.city,
            birthDate: onboardingData.birth_date,
            curiosity: onboardingData.curiosity,
            companyName: onboardingData.company_name,
            companyWebsite: onboardingData.company_website,
            businessSector: onboardingData.business_sector,
            companySize: onboardingData.company_size,
            annualRevenue: onboardingData.annual_revenue,
            position: onboardingData.position,
            hasImplementedAI: onboardingData.has_implemented_ai,
            aiToolsUsed: onboardingData.ai_tools_used || [],
            aiKnowledgeLevel: onboardingData.ai_knowledge_level,
            dailyTools: onboardingData.daily_tools || [],
            whoWillImplement: onboardingData.who_will_implement,
            mainObjective: onboardingData.main_objective,
            areaToImpact: onboardingData.area_to_impact,
            expectedResult90Days: onboardingData.expected_result_90_days,
            aiImplementationBudget: onboardingData.ai_implementation_budget,
            weeklyLearningTime: onboardingData.weekly_learning_time,
            contentPreference: onboardingData.content_preference || [],
            wantsNetworking: onboardingData.wants_networking,
            bestDays: onboardingData.best_days || [],
            bestPeriods: onboardingData.best_periods || [],
            acceptsCaseStudy: onboardingData.accepts_case_study,
            memberType: onboardingData.member_type || 'club',
            completedAt: onboardingData.completed_at,
            startedAt: onboardingData.started_at
          };

          setData(mappedData);

          if (onboardingData.completed_at) {
            setCurrentStep(totalSteps);
          }
        } else {
          setData({
            name: profile?.name || '',
            email: user.email || '',
            memberType: 'club',
            startedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do onboarding:', error);
        toast.error('Erro ao carregar dados do onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingData();
  }, [user?.id, profile]);

  const validateStep = useCallback((step: number, currentData: OnboardingData) => {
    const errors: Array<{ field: string; message: string }> = [];

    switch (step) {
      case 1:
        if (!currentData.name) {
          errors.push({ field: 'name', message: 'Nome é obrigatório' });
        }
        if (!currentData.email) {
          errors.push({ field: 'email', message: 'Email é obrigatório' });
        }
        break;
      case 2:
        if (!currentData.companyName) {
          errors.push({ field: 'companyName', message: 'Nome da empresa é obrigatório' });
        }
        if (!currentData.businessSector) {
          errors.push({ field: 'businessSector', message: 'Setor de atuação é obrigatório' });
        }
        break;
      case 3:
        if (!currentData.hasImplementedAI) {
          errors.push({ field: 'hasImplementedAI', message: 'Campo obrigatório' });
        }
        if (!currentData.aiKnowledgeLevel) {
          errors.push({ field: 'aiKnowledgeLevel', message: 'Campo obrigatório' });
        }
        break;
      case 4:
        if (!currentData.mainObjective) {
          errors.push({ field: 'mainObjective', message: 'Objetivo principal é obrigatório' });
        }
        if (!currentData.areaToImpact) {
          errors.push({ field: 'areaToImpact', message: 'Área a impactar é obrigatória' });
        }
        break;
      case 5:
        if (!currentData.weeklyLearningTime) {
          errors.push({ field: 'weeklyLearningTime', message: 'Tempo semanal é obrigatório' });
        }
        if (!currentData.bestDays || currentData.bestDays.length === 0) {
          errors.push({ field: 'bestDays', message: 'Melhores dias são obrigatórios' });
        }
        if (!currentData.bestPeriods || currentData.bestPeriods.length === 0) {
          errors.push({ field: 'bestPeriods', message: 'Melhores períodos são obrigatórios' });
        }
        if (!currentData.acceptsCaseStudy) {
          errors.push({ field: 'acceptsCaseStudy', message: 'Campo obrigatório' });
        }
        break;
      default:
        break;
    }

    setValidationErrors(errors);
    return errors;
  }, []);

  useEffect(() => {
    validateStep(currentStep, data);
  }, [currentStep, data, validateStep]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleDataChange = useCallback((stepData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...stepData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const finalData = {
        ...data,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user?.id,
          name: finalData.name,
          email: finalData.email,
          phone: finalData.phone,
          instagram: finalData.instagram,
          linkedin: finalData.linkedin,
          state: finalData.state,
          city: finalData.city,
          birth_date: finalData.birthDate,
          curiosity: finalData.curiosity,
          company_name: finalData.companyName,
          company_website: finalData.companyWebsite,
          business_sector: finalData.businessSector,
          company_size: finalData.companySize,
          annual_revenue: finalData.annualRevenue,
          position: finalData.position,
          has_implemented_ai: finalData.hasImplementedAI,
          ai_tools_used: finalData.aiToolsUsed,
          ai_knowledge_level: finalData.aiKnowledgeLevel,
          daily_tools: finalData.dailyTools,
          who_will_implement: finalData.whoWillImplement,
          main_objective: finalData.mainObjective,
          area_to_impact: finalData.areaToImpact,
          expected_result_90_days: finalData.expectedResult90Days,
          ai_implementation_budget: finalData.aiImplementationBudget,
          weekly_learning_time: finalData.weeklyLearningTime,
          content_preference: finalData.contentPreference,
          wants_networking: finalData.wantsNetworking,
          best_days: finalData.bestDays,
          best_periods: finalData.bestPeriods,
          accepts_case_study: finalData.acceptsCaseStudy,
          member_type: finalData.memberType,
          completed_at: finalData.completedAt,
          started_at: finalData.startedAt || new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setData(finalData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      toast.success('Onboarding concluído com sucesso!');
      
      // Aguardar um pouco para o usuário ler a mensagem antes de redirecionar
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);

    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [data, user?.id, navigate]);

  const getFieldError = useCallback((field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  }, [validationErrors]);

  const isCurrentStepValid = validationErrors.length === 0;

  return children({
    currentStep,
    isSubmitting,
    data,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    getFieldError,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    totalSteps
  });
};
