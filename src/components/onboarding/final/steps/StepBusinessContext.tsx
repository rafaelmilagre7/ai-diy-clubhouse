
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

const BUSINESS_MODELS = [
  'B2B (Empresa para Empresa)',
  'B2C (Empresa para Consumidor)',
  'B2B2C (Híbrido)',
  'E-commerce',
  'SaaS (Software como Serviço)',
  'Marketplace',
  'Consultoria/Serviços',
  'Produto físico',
  'Outros'
];

const CHALLENGES = [
  'Automação de processos',
  'Atendimento ao cliente',
  'Geração de leads',
  'Análise de dados',
  'Produtividade da equipe',
  'Redução de custos',
  'Personalização de experiência',
  'Tomada de decisões',
  'Gestão de inventário',
  'Marketing digital'
];

export const StepBusinessContext: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const { business_context } = data;

  const handleModelChange = (value: string) => {
    onUpdate('business_context', {
      ...business_context,
      business_model: value
    });
  };

  const handleChallengeToggle = (challenge: string) => {
    const currentChallenges = business_context.business_challenges || [];
    const isSelected = currentChallenges.includes(challenge);
    
    const newChallenges = isSelected
      ? currentChallenges.filter(c => c !== challenge)
      : [...currentChallenges, challenge];
    
    onUpdate('business_context', {
      ...business_context,
      business_challenges: newChallenges
    });
  };

  const handleContextChange = (value: string) => {
    onUpdate('business_context', {
      ...business_context,
      additional_context: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Modelo de negócio <span className="text-red-400">*</span>
        </label>
        <select
          value={business_context.business_model || ''}
          onChange={(e) => handleModelChange(e.target.value)}
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

      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Principais desafios do negócio <span className="text-red-400">*</span>
          <span className="text-gray-400 text-xs block mt-1">Selecione até 5 opções</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CHALLENGES.map(challenge => {
            const isSelected = (business_context.business_challenges || []).includes(challenge);
            const selectedCount = (business_context.business_challenges || []).length;
            const canSelect = selectedCount < 5 || isSelected;
            
            return (
              <button
                key={challenge}
                type="button"
                onClick={() => canSelect && handleChallengeToggle(challenge)}
                disabled={!canSelect}
                className={`p-3 text-left rounded-lg border transition-all text-sm ${
                  isSelected
                    ? 'bg-viverblue/20 border-viverblue text-viverblue'
                    : canSelect
                    ? 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    : 'bg-gray-800/30 border-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {challenge}
              </button>
            );
          })}
        </div>
        {(business_context.business_challenges || []).length > 0 && (
          <p className="text-xs text-gray-400">
            {(business_context.business_challenges || []).length}/5 selecionados
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Contexto adicional
        </label>
        <Textarea
          value={business_context.additional_context || ''}
          onChange={(e) => handleContextChange(e.target.value)}
          placeholder="Conte-nos mais sobre seu negócio, mercado, clientes ou qualquer contexto que julgue importante..."
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
