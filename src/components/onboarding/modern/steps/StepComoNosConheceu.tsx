
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const HOW_FOUND_US_OPTIONS = [
  { value: 'google', label: '🔍 Pesquisa no Google' },
  { value: 'youtube', label: '📺 YouTube' },
  { value: 'instagram', label: '📷 Instagram' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'facebook', label: '📘 Facebook' },
  { value: 'indicacao_amigo', label: '👥 Indicação de amigo/conhecido' },
  { value: 'evento', label: '🎪 Evento/Palestra' },
  { value: 'podcast', label: '🎧 Podcast' },
  { value: 'blog_artigo', label: '📝 Blog/Artigo' },
  { value: 'publicidade', label: '📢 Publicidade online' },
  { value: 'outro', label: '🔄 Outro' }
];

export const StepComoNosConheceu: React.FC<OnboardingStepProps> = ({
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
          Como nos conheceu? 🤝
        </h2>
        <p className="text-gray-400">
          Queremos entender como você chegou até nós
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.how_found_us || ''}
          onChange={(value) => onUpdate('how_found_us', value)}
          options={HOW_FOUND_US_OPTIONS}
          placeholder="Selecione como nos conheceu"
          label="Como nos conheceu?"
          required
        />

        {(data.how_found_us === 'indicacao_amigo' || data.how_found_us === 'outro') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {data.how_found_us === 'indicacao_amigo' 
                ? 'Quem te indicou?' 
                : 'Conte-nos mais detalhes'
              }
            </label>
            <Input
              type="text"
              value={data.referred_by || ''}
              onChange={(e) => onUpdate('referred_by', e.target.value)}
              placeholder={
                data.how_found_us === 'indicacao_amigo'
                  ? "Nome da pessoa que te indicou"
                  : "Descreva como nos conheceu"
              }
              className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
            />
          </div>
        )}

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-300">
            📊 <strong>Feedback valioso:</strong> Essas informações nos ajudam a 
            melhorar nossos canais de comunicação e chegar a mais pessoas como você.
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
