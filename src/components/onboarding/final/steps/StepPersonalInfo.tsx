
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { validateBrazilianWhatsApp, formatWhatsApp, cleanWhatsApp } from '@/utils/validationUtils';

const COUNTRY_CODE_OPTIONS = [
  { value: '+55', label: '🇧🇷 Brasil (+55)' },
  { value: '+1', label: '🇺🇸 EUA (+1)' },
  { value: '+351', label: '🇵🇹 Portugal (+351)' },
  { value: '+34', label: '🇪🇸 Espanha (+34)' },
  { value: '+33', label: '🇫🇷 França (+33)' }
];

const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' }
];

export const StepPersonalInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleWhatsAppChange = (value: string) => {
    // Formatar para exibição
    const formatted = formatWhatsApp(value);
    onUpdate('personal_info', {
      ...data.personal_info,
      whatsapp: formatted
    });
  };

  const handleCountryCodeChange = (value: string) => {
    onUpdate('personal_info', {
      ...data.personal_info,
      country_code: value
    });
  };

  const handleGenderChange = (value: string) => {
    onUpdate('personal_info', {
      ...data.personal_info,
      gender: value
    });
  };

  const handleBirthDateChange = (value: string) => {
    onUpdate('personal_info', {
      ...data.personal_info,
      birth_date: value
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Quem é você? 👋
        </h2>
        <p className="text-gray-400">
          Vamos começar conhecendo você melhor
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Nome completo <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.personal_info.name || ''}
              onChange={(e) => onUpdate('personal_info', {
                ...data.personal_info,
                name: e.target.value
              })}
              placeholder="Seu nome completo"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              E-mail <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              value={data.personal_info.email || ''}
              onChange={(e) => onUpdate('personal_info', {
                ...data.personal_info,
                email: e.target.value
              })}
              placeholder="seu@email.com"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              País <span className="text-red-400">*</span>
            </label>
            <select
              value={data.personal_info.country_code || '+55'}
              onChange={(e) => handleCountryCodeChange(e.target.value)}
              className="h-12 w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-3 focus:ring-viverblue/50"
            >
              {COUNTRY_CODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-white">
              WhatsApp <span className="text-red-400">*</span>
            </label>
            <Input
              type="tel"
              value={data.personal_info.whatsapp || ''}
              onChange={(e) => handleWhatsAppChange(e.target.value)}
              placeholder="(11) 99999-9999"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Data de Nascimento <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              value={data.personal_info.birth_date || ''}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Gênero <span className="text-red-400">*</span>
            </label>
            <RadioGroup
              value={data.personal_info.gender || ''}
              onValueChange={handleGenderChange}
              className="flex flex-col space-y-2"
            >
              {GENDER_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="border-gray-600 text-viverblue"
                  />
                  <Label
                    htmlFor={option.value}
                    className="text-white cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-4">
          <p className="text-sm text-viverblue-light">
            🔒 <strong>Privacidade:</strong> Seus dados são protegidos e utilizados 
            apenas para personalizar sua experiência na plataforma.
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
