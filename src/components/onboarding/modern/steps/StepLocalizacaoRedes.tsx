
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const COUNTRY_OPTIONS = [
  { value: 'BR', label: '🇧🇷 Brasil' },
  { value: 'US', label: '🇺🇸 Estados Unidos' },
  { value: 'PT', label: '🇵🇹 Portugal' },
  { value: 'ES', label: '🇪🇸 Espanha' },
  { value: 'FR', label: '🇫🇷 França' }
];

export const StepLocalizacaoRedes: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Onde você está? 🌍
        </h2>
        <p className="text-gray-400">
          Nos ajude a entender sua localização para personalizar sua experiência
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.country || ''}
          onChange={(value) => onUpdate('country', value)}
          options={COUNTRY_OPTIONS}
          placeholder="Selecione seu país"
          label="País"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Estado/Região <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.state || ''}
              onChange={(e) => onUpdate('state', e.target.value)}
              placeholder="Ex: São Paulo"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Cidade <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.city || ''}
              onChange={(e) => onUpdate('city', e.target.value)}
              placeholder="Ex: São Paulo"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Fuso horário
          </label>
          <Input
            type="text"
            value={data.timezone || ''}
            onChange={(e) => onUpdate('timezone', e.target.value)}
            placeholder="Ex: America/Sao_Paulo"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Instagram (opcional)
            </label>
            <Input
              type="url"
              value={data.instagram_url || ''}
              onChange={(e) => onUpdate('instagram_url', e.target.value)}
              placeholder="https://instagram.com/seuusuario"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              LinkedIn (opcional)
            </label>
            <Input
              type="url"
              value={data.linkedin_url || ''}
              onChange={(e) => onUpdate('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/seuusuario"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
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
