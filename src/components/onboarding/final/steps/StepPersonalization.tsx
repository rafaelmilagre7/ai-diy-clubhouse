
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

export const StepPersonalization: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const { personalization } = data;

  const handleUpdate = (field: string, value: any) => {
    onUpdate('personalization', {
      ...personalization,
      [field]: value
    });
  };

  const handleToggle = (field: string, currentValue: boolean) => {
    handleUpdate(field, !currentValue);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">
          Últimos detalhes para personalizar sua experiência
        </h3>
        <p className="text-gray-400">
          Essas informações são opcionais, mas nos ajudam a criar uma experiência mais personalizada
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Autorizar uso do seu caso</h4>
              <p className="text-sm text-gray-400">
                Podemos usar seu caso (anonimizado) como exemplo para outros membros?
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('authorize_case_usage', personalization.authorize_case_usage || false)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                personalization.authorize_case_usage 
                  ? 'bg-viverblue' 
                  : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  personalization.authorize_case_usage ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Interesse em entrevista</h4>
              <p className="text-sm text-gray-400">
                Gostaria de participar de entrevistas para melhorarmos a plataforma?
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('interested_in_interview', personalization.interested_in_interview || false)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                personalization.interested_in_interview 
                  ? 'bg-viverblue' 
                  : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  personalization.interested_in_interview ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
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
          className="bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2 px-8"
        >
          <Check size={16} />
          <span>Finalizar Onboarding</span>
        </Button>
      </div>
    </div>
  );
};
