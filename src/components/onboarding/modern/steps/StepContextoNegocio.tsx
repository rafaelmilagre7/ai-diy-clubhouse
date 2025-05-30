
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';
import { Checkbox } from '@/components/ui/checkbox';

const BUSINESS_MODEL_OPTIONS = [
  { value: 'b2b', label: '🏢 B2B (Business to Business)' },
  { value: 'b2c', label: '👤 B2C (Business to Consumer)' },
  { value: 'b2b2c', label: '🔄 B2B2C (Business to Business to Consumer)' },
  { value: 'marketplace', label: '🛒 Marketplace' },
  { value: 'saas', label: '☁️ SaaS (Software as a Service)' },
  { value: 'ecommerce', label: '🛍️ E-commerce' },
  { value: 'consultoria', label: '🤝 Consultoria/Serviços' },
  { value: 'outro', label: '📦 Outro' }
];

const BUSINESS_CHALLENGES_OPTIONS = [
  'Aumentar vendas',
  'Reduzir custos operacionais',
  'Melhorar atendimento ao cliente',
  'Automatizar processos',
  'Melhorar produtividade da equipe',
  'Análise de dados mais eficiente',
  'Criação de conteúdo',
  'Gestão de estoque',
  'Marketing digital',
  'Recrutamento e seleção'
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
          Contexto do negócio 📊
        </h2>
        <p className="text-gray-400">
          Ajude-nos a entender melhor seu negócio e desafios
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.business_model || ''}
          onChange={(value) => onUpdate('business_model', value)}
          options={BUSINESS_MODEL_OPTIONS}
          placeholder="Selecione o modelo de negócio"
          label="Modelo de negócio"
          required
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Principais desafios do negócio <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione todos os desafios que se aplicam ao seu negócio
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BUSINESS_CHALLENGES_OPTIONS.map((challenge) => {
              const isSelected = (data.business_challenges || []).includes(challenge);
              return (
                <label key={challenge} className="flex items-center gap-2 text-white cursor-pointer">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleChallengeToggle(challenge)}
                    className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                  />
                  <span className="text-sm">{challenge}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Contexto adicional <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <Textarea
            value={data.additional_context || ''}
            onChange={(e) => onUpdate('additional_context', e.target.value)}
            placeholder="Conte-nos mais sobre seu negócio, objetivos específicos ou qualquer informação que considera importante..."
            className="min-h-[120px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50 resize-none"
          />
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-sm text-purple-400">
            💡 <strong>Dica:</strong> Quanto mais detalhes você fornecer, mais 
            personalizadas serão as soluções e recomendações que receberá.
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
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
