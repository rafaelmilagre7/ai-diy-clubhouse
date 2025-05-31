
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

export const StepPersonalInfo: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed
}) => {
  const { personal_info } = data;

  const handleUpdate = (field: string, value: string) => {
    onUpdate('personal_info', {
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Nome completo <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={personal_info.name || ''}
            onChange={(e) => handleUpdate('name', e.target.value)}
            placeholder="Seu nome completo"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Email <span className="text-red-400">*</span>
          </label>
          <Input
            type="email"
            value={personal_info.email || ''}
            onChange={(e) => handleUpdate('email', e.target.value)}
            placeholder="seu@email.com"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Código do País
          </label>
          <select
            value={personal_info.country_code || '+55'}
            onChange={(e) => handleUpdate('country_code', e.target.value)}
            className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
          >
            <option value="+55">🇧🇷 +55</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+351">🇵🇹 +351</option>
            <option value="+34">🇪🇸 +34</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-white">
            WhatsApp <span className="text-red-400">*</span>
          </label>
          <Input
            type="tel"
            value={personal_info.whatsapp || ''}
            onChange={(e) => handleUpdate('whatsapp', e.target.value)}
            placeholder="(11) 99999-9999"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Data de nascimento (opcional)
        </label>
        <Input
          type="date"
          value={personal_info.birth_date || ''}
          onChange={(e) => handleUpdate('birth_date', e.target.value)}
          className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
        />
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-700">
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
