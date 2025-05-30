
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';
import { SocialLinksInput } from '../SocialLinksInput';

const COUNTRY_OPTIONS = [
  { value: 'BR', label: '🇧🇷 Brasil' },
  { value: 'US', label: '🇺🇸 Estados Unidos' },
  { value: 'PT', label: '🇵🇹 Portugal' },
  { value: 'ES', label: '🇪🇸 Espanha' }
];

const BRAZIL_STATES = [
  { value: 'SP', label: 'São Paulo' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'PR', label: 'Paraná' },
  { value: 'SC', label: 'Santa Catarina' }
];

const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'Brasília (UTC-3)' },
  { value: 'America/New_York', label: 'Nova York (UTC-5)' },
  { value: 'Europe/Lisbon', label: 'Lisboa (UTC+0)' }
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
          Localização e redes sociais 🌎
        </h2>
        <p className="text-gray-400">
          Nos ajude a entender onde você está e como se conectar
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DropdownModerno
            value={data.country || ''}
            onChange={(value) => onUpdate('country', value)}
            options={COUNTRY_OPTIONS}
            placeholder="Selecione o país"
            label="País"
            required
          />

          <DropdownModerno
            value={data.state || ''}
            onChange={(value) => onUpdate('state', value)}
            options={BRAZIL_STATES}
            placeholder="Selecione o estado"
            label="Estado"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Cidade <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.city || ''}
              onChange={(e) => onUpdate('city', e.target.value)}
              placeholder="Sua cidade"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>

          <DropdownModerno
            value={data.timezone || ''}
            onChange={(value) => onUpdate('timezone', value)}
            options={TIMEZONE_OPTIONS}
            placeholder="Selecione o fuso horário"
            label="Fuso horário"
            required
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">
            Redes sociais <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </h3>
          
          <SocialLinksInput
            instagramValue={data.instagram_url || ''}
            linkedinValue={data.linkedin_url || ''}
            onInstagramChange={(value) => onUpdate('instagram_url', value)}
            onLinkedinChange={(value) => onUpdate('linkedin_url', value)}
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            📍 <strong>Localização:</strong> Usamos essas informações para conectar 
            você com outros membros da sua região e personalizar horários de eventos.
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
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
