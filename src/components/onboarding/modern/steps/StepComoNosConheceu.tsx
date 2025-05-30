
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const HOW_FOUND_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indicacao', label: 'Indicação de alguém' },
  { value: 'evento', label: 'Evento' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'outro', label: 'Outro' }
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
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Como nos conheceu? 🤝
        </h2>
        <p className="text-gray-400">
          Queremos entender como você chegou até nós
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Como conheceu o VIVER DE IA? <span className="text-red-400">*</span>
          </label>
          <Select value={data.how_found_us || ''} onValueChange={(value) => onUpdate('how_found_us', value)}>
            <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
              <SelectValue placeholder="Selecione como nos conheceu" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {HOW_FOUND_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-white hover:bg-gray-700"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.how_found_us === 'indicacao' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Quem te indicou?
            </label>
            <Input
              type="text"
              value={data.referred_by || ''}
              onChange={(e) => onUpdate('referred_by', e.target.value)}
              placeholder="Nome da pessoa que te indicou"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
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
