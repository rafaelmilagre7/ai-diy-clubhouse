import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

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

  return null;
};
