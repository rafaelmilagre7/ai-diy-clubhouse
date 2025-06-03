
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const BUSINESS_MODEL_OPTIONS = [
  { value: 'b2b', label: '🏢 B2B (Empresa para Empresa)' },
  { value: 'b2c', label: '👥 B2C (Empresa para Consumidor)' },
  { value: 'b2b2c', label: '🔗 B2B2C (Híbrido)' },
  { value: 'marketplace', label: '🛒 Marketplace' },
  { value: 'saas', label: '☁️ SaaS (Software como Serviço)' },
  { value: 'ecommerce', label: '🛍️ E-commerce' },
  { value: 'servicos', label: '🔧 Prestação de Serviços' },
  { value: 'consultoria', label: '💼 Consultoria' },
  { value: 'educacao', label: '📚 Educação/Treinamento' },
  { value: 'outro', label: '📋 Outro' }
];

const BUSINESS_CHALLENGES = [
  { value: 'automatizar-processos', label: 'Automatizar processos manuais' },
  { value: 'melhorar-atendimento', label: 'Melhorar atendimento ao cliente' },
  { value: 'aumentar-vendas', label: 'Aumentar vendas e conversões' },
  { value: 'reduzir-custos', label: 'Reduzir custos operacionais' },
  { value: 'analise-dados', label: 'Melhorar análise de dados' },
  { value: 'marketing-digital', label: 'Otimizar marketing digital' },
  { value: 'gestao-equipe', label: 'Melhorar gestão de equipe' },
  { value: 'inovacao', label: 'Acelerar inovação' },
  { value: 'competitividade', label: 'Aumentar competitividade' },
  { value: 'escalar-negocio', label: 'Escalar o negócio' }
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
  const selectedChallenges = Array.isArray(data.business_challenges) ? data.business_challenges : [];

  const toggleChallenge = (challenge: string) => {
    const updated = selectedChallenges.includes(challenge)
      ? selectedChallenges.filter(c => c !== challenge)
      : [...selectedChallenges, challenge];
    onUpdate('business_challenges', updated);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Contexto do negócio 📊
        </h2>
        <p className="text-gray-400">
          Nos ajude a entender melhor seu negócio e principais desafios
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
          <p className="text-xs text-gray-400">Selecione até 3 principais desafios</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BUSINESS_CHALLENGES.map((challenge) => (
              <div
                key={challenge.value}
                onClick={() => toggleChallenge(challenge.value)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedChallenges.includes(challenge.value)
                    ? 'border-viverblue bg-viverblue/10 text-viverblue'
                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedChallenges.includes(challenge.value)
                      ? 'border-viverblue bg-viverblue'
                      : 'border-gray-500'
                  }`}>
                    {selectedChallenges.includes(challenge.value) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">{challenge.label}</span>
                </div>
              </div>
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
            placeholder="Conte-nos mais sobre seu negócio, mercado, objetivos específicos..."
            className="min-h-[120px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-yellow-400">
            💡 <strong>Dica:</strong> Quanto mais detalhes você fornecer, melhor poderemos 
            personalizar as soluções e recomendações para seu negócio.
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="ghost"
            className="text-gray-400 hover:text-white flex items-center gap-2"
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
