
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const HOW_FOUND_OPTIONS = [
  { value: 'google', label: '🔍 Google/Pesquisa' },
  { value: 'youtube', label: '📺 YouTube' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'instagram', label: '📸 Instagram' },
  { value: 'indicacao', label: '👥 Indicação de alguém' },
  { value: 'evento', label: '🎯 Evento/Palestra' },
  { value: 'outro', label: '🔄 Outro' }
];

export const StepComoNosConheceu: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const showReferredBy = data.how_found_us === 'indicacao';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Como nos conheceu? 🤝
        </h2>
        <p className="text-gray-400">
          Queremos entender como chegou até nós
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.how_found_us || ''}
          onChange={(value) => onUpdate('how_found_us', value)}
          options={HOW_FOUND_OPTIONS}
          placeholder="Como conheceu a Viver de IA?"
          label="Como nos conheceu?"
          required
        />

        {showReferredBy && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Quem te indicou? <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.referred_by || ''}
              onChange={(e) => onUpdate('referred_by', e.target.value)}
              placeholder="Nome da pessoa que te indicou"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        )}

        <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-4">
          <p className="text-sm text-viverblue-light">
            💡 <strong>Dica:</strong> Essa informação nos ajuda a entender melhor 
            nossos canais de comunicação e criar conteúdo mais direcionado.
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
