
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { OnboardingData, OnboardingFormData } from '@/types/onboarding';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIExperienceFormProps {
  data: OnboardingData | null;
  onSubmit: (data: Partial<OnboardingFormData>) => Promise<boolean>;
  isSaving: boolean;
}

export const AIExperienceForm: React.FC<AIExperienceFormProps> = ({ data, onSubmit, isSaving }) => {
  const navigate = useNavigate();
  const { handleSubmit } = useForm<Partial<OnboardingFormData>>({
    defaultValues: {
      knowledge_level: data?.knowledge_level || '',
      previous_tools: data?.previous_tools || [],
      has_implemented: data?.has_implemented || '',
      desired_ai_areas: data?.desired_ai_areas || [],
      completed_formation: data?.completed_formation || false,
      is_member_for_month: data?.is_member_for_month || false,
      nps_score: data?.nps_score || 0,
      improvement_suggestions: data?.improvement_suggestions || '',
    }
  });

  // Formulário simplificado para exemplo
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-6 rounded-lg bg-[#0ABAB5]/10 border border-[#0ABAB5]/20">
        <p className="text-center text-gray-400">
          Formulário de Experiência com IA - Será implementado em breve.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => navigate('/onboarding/business-goals')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>
        
        <Button 
          type="submit" 
          disabled={isSaving}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSaving ? (
            "Salvando..."
          ) : (
            <>
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
