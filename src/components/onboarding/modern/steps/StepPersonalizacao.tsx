
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const AVAILABLE_DAYS_OPTIONS = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
  'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
];

const INTERESTS_OPTIONS = [
  'Networking empresarial', 'Inovação tecnológica', 'Tendências de mercado',
  'Gestão de equipes', 'Marketing digital', 'Vendas e relacionamento',
  'Análise de dados', 'Automação', 'Sustentabilidade', 'Transformação digital'
];

export const StepPersonalizacao: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleDaysChange = (day: string, checked: boolean) => {
    const currentDays = Array.isArray(data.available_days) ? data.available_days : [];
    if (checked) {
      onUpdate('available_days', [...currentDays, day]);
    } else {
      onUpdate('available_days', currentDays.filter(d => d !== day));
    }
  };

  const handleInterestsChange = (interest: string, checked: boolean) => {
    const currentInterests = Array.isArray(data.interests) ? data.interests : [];
    if (checked) {
      onUpdate('interests', [...currentInterests, interest]);
    } else {
      onUpdate('interests', currentInterests.filter(i => i !== interest));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Personalização da experiência ✨
        </h2>
        <p className="text-gray-400">
          Últimos ajustes para personalizar sua jornada
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Dias da semana disponíveis <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_DAYS_OPTIONS.map((day) => (
              <label key={day} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.available_days) && data.available_days.includes(day)}
                  onCheckedChange={(checked) => handleDaysChange(day, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Áreas de interesse
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INTERESTS_OPTIONS.map((interest) => (
              <label key={interest} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.interests) && data.interests.includes(interest)}
                  onCheckedChange={(checked) => handleInterestsChange(interest, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Nível de interesse em networking (1-10)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={data.networking_availability || 5}
              onChange={(e) => onUpdate('networking_availability', parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white font-medium w-8 text-center">
              {data.networking_availability || 5}
            </span>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-300">
            🎉 <strong>Quase pronto!</strong> Estamos personalizando sua experiência 
            com base nas suas preferências.
          </p>
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
