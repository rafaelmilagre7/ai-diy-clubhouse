
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData, OnboardingFormData } from '@/types/onboarding';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

interface BusinessContextFormProps {
  data: OnboardingData | null;
  onSubmit: (data: Partial<OnboardingFormData>) => Promise<boolean>;
  isSaving: boolean;
}

export const BusinessContextForm: React.FC<BusinessContextFormProps> = ({ data, onSubmit, isSaving }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<Partial<OnboardingFormData>>({
    defaultValues: {
      business_model: data?.business_model || '',
      business_challenges: data?.business_challenges || [],
      short_term_goals: data?.short_term_goals || [],
      medium_term_goals: data?.medium_term_goals || [],
      important_kpis: data?.important_kpis || [],
      additional_context: data?.additional_context || '',
    }
  });

  // Função para converter string separada por vírgulas em array
  const handleArrayChange = (field: keyof Pick<OnboardingFormData, 'business_challenges' | 'short_term_goals' | 'medium_term_goals' | 'important_kpis'>, value: string) => {
    return value.split(',').map(item => item.trim()).filter(item => item !== '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business_model">Modelo de Negócio <span className="text-red-500">*</span></Label>
          <Textarea
            id="business_model"
            placeholder="Descreva brevemente o modelo de negócio da sua empresa"
            {...register('business_model', { required: 'Este campo é obrigatório' })}
            className={errors.business_model ? 'border-red-500' : ''}
          />
          {errors.business_model && <p className="text-red-500 text-sm">{errors.business_model.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_challenges">Principais Desafios <span className="text-red-500">*</span></Label>
          <Textarea
            id="business_challenges"
            placeholder="Liste seus principais desafios de negócio (separados por vírgula)"
            defaultValue={data?.business_challenges?.join(', ') || ''}
            {...register('business_challenges', {
              required: 'Este campo é obrigatório',
              setValueAs: value => handleArrayChange('business_challenges', value)
            })}
            className={errors.business_challenges ? 'border-red-500' : ''}
          />
          {errors.business_challenges && <p className="text-red-500 text-sm">{errors.business_challenges.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="short_term_goals">Objetivos de Curto Prazo</Label>
            <Textarea
              id="short_term_goals"
              placeholder="Objetivos para os próximos 3-6 meses (separados por vírgula)"
              defaultValue={data?.short_term_goals?.join(', ') || ''}
              {...register('short_term_goals', {
                setValueAs: value => handleArrayChange('short_term_goals', value)
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medium_term_goals">Objetivos de Médio Prazo</Label>
            <Textarea
              id="medium_term_goals"
              placeholder="Objetivos para os próximos 6-18 meses (separados por vírgula)"
              defaultValue={data?.medium_term_goals?.join(', ') || ''}
              {...register('medium_term_goals', {
                setValueAs: value => handleArrayChange('medium_term_goals', value)
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="important_kpis">KPIs Importantes</Label>
          <Input
            id="important_kpis"
            placeholder="Quais KPIs são mais importantes para seu negócio? (separados por vírgula)"
            defaultValue={data?.important_kpis?.join(', ') || ''}
            {...register('important_kpis', {
              setValueAs: value => handleArrayChange('important_kpis', value)
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_context">Contexto Adicional</Label>
          <Textarea
            id="additional_context"
            placeholder="Compartilhe qualquer informação adicional que possa ser relevante"
            {...register('additional_context')}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => navigate('/onboarding/professional')}
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
