
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

const BUSINESS_MODELS = [
  'B2B (Business to Business)',
  'B2C (Business to Consumer)',
  'B2B2C (Business to Business to Consumer)',
  'Marketplace',
  'SaaS (Software as a Service)',
  'E-commerce',
  'Serviços/Consultoria',
  'Outro'
];

const CHALLENGES = [
  'Automatizar processos',
  'Reduzir custos operacionais',
  'Melhorar atendimento ao cliente',
  'Aumentar vendas',
  'Otimizar marketing',
  'Análise de dados',
  'Gestão de equipe',
  'Outros'
];

export const StepBusinessContext: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const { business_context } = data;

  const handleUpdate = (field: string, value: string | string[]) => {
    onUpdate('business_context', {
      [field]: value
    });
  };

  const handleChallengeToggle = (challenge: string) => {
    const current = business_context.business_challenges || [];
    const updated = current.includes(challenge)
      ? current.filter(c => c !== challenge)
      : [...current, challenge];
    handleUpdate('business_challenges', updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Modelo de negócio <span className="text-red-400">*</span>
        </label>
        <select
          value={business_context.business_model || ''}
          onChange={(e) => handleUpdate('business_model', e.target.value)}
          className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
        >
          <option value="">Selecione seu modelo de negócio</option>
          {BUSINESS_MODELS.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Principais desafios <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CHALLENGES.map(challenge => (
            <button
              key={challenge}
              type="button"
              onClick={() => handleChallengeToggle(challenge)}
              className={`p-3 text-sm rounded-lg border transition-all ${
                (business_context.business_challenges || []).includes(challenge)
                  ? 'bg-viverblue/20 border-viverblue text-viverblue'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {challenge}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Contexto adicional (opcional)
        </label>
        <Textarea
          value={business_context.additional_context || ''}
          onChange={(e) => handleUpdate('additional_context', e.target.value)}
          placeholder="Conte-nos mais sobre sua empresa e objetivos..."
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
