
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { RealtimeFieldValidation } from '../RealtimeFieldValidation';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';

const COUNTRY_OPTIONS = [
  { value: '+55', label: 'Brasil (+55)' },
  { value: '+1', label: 'Estados Unidos (+1)' },
  { value: '+34', label: 'Espanha (+34)' },
  { value: '+351', label: 'Portugal (+351)' },
  { value: '+33', label: 'França (+33)' },
  { value: '+49', label: 'Alemanha (+49)' },
  { value: '+44', label: 'Reino Unido (+44)' },
  { value: '+39', label: 'Itália (+39)' },
  { value: '+52', label: 'México (+52)' },
  { value: '+54', label: 'Argentina (+54)' }
];

export const StepQuemEVoceNew: React.FC<OnboardingStepProps> = ({
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
          Quem é você? 👋
        </h2>
        <p className="text-gray-400">
          Vamos começar conhecendo você um pouco melhor
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Seu nome completo <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={data.name || ''}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Digite seu nome completo"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
          <RealtimeFieldValidation validation={getFieldValidation('name')} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            E-mail <span className="text-red-400">*</span>
          </label>
          <Input
            type="email"
            value={data.email || ''}
            onChange={(e) => onUpdate('email', e.target.value)}
            placeholder="seu@email.com"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
          <RealtimeFieldValidation validation={getFieldValidation('email')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              País <span className="text-red-400">*</span>
            </label>
            <Select value={data.country_code || ''} onValueChange={(value) => onUpdate('country_code', value)}>
              <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {COUNTRY_OPTIONS.map((option) => (
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
            <RealtimeFieldValidation validation={getFieldValidation('country_code')} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-white">
              WhatsApp <span className="text-red-400">*</span>
            </label>
            <Input
              type="tel"
              value={data.whatsapp || ''}
              onChange={(e) => onUpdate('whatsapp', e.target.value)}
              placeholder="(11) 99999-9999"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
            <RealtimeFieldValidation validation={getFieldValidation('whatsapp')} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Data de nascimento (opcional)
          </label>
          <Input
            type="date"
            value={data.birth_date || ''}
            onChange={(e) => onUpdate('birth_date', e.target.value)}
            className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
          />
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
