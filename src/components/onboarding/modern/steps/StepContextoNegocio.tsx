
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const BUSINESS_MODEL_OPTIONS = [
  { value: 'b2b', label: '🏢 B2B (Business to Business)' },
  { value: 'b2c', label: '👥 B2C (Business to Consumer)' },
  { value: 'b2b2c', label: '🔄 B2B2C (Business to Business to Consumer)' },
  { value: 'marketplace', label: '🛒 Marketplace' },
  { value: 'saas', label: '☁️ SaaS (Software as a Service)' },
  { value: 'ecommerce', label: '🛍️ E-commerce' },
  { value: 'servicos', label: '🔧 Prestação de serviços' },
  { value: 'consultoria', label: '💼 Consultoria' },
  { value: 'produto_fisico', label: '📦 Produto físico' },
  { value: 'assinatura', label: '🔄 Modelo de assinatura' },
  { value: 'franquia', label: '🏪 Franquia' },
  { value: 'outro', label: '🔄 Outro' }
];

const CHALLENGE_SUGGESTIONS = [
  'Falta de automação nos processos',
  'Dificuldade em analisar dados',
  'Atendimento ao cliente manual',
  'Gestão de leads ineficiente',
  'Falta de personalização',
  'Processos repetitivos',
  'Análise de mercado limitada',
  'Tomada de decisão lenta',
  'Falta de insights de dados',
  'Comunicação interna deficiente'
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
  const addChallenge = (challenge: string) => {
    const currentChallenges = data.business_challenges || [];
    if (!currentChallenges.includes(challenge)) {
      onUpdate('business_challenges', [...currentChallenges, challenge]);
    }
  };

  const removeChallenge = (challenge: string) => {
    const currentChallenges = data.business_challenges || [];
    onUpdate('business_challenges', currentChallenges.filter(c => c !== challenge));
  };

  const addCustomChallenge = (customChallenge: string) => {
    if (customChallenge.trim()) {
      addChallenge(customChallenge.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Contexto do seu negócio 🎯
        </h2>
        <p className="text-gray-400">
          Vamos entender melhor como sua empresa funciona
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

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Principais desafios do negócio <span className="text-red-400">*</span>
          </label>
          
          {/* Challenges selecionados */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(data.business_challenges || []).map((challenge, index) => (
              <div
                key={index}
                className="bg-viverblue/20 text-viverblue px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{challenge}</span>
                <button
                  onClick={() => removeChallenge(challenge)}
                  className="text-viverblue hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Sugestões de challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CHALLENGE_SUGGESTIONS.map((challenge, index) => (
              <button
                key={index}
                onClick={() => addChallenge(challenge)}
                disabled={(data.business_challenges || []).includes(challenge)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  (data.business_challenges || []).includes(challenge)
                    ? 'bg-viverblue/20 border-viverblue/40 text-viverblue cursor-not-allowed'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'
                }`}
              >
                <Plus size={16} className="inline mr-2" />
                {challenge}
              </button>
            ))}
          </div>

          {/* Input para challenge customizado */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Adicione um desafio específico da sua empresa"
              className="flex-1 h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  addCustomChallenge(target.value);
                  target.value = '';
                }
              }}
            />
            <Button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                if (input) {
                  addCustomChallenge(input.value);
                  input.value = '';
                }
              }}
              variant="outline"
              className="h-12 px-4 border-gray-600 text-gray-300 hover:bg-gray-600/50"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Contexto adicional (opcional)
          </label>
          <textarea
            value={data.additional_context || ''}
            onChange={(e) => onUpdate('additional_context', e.target.value)}
            placeholder="Compartilhe mais detalhes sobre sua empresa, mercado ou situação atual"
            className="w-full h-24 p-3 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-viverblue/50 resize-none"
          />
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <p className="text-sm text-orange-300">
            💡 <strong>Dica:</strong> Quanto mais específico você for sobre seus desafios, 
            melhor poderemos personalizar as soluções e a trilha de implementação para sua empresa.
          </p>
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
