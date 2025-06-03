
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const AI_KNOWLEDGE_OPTIONS = [
  { value: 'iniciante', label: '🌱 Iniciante - Pouco ou nenhum conhecimento' },
  { value: 'intermediario', label: '📚 Intermediário - Conhecimento básico' },
  { value: 'avancado', label: '🚀 Avançado - Experiência significativa' }
];

const AI_AREAS_OPTIONS = [
  'Chatbots e Atendimento',
  'Análise de Dados',
  'Automação de Processos',
  'Marketing e Vendas',
  'Geração de Conteúdo',
  'Predição e Forecasting',
  'Reconhecimento de Imagem',
  'Processamento de Linguagem',
  'Sistemas de Recomendação',
  'Detecção de Fraudes'
];

const PREVIOUS_TOOLS_OPTIONS = [
  'ChatGPT',
  'Google Bard',
  'Claude',
  'Midjourney',
  'Stable Diffusion',
  'Zapier',
  'Microsoft Copilot',
  'Notion AI',
  'Copy.ai',
  'Jasper'
];

export const StepExperienciaIA: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleAreasChange = (area: string, checked: boolean) => {
    const currentAreas = Array.isArray(data.desired_ai_areas) ? data.desired_ai_areas : [];
    if (checked) {
      onUpdate('desired_ai_areas', [...currentAreas, area]);
    } else {
      onUpdate('desired_ai_areas', currentAreas.filter(a => a !== area));
    }
  };

  const handleToolsChange = (tool: string, checked: boolean) => {
    const currentTools = Array.isArray(data.previous_tools) ? data.previous_tools : [];
    if (checked) {
      onUpdate('previous_tools', [...currentTools, tool]);
    } else {
      onUpdate('previous_tools', currentTools.filter(t => t !== tool));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Experiência com IA 🤖
        </h2>
        <p className="text-gray-400">
          Conte-nos sobre sua experiência atual com inteligência artificial
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.ai_knowledge_level || ''}
          onChange={(value) => onUpdate('ai_knowledge_level', value)}
          options={AI_KNOWLEDGE_OPTIONS}
          placeholder="Selecione seu nível"
          label="Nível de conhecimento em IA"
          required
        />

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Áreas de IA de interesse <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AI_AREAS_OPTIONS.map((area) => (
              <label key={area} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.desired_ai_areas) && data.desired_ai_areas.includes(area)}
                  onCheckedChange={(checked) => handleAreasChange(area, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{area}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Ferramentas de IA já utilizadas (opcional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PREVIOUS_TOOLS_OPTIONS.map((tool) => (
              <label key={tool} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.previous_tools) && data.previous_tools.includes(tool)}
                  onCheckedChange={(checked) => handleToolsChange(tool, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{tool}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            🎯 <strong>Personalização:</strong> Com base na sua experiência, 
            criaremos uma trilha de implementação adequada ao seu nível.
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
