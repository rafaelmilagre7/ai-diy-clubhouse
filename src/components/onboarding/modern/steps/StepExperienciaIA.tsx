
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const AI_KNOWLEDGE_OPTIONS = [
  { value: 'iniciante', label: '🌱 Iniciante - Estou começando agora' },
  { value: 'basico', label: '📚 Básico - Já experimentei algumas ferramentas' },
  { value: 'intermediario', label: '⚡ Intermediário - Uso regularmente' },
  { value: 'avancado', label: '🚀 Avançado - Uso frequentemente e conheço bem' },
  { value: 'especialista', label: '🎯 Especialista - Trabalho profissionalmente com IA' }
];

const HAS_IMPLEMENTED_OPTIONS = [
  { value: 'sim', label: '✅ Sim, já implementei IA no meu negócio' },
  { value: 'nao', label: '❌ Não, ainda não implementei IA' },
  { value: 'testando', label: '🧪 Estou testando algumas ferramentas' }
];

export const StepExperienciaIA: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sua experiência com IA 🤖
        </h2>
        <p className="text-gray-400">
          Vamos entender seu nível atual com inteligência artificial
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.ai_knowledge_level || ''}
          onChange={(value) => onUpdate('ai_knowledge_level', value)}
          options={AI_KNOWLEDGE_OPTIONS}
          placeholder="Selecione seu nível de conhecimento"
          label="Qual seu nível de conhecimento em IA?"
          required
        />

        <DropdownModerno
          value={data.has_implemented || ''}
          onChange={(value) => onUpdate('has_implemented', value)}
          options={HAS_IMPLEMENTED_OPTIONS}
          placeholder="Selecione uma opção"
          label="Você já implementou IA no seu negócio?"
          required
        />

        <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-4">
          <p className="text-sm text-viverblue-light">
            🎯 <strong>Importante:</strong> Essas informações nos ajudam a personalizar 
            sua trilha de implementação e recomendar as melhores soluções para seu nível atual.
          </p>
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
