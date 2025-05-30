
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { RealtimeFieldValidation } from '../RealtimeFieldValidation';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';
import { DropdownModerno } from '../DropdownModerno';
import { Textarea } from '@/components/ui/textarea';

const BUSINESS_MODEL_OPTIONS = [
  { value: 'b2b', label: '🏢 B2B (Business to Business)' },
  { value: 'b2c', label: '👤 B2C (Business to Consumer)' },
  { value: 'b2b2c', label: '🔄 B2B2C (Híbrido)' },
  { value: 'marketplace', label: '🛒 Marketplace' },
  { value: 'saas', label: '☁️ SaaS (Software as a Service)' },
  { value: 'ecommerce', label: '🛍️ E-commerce' },
  { value: 'consultoria', label: '🎯 Consultoria/Serviços' },
  { value: 'outro', label: '🤔 Outro' }
];

const CHALLENGES_OPTIONS = [
  'Automatizar processos manuais',
  'Melhorar atendimento ao cliente',
  'Otimizar análise de dados',
  'Personalizar experiência do usuário',
  'Reduzir custos operacionais',
  'Aumentar produtividade da equipe',
  'Melhorar tomada de decisões',
  'Automatizar marketing/vendas',
  'Detectar fraudes/anomalias',
  'Otimizar logística/supply chain'
];

export const StepContextoNegocio: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const { getFieldValidation } = useRealtimeValidation(data, currentStep);

  const handleChallengeToggle = (challenge: string) => {
    const currentChallenges = data.business_challenges || [];
    const isSelected = currentChallenges.includes(challenge);
    
    if (isSelected) {
      onUpdate('business_challenges', currentChallenges.filter(c => c !== challenge));
    } else {
      onUpdate('business_challenges', [...currentChallenges, challenge]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Contexto do negócio 💼
        </h2>
        <p className="text-gray-400">
          Vamos entender melhor seu modelo e desafios
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.business_model || ''}
          onChange={(value) => onUpdate('business_model', value)}
          options={BUSINESS_MODEL_OPTIONS}
          placeholder="Selecione seu modelo de negócio"
          label="Modelo de negócio"
          required
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Principais desafios do negócio <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione os principais desafios que sua empresa enfrenta (múltipla escolha)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHALLENGES_OPTIONS.map((challenge) => {
              const isSelected = (data.business_challenges || []).includes(challenge);
              return (
                <button
                  key={challenge}
                  type="button"
                  onClick={() => handleChallengeToggle(challenge)}
                  className={`
                    p-3 rounded-lg border text-left text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{challenge}</span>
                    {isSelected && (
                      <span className="text-viverblue">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <RealtimeFieldValidation validation={getFieldValidation('business_challenges')} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Contexto adicional <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <Textarea
            value={data.additional_context || ''}
            onChange={(e) => onUpdate('additional_context', e.target.value)}
            placeholder="Compartilhe qualquer informação adicional que considere relevante sobre seu negócio, mercado ou situação atual..."
            className="min-h-[100px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div></div>
          
          <div className="text-sm text-gray-400">
            Etapa {currentStep} de {totalSteps}
          </div>
          
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2"
          >
            <span>Continuar</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
