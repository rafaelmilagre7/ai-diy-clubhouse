
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { SliderInput } from '../SliderInput';

const INTERESTS_OPTIONS = [
  'Automação de processos',
  'Marketing com IA',
  'Análise de dados',
  'Atendimento ao cliente',
  'Criação de conteúdo',
  'Vendas e CRM',
  'Recursos humanos',
  'Finanças e contabilidade',
  'Logística e operações',
  'Inovação e P&D'
];

const TIME_PREFERENCE_OPTIONS = [
  'Manhã (6h - 12h)',
  'Tarde (12h - 18h)', 
  'Noite (18h - 22h)',
  'Madrugada (22h - 6h)'
];

const AVAILABLE_DAYS_OPTIONS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

export const StepPersonalizacaoExperiencia: React.FC<OnboardingStepProps> = ({
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

  const handleDayToggle = (day: string) => {
    const currentDays = data.available_days || [];
    const isSelected = currentDays.includes(day);
    
    if (isSelected) {
      onUpdate('available_days', currentDays.filter(d => d !== day));
    } else {
      onUpdate('available_days', [...currentDays, day]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-viverblue" />
          Personalização da experiência
        </h2>
        <p className="text-gray-400">
          Últimos ajustes para personalizar sua jornada na comunidade
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Áreas de maior interesse <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione as áreas que mais despertam seu interesse
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INTERESTS_OPTIONS.map((interest) => {
              const isSelected = (data.interests || []).includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`
                    p-3 rounded-lg border text-left text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{interest}</span>
                    {isSelected && (
                      <span className="text-viverblue">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Horários preferenciais <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Quando você costuma estudar ou implementar melhorias?
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {TIME_PREFERENCE_OPTIONS.map((time) => {
              const isSelected = (data.time_preference || []).includes(time);
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeToggle(time)}
                  className={`
                    p-3 rounded-lg border text-center text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  {time}
                  {isSelected && (
                    <div className="text-viverblue mt-1">✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Dias disponíveis <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Em quais dias você tem mais disponibilidade para se dedicar?
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_DAYS_OPTIONS.map((day) => {
              const isSelected = (data.available_days || []).includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`
                    p-3 rounded-lg border text-center text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  {day.slice(0, 3)}
                  {isSelected && (
                    <div className="text-viverblue mt-1">✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <SliderInput
          value={data.networking_availability || 5}
          onChange={(value) => onUpdate('networking_availability', value)}
          label="Interesse em networking (0-10)"
          min={0}
          max={10}
          step={1}
        />

        <div className="bg-gradient-to-r from-viverblue/10 to-purple-500/10 border border-viverblue/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-viverblue mt-0.5" />
            <div>
              <p className="text-sm font-medium text-viverblue-light mb-1">
                Quase lá! 🎉
              </p>
              <p className="text-xs text-gray-300">
                Com essas informações vamos personalizar sua experiência na comunidade, 
                sugerir conteúdos relevantes e conectar você com pessoas do seu interesse!
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div></div>
          
          <div className="text-sm text-gray-400">
            Etapa {currentStep} de {totalSteps}
          </div>
          
          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-viverblue to-purple-600 hover:from-viverblue-dark hover:to-purple-700 transition-all flex items-center gap-2"
          >
            <span>Finalizar Onboarding</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
