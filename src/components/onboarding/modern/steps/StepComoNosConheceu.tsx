
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { RealtimeFieldValidation } from '../RealtimeFieldValidation';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';
import { DropdownModerno } from '../DropdownModerno';
import { ConditionalReferralInput } from '../ConditionalReferralInput';

const HOW_FOUND_OPTIONS = [
  { value: 'google', label: '🔍 Google / Busca online' },
  { value: 'youtube', label: '📺 YouTube' },
  { value: 'instagram', label: '📸 Instagram' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'facebook', label: '📘 Facebook' },
  { value: 'indicacao', label: '👥 Indicação de amigo/colega' },
  { value: 'evento', label: '🎯 Evento/Palestra' },
  { value: 'podcast', label: '🎧 Podcast' },
  { value: 'blog', label: '📝 Blog/Artigo' },
  { value: 'anuncio', label: '📢 Anúncio pago' },
  { value: 'outro', label: '🤔 Outro' }
];

export const StepComoNosConheceu: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const { getFieldValidation } = useRealtimeValidation(data, currentStep);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Como nos conheceu? 🤝
        </h2>
        <p className="text-gray-400">
          Queremos entender como você chegou até nós
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
          howFoundUs={data.how_found_us || ''}
          referredBy={data.referred_by || ''}
          onReferredByChange={(value) => onUpdate('referred_by', value)}
        />

        <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-4">
          <p className="text-sm text-viverblue-light">
            💡 <strong>Curiosidade:</strong> Essas informações nos ajudam a entender quais canais 
            são mais efetivos e melhorar nossa presença onde você mais precisa!
          </p>
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
