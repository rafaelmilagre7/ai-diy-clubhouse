
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';
import { ConditionalReferralInput } from '../ConditionalReferralInput';

const HOW_FOUND_OPTIONS = [
  { value: 'google', label: '🔍 Busca no Google' },
  { value: 'youtube', label: '📺 YouTube' },
  { value: 'instagram', label: '📸 Instagram' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'indicacao', label: '👥 Indicação de amigo/colega' },
  { value: 'podcast', label: '🎧 Podcast' },
  { value: 'evento', label: '🎤 Evento/Palestra' },
  { value: 'artigo', label: '📰 Artigo/Blog' },
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
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Como nos conheceu? 🤝
        </h2>
        <p className="text-gray-400">
          Nos ajude a entender como você chegou até nós
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.how_found_us || ''}
          onChange={(value) => onUpdate('how_found_us', value)}
          options={HOW_FOUND_OPTIONS}
          placeholder="Selecione como conheceu a Viver de IA"
          label="Como você conheceu a Viver de IA?"
          required
        />

        <ConditionalReferralInput
          howFoundUs={data.how_found_us || ''}
          referredBy={data.referred_by || ''}
          onReferredByChange={(value) => onUpdate('referred_by', value)}
        />

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-400">
            📊 <strong>Por que perguntamos:</strong> Essas informações nos ajudam a 
            entender quais canais funcionam melhor e como melhorar nossa comunicação.
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
