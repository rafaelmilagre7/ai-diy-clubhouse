
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { OnboardingData, OnboardingFormData } from '@/types/onboarding';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PersonalizationFormProps {
  data: OnboardingData | null;
  onSubmit: (data: Partial<OnboardingFormData>) => Promise<boolean>;
  isSaving: boolean;
}

export const PersonalizationForm: React.FC<PersonalizationFormProps> = ({ data, onSubmit, isSaving }) => {
  const navigate = useNavigate();
  const { handleSubmit } = useForm<Partial<OnboardingFormData>>({
    defaultValues: {
      interests: data?.interests || [],
      time_preference: data?.time_preference || [],
      available_days: data?.available_days || [],
      networking_availability: data?.networking_availability || 5,
      skills_to_share: data?.skills_to_share || [],
      mentorship_topics: data?.mentorship_topics || [],
    }
  });

  // Formulário simplificado para exemplo
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-6 rounded-lg bg-[#0ABAB5]/10 border border-[#0ABAB5]/20">
        <p className="text-center text-gray-400">
          Formulário de Personalização da Experiência - Será implementado em breve.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => navigate('/onboarding/ai-experience')}
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
