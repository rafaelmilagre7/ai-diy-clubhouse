
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { Checkbox } from '@/components/ui/checkbox';

const INTERESTS_OPTIONS = [
  'Automação de processos',
  'Atendimento ao cliente',
  'Marketing e vendas',
  'Análise de dados',
  'Criação de conteúdo',
  'Recursos humanos',
  'Desenvolvimento de produtos',
  'Operações internas'
];

const TIME_PREFERENCE_OPTIONS = [
  'Manhã (8h-12h)',
  'Tarde (12h-18h)',
  'Noite (18h-22h)',
  'Madrugada (22h-6h)'
];

export const StepPersonalizacao: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleInterestToggle = (interest: string) => {
    const currentInterests = data.interests || [];
    const isSelected = currentInterests.includes(interest);
    
    if (isSelected) {
      onUpdate('interests', currentInterests.filter(i => i !== interest));
    } else {
      onUpdate('interests', [...currentInterests, interest]);
    }
  };

  const handleTimeToggle = (time: string) => {
    const currentTimes = data.time_preference || [];
    const isSelected = currentTimes.includes(time);
    
    if (isSelected) {
      onUpdate('time_preference', currentTimes.filter(t => t !== time));
    } else {
      onUpdate('time_preference', [...currentTimes, time]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Personalização da experiência 🎨
        </h2>
        <p className="text-gray-400">
          Vamos personalizar sua experiência na plataforma
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Áreas de interesse <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione as áreas que mais te interessam
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INTERESTS_OPTIONS.map((interest) => {
              const isSelected = (data.interests || []).includes(interest);
              return (
                <label key={interest} className="flex items-center gap-2 text-white cursor-pointer">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleInterestToggle(interest)}
                    className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                  />
                  <span className="text-sm">{interest}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Horários preferenciais <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Quando você prefere receber conteúdos e participar de atividades?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TIME_PREFERENCE_OPTIONS.map((time) => {
              const isSelected = (data.time_preference || []).includes(time);
              return (
                <label key={time} className="flex items-center gap-2 text-white cursor-pointer">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleTimeToggle(time)}
                    className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                  />
                  <span className="text-sm">{time}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-400">
            🎉 <strong>Quase lá!</strong> Esta é a última etapa. Após clicar em "Finalizar", 
            você será direcionado para seu dashboard personalizado!
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
            className="bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>Finalizar</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
