
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const BUSINESS_MODEL_OPTIONS = [
  { value: 'b2b', label: '🏢 B2B (Business to Business)' },
  { value: 'b2c', label: '👥 B2C (Business to Consumer)' },
  { value: 'marketplace', label: '🛒 Marketplace' },
  { value: 'saas', label: '💻 SaaS (Software as a Service)' },
  { value: 'ecommerce', label: '🛍️ E-commerce' },
  { value: 'servicos', label: '🔧 Prestação de Serviços' },
  { value: 'consultoria', label: '💼 Consultoria' },
  { value: 'outro', label: '🔄 Outro' }
];

const BUSINESS_CHALLENGES_OPTIONS = [
  'Captação de clientes',
  'Retenção de clientes',
  'Automação de processos',
  'Análise de dados',
  'Atendimento ao cliente',
  'Gestão de equipe',
  'Redução de custos',
  'Aumento de produtividade',
  'Expansão do negócio',
  'Inovação tecnológica'
];

export const StepContextoNegocio: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleChallengeChange = (challenge: string, checked: boolean) => {
    const currentChallenges = Array.isArray(data.business_challenges) ? data.business_challenges : [];
    if (checked) {
      onUpdate('business_challenges', [...currentChallenges, challenge]);
    } else {
      onUpdate('business_challenges', currentChallenges.filter(c => c !== challenge));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Contexto do seu negócio 📊
        </h2>
        <p className="text-gray-400">
          Vamos entender melhor sobre seu modelo de negócio e desafios
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

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Principais desafios do seu negócio
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BUSINESS_CHALLENGES_OPTIONS.map((challenge) => (
              <label key={challenge} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.business_challenges) && data.business_challenges.includes(challenge)}
                  onCheckedChange={(checked) => handleChallengeChange(challenge, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{challenge}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Contexto adicional (opcional)
          </label>
          <Textarea
            value={data.additional_context || ''}
            onChange={(e) => onUpdate('additional_context', e.target.value)}
            placeholder="Descreva qualquer contexto adicional sobre seu negócio que considera importante..."
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
