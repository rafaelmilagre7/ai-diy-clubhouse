
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';
import { DateInput } from '../DateInput';

const COUNTRY_CODE_OPTIONS = [
  { value: '+55', label: '🇧🇷 Brasil (+55)' },
  { value: '+1', label: '🇺🇸 EUA (+1)' },
  { value: '+351', label: '🇵🇹 Portugal (+351)' },
  { value: '+34', label: '🇪🇸 Espanha (+34)' },
  { value: '+33', label: '🇫🇷 França (+33)' }
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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Quem é você? 👋
        </h2>
        <p className="text-gray-400">
          Vamos começar conhecendo você melhor
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Nome completo <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.name || ''}
              onChange={(e) => onUpdate('name', e.target.value)}
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
              value={data.email || ''}
              onChange={(e) => onUpdate('email', e.target.value)}
              placeholder="seu@email.com"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DropdownModerno
            value={data.country_code || '+55'}
            onChange={(value) => onUpdate('country_code', value)}
            options={COUNTRY_CODE_OPTIONS}
            placeholder="País"
            label="País"
            required
          />

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
          </div>
        </div>

        <DateInput
          value={data.birth_date || ''}
          onChange={(value) => onUpdate('birth_date', value)}
          required
        />

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
