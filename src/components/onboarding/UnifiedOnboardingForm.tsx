
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { steps } from '@/hooks/onboarding/useStepDefinitions';
import { OnboardingSteps } from './OnboardingSteps';

interface OnboardingFormData {
  name: string;
  email: string;
  company_name: string;
  company_size: string;
  company_sector: string;
  current_position: string;
  business_goals: string[];
  ai_experience_level: string;
}

export const UnifiedOnboardingForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingFormData>();

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .insert({
          user_id: user.id,
          personal_info: {
            name: data.name,
            email: data.email
          },
          professional_info: {
            company_name: data.company_name,
            company_size: data.company_size,
            company_sector: data.company_sector,
            current_position: data.current_position
          },
          business_goals: {
            goals: data.business_goals
          },
          ai_experience: {
            knowledge_level: data.ai_experience_level
          },
          is_completed: true,
          current_step: 'completed',
          completed_steps: ['unified_onboarding']
        });

      if (error) {
        throw error;
      }

      toast.success('Cadastro realizado com sucesso!');
      navigate('/implementation-trail');
    } catch (error) {
      console.error('Erro no onboarding:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Onboarding do VIVER DE IA Club</h2>
        <p className="text-gray-400 mb-6">
          Etapa {currentStep + 1} de {steps.length}
        </p>
        
        <OnboardingSteps />
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || isSubmitting}
          >
            Voltar
          </Button>
          
          <Button
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                handleSubmit(onSubmit)();
              }
            }}
            disabled={isSubmitting}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            {currentStep < steps.length - 1 ? 'Próximo' : 'Finalizar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
