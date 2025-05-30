
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Rio_Branco', label: 'Acre (GMT-5)' },
  { value: 'America/New_York', label: 'Nova York (GMT-5)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' }
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
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Localização e Redes Sociais 🌍
        </h2>
        <p className="text-gray-400">
          Onde você está e como podemos te encontrar nas redes
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              País <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.country || ''}
              onChange={(e) => onUpdate('country', e.target.value)}
              placeholder="Brasil"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Estado <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.state || ''}
              onChange={(e) => onUpdate('state', e.target.value)}
              placeholder="São Paulo"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
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
              placeholder="São Paulo"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Fuso Horário
          </label>
          <Select value={data.timezone || ''} onValueChange={(value) => onUpdate('timezone', value)}>
            <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
              <SelectValue placeholder="Selecione seu fuso horário" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {TIMEZONE_OPTIONS.map((option) => (
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              LinkedIn (opcional)
            </label>
            <Input
              type="url"
              value={data.linkedin_url || ''}
              onChange={(e) => onUpdate('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/seu-perfil"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Instagram (opcional)
            </label>
            <Input
              type="text"
              value={data.instagram_url || ''}
              onChange={(e) => onUpdate('instagram_url', e.target.value)}
              placeholder="@seu.perfil"
              className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
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
