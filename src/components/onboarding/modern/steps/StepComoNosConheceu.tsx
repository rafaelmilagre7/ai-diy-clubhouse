
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';
import { ConditionalReferralInput } from '../ConditionalReferralInput';

const HOW_FOUND_OPTIONS = [
  { value: 'google', label: '🔍 Busca no Google' },
  { value: 'youtube', label: '📺 YouTube' },
  { value: 'instagram', label: '📸 Instagram' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'facebook', label: '👥 Facebook' },
  { value: 'indicacao', label: '👨‍💼 Indicação de alguém' },
  { value: 'podcast', label: '🎧 Podcast' },
  { value: 'evento', label: '🎯 Evento/Palestra' },
  { value: 'outro', label: '🔗 Outro' }
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
  const showReferralInput = data.how_found_us === 'indicacao';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Como nos conheceu? 🤝
        </h2>
        <p className="text-gray-400">
          Queremos saber como você chegou até nós
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.how_found_us || ''}
          onChange={(value) => onUpdate('how_found_us', value)}
          options={HOW_FOUND_OPTIONS}
          placeholder="Selecione como nos conheceu"
          label="Como você conheceu a Viver de IA?"
          required
        />

        <ConditionalReferralInput
          show={showReferralInput}
          value={data.referred_by || ''}
          onChange={(value) => onUpdate('referred_by', value)}
        />

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-400">
            📊 <strong>Feedback:</strong> Essas informações nos ajudam a entender 
            quais canais são mais efetivos e melhorar nossa comunicação.
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
