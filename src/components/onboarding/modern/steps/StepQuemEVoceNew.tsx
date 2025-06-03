
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DateInput } from '../DateInput';

const COUNTRY_CODE_OPTIONS = [
  { value: '+55', label: '🇧🇷 +55 (Brasil)' },
  { value: '+1', label: '🇺🇸 +1 (EUA/Canadá)' },
  { value: '+351', label: '🇵🇹 +351 (Portugal)' },
  { value: '+34', label: '🇪🇸 +34 (Espanha)' },
  { value: '+54', label: '🇦🇷 +54 (Argentina)' },
  { value: '+52', label: '🇲🇽 +52 (México)' },
  { value: '+57', label: '🇨🇴 +57 (Colômbia)' }
];

export const StepQuemEVoceNew: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Quem é você? 👋
        </h2>
        <p className="text-gray-400">
          Vamos começar conhecendo você melhor
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Nome completo <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={data.name || ''}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Digite seu nome completo"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Código do país <span className="text-red-400">*</span>
            </label>
            <select
              value={data.country_code || '+55'}
              onChange={(e) => onUpdate('country_code', e.target.value)}
              className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
            >
              {COUNTRY_CODE_OPTIONS.map(option => (
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
              value={data.whatsapp || ''}
              onChange={(e) => onUpdate('whatsapp', e.target.value)}
              placeholder="11999999999"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        </div>

        <DateInput
          value={data.birth_date || ''}
          onChange={(value) => onUpdate('birth_date', value)}
          label="Data de nascimento (opcional)"
          placeholder="DD/MM/AAAA"
        />

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            🔒 <strong>Seus dados estão seguros:</strong> Utilizamos suas informações 
            apenas para personalizar sua experiência e entrar em contato quando necessário.
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
            <span>Começar</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
