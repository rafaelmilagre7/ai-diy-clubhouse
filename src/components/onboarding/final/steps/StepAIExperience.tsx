
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepComponentProps } from '@/types/onboardingFinal';

const AI_LEVELS = [
  { value: 'iniciante', label: 'Iniciante - Pouco ou nenhum conhecimento' },
  { value: 'basico', label: 'Básico - Já usei algumas ferramentas' },
  { value: 'intermediario', label: 'Intermediário - Tenho experiência prática' },
  { value: 'avancado', label: 'Avançado - Implemento soluções regularmente' }
];

const IMPLEMENTATION_OPTIONS = [
  'Nunca implementei',
  'Tentei mas não consegui',
  'Implementei parcialmente',
  'Implementei com sucesso'
];

export const StepAIExperience: React.FC<OnboardingStepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed
}) => {
  const { ai_experience } = data;

  const handleUpdate = (field: string, value: string | number) => {
    onUpdate('ai_experience', {
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Nível de conhecimento em IA <span className="text-red-400">*</span>
        </label>
        <div className="space-y-3">
          {AI_LEVELS.map(level => (
            <button
              key={level.value}
              type="button"
              onClick={() => handleUpdate('ai_knowledge_level', level.value)}
              className={`w-full p-4 text-left rounded-lg border transition-all ${
                ai_experience.ai_knowledge_level === level.value
                  ? 'bg-viverblue/20 border-viverblue text-viverblue'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Já implementou IA no seu negócio? <span className="text-red-400">*</span>
        </label>
        <select
          value={ai_experience.has_implemented || ''}
          onChange={(e) => handleUpdate('has_implemented', e.target.value)}
          className="h-12 w-full px-3 bg-gray-800/50 border border-gray-600 text-white rounded-md focus:ring-viverblue/50"
        >
          <option value="">Selecione uma opção</option>
          {IMPLEMENTATION_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
