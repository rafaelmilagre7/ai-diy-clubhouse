
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const howFoundUsOptions = [
  { value: 'google', label: 'Google / Busca online' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'indicacao', label: 'Indicação de amigo' },
  { value: 'evento', label: 'Evento / Palestra' },
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Search className="h-6 w-6 text-viverblue" />
          Como nos conheceu?
        </h2>
        <p className="text-gray-400">
          Isso nos ajuda a entender melhor nossos canais de comunicação
        </p>
      </div>

      <div className="space-y-4">
        <RadioGroup
          value={data.how_found_us}
          onValueChange={(value) => onUpdate('how_found_us', value)}
          className="space-y-2"
        >
          {howFoundUsOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <RadioGroupItem 
                value={option.value} 
                id={option.value}
                className="border-gray-600 text-viverblue"
              />
              <Label 
                htmlFor={option.value} 
                className="text-white cursor-pointer flex-1"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Campo para indicação */}
        {data.how_found_us === 'indicacao' && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="referred_by" className="text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-viverblue" />
              Quem te indicou?
            </Label>
            <Input
              id="referred_by"
              type="text"
              value={data.referred_by || ''}
              onChange={(e) => onUpdate('referred_by', e.target.value)}
              placeholder="Nome da pessoa que te indicou"
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-viverblue"
            />
          </div>
        )}
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Voltar
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </Button>
      </div>

      {/* Indicador de progresso */}
      <div className="flex justify-center">
        <span className="text-sm text-gray-400">
          Etapa {currentStep} de {totalSteps}
        </span>
      </div>
    </div>
  );
};
