
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
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'MX', label: '🇲🇽 México' },
  { value: 'CO', label: '🇨🇴 Colômbia' },
  { value: 'PE', label: '🇵🇪 Peru' },
  { value: 'CL', label: '🇨🇱 Chile' },
  { value: 'UY', label: '🇺🇾 Uruguai' },
  { value: 'OTHER', label: '🌍 Outro país' }
];

const BRAZILIAN_STATES = [
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

export const StepLocalizacaoRedes: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const isBrazil = data.country === 'BR';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Localização e redes sociais 📍
        </h2>
        <p className="text-gray-400">
          Onde você está localizado e como podemos nos conectar
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

        {isBrazil && (
          <DropdownModerno
            value={data.state || ''}
            onChange={(value) => onUpdate('state', value)}
            options={BRAZILIAN_STATES}
            placeholder="Selecione seu estado"
            label="Estado"
            required
          />
        )}

        {!isBrazil && data.country && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Estado/Região <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.state || ''}
              onChange={(e) => onUpdate('state', e.target.value)}
              placeholder="Digite seu estado ou região"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Cidade <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={data.city || ''}
            onChange={(e) => onUpdate('city', e.target.value)}
            placeholder="Digite sua cidade"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Instagram (opcional)
            </label>
            <Input
              type="text"
              value={data.instagram_url || ''}
              onChange={(e) => onUpdate('instagram_url', e.target.value)}
              placeholder="@seuusuario ou link completo"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              LinkedIn (opcional)
            </label>
            <Input
              type="text"
              value={data.linkedin_url || ''}
              onChange={(e) => onUpdate('linkedin_url', e.target.value)}
              placeholder="Link do seu perfil LinkedIn"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-sm text-purple-300">
            🌐 <strong>Networking:</strong> Suas redes sociais nos ajudam a 
            conectar você com outros membros da sua região e área de interesse.
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
