
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData, OnboardingFormData } from '@/types/onboarding';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface BusinessGoalsFormProps {
  data: OnboardingData | null;
  onSubmit: (data: Partial<OnboardingFormData>) => Promise<boolean>;
  isSaving: boolean;
}

export const BusinessGoalsForm: React.FC<BusinessGoalsFormProps> = ({ data, onSubmit, isSaving }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Partial<OnboardingFormData>>({
    defaultValues: {
      primary_goal: data?.primary_goal || '',
      expected_outcomes: data?.expected_outcomes || [],
      expected_outcome_30days: data?.expected_outcome_30days || '',
      timeline: data?.timeline || '',
      priority_solution_type: data?.priority_solution_type || '',
      how_implement: data?.how_implement || '',
      week_availability: data?.week_availability || '',
      live_interest: data?.live_interest || 5,
      content_formats: data?.content_formats || [],
    }
  });

  const liveInterestValue = watch('live_interest');

  // Função para converter string separada por vírgulas em array
  const handleArrayChange = (field: keyof Pick<OnboardingFormData, 'expected_outcomes' | 'content_formats'>, value: string) => {
    return value.split(',').map(item => item.trim()).filter(item => item !== '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primary_goal">Principal Objetivo <span className="text-red-500">*</span></Label>
          <Select 
            defaultValue={data?.primary_goal || ''} 
            onValueChange={(value) => setValue('primary_goal', value)}
          >
            <SelectTrigger id="primary_goal" className={errors.primary_goal ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione seu principal objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aumentar_receita">Aumentar Receita</SelectItem>
              <SelectItem value="reduzir_custos">Reduzir Custos</SelectItem>
              <SelectItem value="automacao">Automação de Processos</SelectItem>
              <SelectItem value="novos_produtos">Desenvolver Novos Produtos/Serviços</SelectItem>
              <SelectItem value="experiencia_cliente">Melhorar Experiência do Cliente</SelectItem>
              <SelectItem value="conhecimento">Adquirir Conhecimento em IA</SelectItem>
            </SelectContent>
          </Select>
          {errors.primary_goal && <p className="text-red-500 text-sm">{errors.primary_goal.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_outcome_30days">Resultado Esperado em 30 Dias <span className="text-red-500">*</span></Label>
          <Textarea
            id="expected_outcome_30days"
            placeholder="O que você espera alcançar nos primeiros 30 dias?"
            {...register('expected_outcome_30days', { required: 'Este campo é obrigatório' })}
            className={errors.expected_outcome_30days ? 'border-red-500' : ''}
          />
          {errors.expected_outcome_30days && <p className="text-red-500 text-sm">{errors.expected_outcome_30days.message}</p>}
        </div>

        {/* Formulário simplificado para exemplo */}
        <div className="space-y-2">
          <Label>Interesse em Sessões ao Vivo (1-10)</Label>
          <div className="pt-6 pb-2">
            <Slider
              defaultValue={[data?.live_interest || 5]}
              max={10}
              step={1}
              onValueChange={(values) => setValue('live_interest', values[0])}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Pouco interesse</span>
            <span>Valor atual: {liveInterestValue}</span>
            <span>Muito interesse</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => navigate('/onboarding/business-context')}
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
