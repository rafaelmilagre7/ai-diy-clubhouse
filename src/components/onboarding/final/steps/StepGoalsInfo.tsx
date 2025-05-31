
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

const GOALS = [
  'Aumentar receita',
  'Reduzir custos',
  'Melhorar eficiência',
  'Automatizar processos',
  'Melhorar experiência do cliente',
  'Escalar negócio',
  'Inovar produtos/serviços',
  'Ganhar vantagem competitiva',
  'Tomar decisões baseadas em dados',
  'Outros'
];

export const StepGoalsInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const { goals_info } = data;

  const handleUpdate = (field: string, value: string) => {
    onUpdate('goals_info', {
      ...goals_info,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Objetivo principal <span className="text-red-400">*</span>
        </label>
        <select
          value={goals_info.primary_goal || ''}
          onChange={(e) => handleUpdate('primary_goal', e.target.value)}
          className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
        >
          <option value="">Selecione seu objetivo principal</option>
          {GOALS.map(goal => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          O que espera alcançar em 30 dias? <span className="text-red-400">*</span>
        </label>
        <Textarea
          value={goals_info.expected_outcome_30days || ''}
          onChange={(e) => handleUpdate('expected_outcome_30days', e.target.value)}
          placeholder="Descreva o que você espera alcançar nos próximos 30 dias..."
          className="min-h-[100px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
        />
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-700">
        <Button
          onClick={onPrevious}
          variant="ghost"
          className="text-gray-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Anterior</span>
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2 px-8"
        >
          <span>Continuar</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
