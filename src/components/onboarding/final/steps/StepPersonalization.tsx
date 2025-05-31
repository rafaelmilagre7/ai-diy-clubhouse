
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

const CONTENT_FORMATS = [
  'Vídeos curtos (até 5 min)',
  'Vídeos longos (mais de 15 min)',
  'Artigos e textos',
  'Podcasts',
  'Infográficos',
  'Webinars ao vivo',
  'Cursos estruturados',
  'Cases práticos'
];

const AVAILABLE_DAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

const TIME_PREFERENCES = [
  'Manhã (6h-12h)',
  'Tarde (12h-18h)',
  'Noite (18h-22h)',
  'Madrugada (22h-6h)'
];

export const StepPersonalization: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const { personalization } = data;

  const handleFormatToggle = (format: string) => {
    const currentFormats = personalization.content_formats || [];
    const isSelected = currentFormats.includes(format);
    
    const newFormats = isSelected
      ? currentFormats.filter(f => f !== format)
      : [...currentFormats, format];
    
    onUpdate('personalization', {
      ...personalization,
      content_formats: newFormats
    });
  };

  const handleDayToggle = (day: string) => {
    const currentDays = personalization.available_days || [];
    const isSelected = currentDays.includes(day);
    
    const newDays = isSelected
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    onUpdate('personalization', {
      ...personalization,
      available_days: newDays
    });
  };

  const handleTimeToggle = (time: string) => {
    const currentTimes = personalization.time_preference || [];
    const isSelected = currentTimes.includes(time);
    
    const newTimes = isSelected
      ? currentTimes.filter(t => t !== time)
      : [...currentTimes, time];
    
    onUpdate('personalization', {
      ...personalization,
      time_preference: newTimes
    });
  };

  const handleAuthorizationChange = (value: boolean) => {
    onUpdate('personalization', {
      ...personalization,
      authorize_case_usage: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Formatos de conteúdo preferidos <span className="text-red-400">*</span>
          <span className="text-gray-400 text-xs block mt-1">Selecione pelo menos 2 opções</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONTENT_FORMATS.map(format => {
            const isSelected = (personalization.content_formats || []).includes(format);
            
            return (
              <button
                key={format}
                type="button"
                onClick={() => handleFormatToggle(format)}
                className={`p-3 text-left rounded-lg border transition-all text-sm ${
                  isSelected
                    ? 'bg-viverblue/20 border-viverblue text-viverblue'
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {format}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Dias da semana disponíveis <span className="text-red-400">*</span>
          <span className="text-gray-400 text-xs block mt-1">Selecione pelo menos 2 dias</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {AVAILABLE_DAYS.map(day => {
            const isSelected = (personalization.available_days || []).includes(day);
            
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`p-3 text-center rounded-lg border transition-all text-sm ${
                  isSelected
                    ? 'bg-viverblue/20 border-viverblue text-viverblue'
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Horários preferidos <span className="text-red-400">*</span>
          <span className="text-gray-400 text-xs block mt-1">Selecione pelo menos 1 período</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TIME_PREFERENCES.map(time => {
            const isSelected = (personalization.time_preference || []).includes(time);
            
            return (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeToggle(time)}
                className={`p-3 text-center rounded-lg border transition-all text-sm ${
                  isSelected
                    ? 'bg-viverblue/20 border-viverblue text-viverblue'
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Autorização para uso de caso
        </label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleAuthorizationChange(true)}
            className={`w-full p-4 text-left rounded-lg border transition-all ${
              personalization.authorize_case_usage === true
                ? 'bg-viverblue/20 border-viverblue text-viverblue'
                : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="font-medium">Sim, autorizo</div>
            <div className="text-sm text-gray-400 mt-1">
              Permito que meu caso de sucesso seja usado como exemplo (dados anonimizados)
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => handleAuthorizationChange(false)}
            className={`w-full p-4 text-left rounded-lg border transition-all ${
              personalization.authorize_case_usage === false
                ? 'bg-viverblue/20 border-viverblue text-viverblue'
                : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="font-medium">Não autorizo</div>
            <div className="text-sm text-gray-400 mt-1">
              Prefiro manter meus dados privados
            </div>
          </button>
        </div>
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
        
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2 px-8"
        >
          <span>Finalizar</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
