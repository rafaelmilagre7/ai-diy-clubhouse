
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

const DISCOVERY_OPTIONS = [
  'Pesquisa no Google',
  'YouTube',
  'Instagram',
  'LinkedIn',
  'Facebook',
  'Indicação de amigo/conhecido',
  'Podcast',
  'Blog/Site',
  'Evento online',
  'Evento presencial',
  'Publicidade paga',
  'Outros'
];

export const StepDiscoveryInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const { discovery_info } = data;

  const handleUpdate = (field: string, value: string) => {
    onUpdate('discovery_info', {
      ...discovery_info,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Como você conheceu a Viver de IA? <span className="text-red-400">*</span>
        </label>
        <select
          value={discovery_info.how_found_us || ''}
          onChange={(e) => handleUpdate('how_found_us', e.target.value)}
          className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
        >
          <option value="">Selecione como nos conheceu</option>
          {DISCOVERY_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {discovery_info.how_found_us === 'Indicação de amigo/conhecido' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Quem te indicou?
          </label>
          <Input
            type="text"
            value={discovery_info.referred_by || ''}
            onChange={(e) => handleUpdate('referred_by', e.target.value)}
            placeholder="Nome da pessoa que te indicou"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>
      )}

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
