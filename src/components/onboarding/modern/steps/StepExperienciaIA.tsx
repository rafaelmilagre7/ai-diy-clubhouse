
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { RealtimeFieldValidation } from '../RealtimeFieldValidation';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';
import { DropdownModerno } from '../DropdownModerno';
import { Textarea } from '@/components/ui/textarea';

const AI_KNOWLEDGE_OPTIONS = [
  { value: 'iniciante', label: '🌱 Iniciante - Pouco ou nenhum conhecimento' },
  { value: 'basico', label: '📚 Básico - Já ouvi falar, mas nunca usei' },
  { value: 'intermediario', label: '⚡ Intermediário - Uso algumas ferramentas' },
  { value: 'avancado', label: '🚀 Avançado - Uso IA no dia a dia' },
  { value: 'especialista', label: '🎯 Especialista - Implemento soluções complexas' }
];

const PREVIOUS_TOOLS_OPTIONS = [
  'ChatGPT',
  'Google Bard/Gemini',
  'Claude',
  'Midjourney',
  'DALL-E',
  'Stable Diffusion',
  'Notion AI',
  'Copy.ai',
  'Jasper',
  'Canva AI',
  'Loom AI',
  'Zapier AI',
  'Outro'
];

const HAS_IMPLEMENTED_OPTIONS = [
  { value: 'sim', label: '✅ Sim, já implementei IA no negócio' },
  { value: 'nao', label: '❌ Não, ainda não implementei' },
  { value: 'planejando', label: '🎯 Estou planejando implementar' }
];

const DESIRED_AI_AREAS_OPTIONS = [
  'Atendimento ao cliente (chatbots)',
  'Automação de processos',
  'Análise de dados e relatórios',
  'Criação de conteúdo',
  'Marketing e vendas',
  'Gestão de projetos',
  'Recursos humanos',
  'Financeiro e contabilidade',
  'Logística e supply chain',
  'Desenvolvimento de produtos'
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
          Experiência com IA 🤖
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
            Ferramentas de IA que já utilizou <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione as ferramentas que já usou (múltipla escolha)
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
                      <span className="text-viverblue">✓</span>
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
          placeholder="Selecione uma opção"
          label="Já implementou IA no seu negócio?"
          required
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Áreas de interesse para IA <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Selecione as áreas onde gostaria de implementar IA (múltipla escolha)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DESIRED_AI_AREAS_OPTIONS.map((area) => {
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
          <RealtimeFieldValidation validation={getFieldValidation('desired_ai_areas')} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Sugestões de melhoria <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <Textarea
            value={data.improvement_suggestions || ''}
            onChange={(e) => onUpdate('improvement_suggestions', e.target.value)}
            placeholder="Compartilhe suas sugestões para melhorarmos a Viver de IA..."
            className="min-h-[100px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
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
