
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { RealtimeFieldValidation } from '../RealtimeFieldValidation';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';
import { CountrySelector } from '../CountrySelector';
import { SocialLinksInput } from '../SocialLinksInput';
import { DropdownModerno } from '../DropdownModerno';
import { TimezoneInput } from '../../steps/inputs/TimezoneInput';

const STATE_OPTIONS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Rio_Branco', label: 'Acre (GMT-5)' }
];

export const StepLocalizacaoRedes: React.FC<OnboardingStepProps> = ({
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
          Onde você está? 🌍
        </h2>
        <p className="text-gray-400">
          Vamos entender sua localização e redes sociais
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              País <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.country || ''}
              onChange={(e) => onUpdate('country', e.target.value)}
              placeholder="Brasil"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
            <RealtimeFieldValidation validation={getFieldValidation('country')} />
          </div>

          <DropdownModerno
            value={data.state || ''}
            onChange={(value) => onUpdate('state', value)}
            options={STATE_OPTIONS}
            placeholder="Selecione seu estado"
            label="Estado"
            required
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
            placeholder="Sua cidade"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
          <RealtimeFieldValidation validation={getFieldValidation('city')} />
        </div>

        <DropdownModerno
          value={data.timezone || ''}
          onChange={(value) => onUpdate('timezone', value)}
          options={TIMEZONE_OPTIONS}
          placeholder="Selecione seu fuso horário"
          label="Fuso Horário"
          required
        />

        <div className="pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Redes Sociais <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </h3>
          <SocialLinksInput
            instagramValue={data.instagram_url || ''}
            linkedinValue={data.linkedin_url || ''}
            onInstagramChange={(value) => onUpdate('instagram_url', value)}
            onLinkedinChange={(value) => onUpdate('linkedin_url', value)}
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
