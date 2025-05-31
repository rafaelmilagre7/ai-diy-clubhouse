
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

const COUNTRY_OPTIONS = [
  { value: 'Brasil', label: '🇧🇷 Brasil' },
  { value: 'Estados Unidos', label: '🇺🇸 Estados Unidos' },
  { value: 'Portugal', label: '🇵🇹 Portugal' },
  { value: 'Espanha', label: '🇪🇸 Espanha' },
  { value: 'França', label: '🇫🇷 França' }
];

export const StepLocationInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const { location_info } = data;

  const handleUpdate = (field: string, value: string) => {
    onUpdate('location_info', {
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          País <span className="text-red-400">*</span>
        </label>
        <select
          value={location_info.country || ''}
          onChange={(e) => handleUpdate('country', e.target.value)}
          className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
        >
          <option value="">Selecione seu país</option>
          {COUNTRY_OPTIONS.map(country => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Estado/Região <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={location_info.state || ''}
            onChange={(e) => handleUpdate('state', e.target.value)}
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
            value={location_info.city || ''}
            onChange={(e) => handleUpdate('city', e.target.value)}
            placeholder="Ex: São Paulo"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Instagram (opcional)
          </label>
          <Input
            type="url"
            value={location_info.instagram_url || ''}
            onChange={(e) => handleUpdate('instagram_url', e.target.value)}
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
            value={location_info.linkedin_url || ''}
            onChange={(e) => handleUpdate('linkedin_url', e.target.value)}
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
        
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2 px-8"
        >
          <span>Continuar</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
