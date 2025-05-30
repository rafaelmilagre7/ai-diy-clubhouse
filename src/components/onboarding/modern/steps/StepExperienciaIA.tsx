
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { RealtimeFieldValidation } from '../RealtimeFieldValidation';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';
import { DropdownModerno } from '../DropdownModerno';
import { SliderInput } from '../SliderInput';

const AI_KNOWLEDGE_OPTIONS = [
  { value: 'iniciante', label: '🌱 Iniciante (nunca usei IA)' },
  { value: 'basico', label: '📚 Básico (já testei algumas ferramentas)' },
  { value: 'intermediario', label: '⚡ Intermediário (uso regularmente)' },
  { value: 'avancado', label: '🚀 Avançado (implemento soluções)' },
  { value: 'expert', label: '🎯 Expert (desenvolvo soluções)' }
];

const PREVIOUS_TOOLS_OPTIONS = [
  'ChatGPT',
  'Claude',
  'Midjourney/DALL-E',
  'Notion AI',
  'Copy.ai',
  'Jasper',
  'GitHub Copilot',
  'Zapier AI',
  'Canva AI',
  'Google Bard',
  'Microsoft Copilot',
  'Nenhuma'
];

const HAS_IMPLEMENTED_OPTIONS = [
  { value: 'sim', label: '✅ Sim, já implementei' },
  { value: 'testando', label: '🧪 Estou testando/pilotando' },
  { value: 'planejando', label: '📋 Estou planejando' },
  { value: 'nao', label: '❌ Não, ainda não' }
];

const DESIRED_AREAS_OPTIONS = [
  'Atendimento ao cliente (chatbots)',
  'Automação de processos',
  'Análise de dados e relatórios',
  'Criação de conteúdo',
  'Personalização de experiência',
  'Detecção de fraudes',
  'Previsão de vendas',
  'Otimização de marketing',
  'Recursos humanos (recrutamento)',
  'Gestão de estoque'
];

export const StepExperienciaIA: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const { getFieldValidation } = useRealtimeValidation(data, currentStep);

  const handleToolToggle = (tool: string) => {
    const currentTools = data.previous_tools || [];
    const isSelected = currentTools.includes(tool);
    
    if (isSelected) {
      onUpdate('previous_tools', currentTools.filter(t => t !== tool));
    } else {
      onUpdate('previous_tools', [...currentTools, tool]);
    }
  };

  const handleAreaToggle = (area: string) => {
    const currentAreas = data.desired_ai_areas || [];
    const isSelected = currentAreas.includes(area);
    
    if (isSelected) {
      onUpdate('desired_ai_areas', currentAreas.filter(a => a !== area));
    } else {
      onUpdate('desired_ai_areas', [...currentAreas, area]);
    }
  };

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
          placeholder="Selecione seu nível"
          label="Qual seu nível de conhecimento em IA?"
          required
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Ferramentas que já utilizou <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione as ferramentas de IA que já experimentou (múltipla escolha)
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PREVIOUS_TOOLS_OPTIONS.map((tool) => {
              const isSelected = (data.previous_tools || []).includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => handleToolToggle(tool)}
                  className={`
                    p-3 rounded-lg border text-left text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{tool}</span>
                    {isSelected && (
                      <span className="text-viverblue text-xs">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <DropdownModerno
          value={data.has_implemented || ''}
          onChange={(value) => onUpdate('has_implemented', value)}
          options={HAS_IMPLEMENTED_OPTIONS}
          placeholder="Selecione sua situação"
          label="Já implementou IA em seu negócio?"
          required
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Áreas de interesse <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione as áreas onde gostaria de implementar IA (múltipla escolha)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DESIRED_AREAS_OPTIONS.map((area) => {
              const isSelected = (data.desired_ai_areas || []).includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAreaToggle(area)}
                  className={`
                    p-3 rounded-lg border text-left text-sm transition-all
                    ${isSelected 
                      ? 'bg-viverblue/20 border-viverblue text-viverblue-light' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{area}</span>
                    {isSelected && (
                      <span className="text-viverblue">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
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
