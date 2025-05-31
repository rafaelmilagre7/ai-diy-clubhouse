
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

const DAYS = [
  'Segunda-feira',
  'Terça-feira', 
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

const CONTENT_FORMATS = [
  'Vídeos',
  'Podcasts',
  'Artigos/Textos',
  'Infográficos',
  'Webinars ao vivo',
  'Cursos online',
  'Templates práticos'
];

export const StepPersonalization: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed
}) => {
  const { personalization } = data;

  const handleUpdate = (field: string, value: string[] | number) => {
    onUpdate('personalization', {
      [field]: value
    });
  };

  const handleDayToggle = (day: string) => {
    const current = personalization.available_days || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    handleUpdate('available_days', updated);
  };

  const handleFormatToggle = (format: string) => {
    const current = personalization.content_formats || [];
    const updated = current.includes(format)
      ? current.filter(f => f !== format)
      : [...current, format];
    handleUpdate('content_formats', updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Dias disponíveis para aprendizado <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DAYS.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              className={`p-3 text-sm rounded-lg border transition-all ${
                (personalization.available_days || []).includes(day)
                  ? 'bg-viverblue/20 border-viverblue text-viverblue'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Formatos de conteúdo preferidos <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CONTENT_FORMATS.map(format => (
            <button
              key={format}
              type="button"
              onClick={() => handleFormatToggle(format)}
              className={`p-3 text-sm rounded-lg border transition-all ${
                (personalization.content_formats || []).includes(format)
                  ? 'bg-viverblue/20 border-viverblue text-viverblue'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-700">
        <Button
          onClick={() => onNext && onNext()}
          variant="ghost"
          className="text-gray-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Anterior</span>
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2 px-8"
        >
          <span>Finalizar Onboarding</span>
        </Button>
      </div>
    </div>
  );
};
