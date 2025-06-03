
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { CountrySelector } from '../CountrySelector';

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
          Nos ajude a entender sua localização e como nos conectarmos
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CountrySelector
            value={data.country || ''}
            onChange={(value) => onUpdate('country', value)}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Estado/Região <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.state || ''}
              onChange={(e) => onUpdate('state', e.target.value)}
              placeholder="Ex: São Paulo, Lisboa"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
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
              placeholder="Ex: São Paulo, Porto"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Fuso Horário <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={data.timezone || ''}
              onChange={(e) => onUpdate('timezone', e.target.value)}
              placeholder="Ex: GMT-3, GMT+0"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Redes Sociais (Opcional)</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Instagram
            </label>
            <Input
              type="url"
              value={data.instagram_url || ''}
              onChange={(e) => onUpdate('instagram_url', e.target.value)}
              placeholder="https://instagram.com/seuperfil"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              LinkedIn
            </label>
            <Input
              type="url"
              value={data.linkedin_url || ''}
              onChange={(e) => onUpdate('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/seuperfil"
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            🌐 <strong>Personalização:</strong> Essas informações nos ajudam a conectar você 
            com outros membros da sua região e personalizar horários de eventos.
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="ghost"
            className="text-gray-400 hover:text-white flex items-center gap-2"
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
