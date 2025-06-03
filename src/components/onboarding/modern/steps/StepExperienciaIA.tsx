
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const AI_KNOWLEDGE_OPTIONS = [
  { value: 'iniciante', label: '🌱 Iniciante - Nunca usei IA' },
  { value: 'basico', label: '📚 Básico - Uso ocasional (ChatGPT, etc.)' },
  { value: 'intermediario', label: '💼 Intermediário - Uso regular em algumas tarefas' },
  { value: 'avancado', label: '🚀 Avançado - Uso IA em processos de negócio' },
  { value: 'especialista', label: '🎯 Especialista - Desenvolvo soluções com IA' }
];

const HAS_IMPLEMENTED_OPTIONS = [
  { value: 'nao', label: '❌ Não, nunca implementei' },
  { value: 'tentei', label: '🤔 Tentei, mas não consegui' },
  { value: 'parcial', label: '⚡ Implementei parcialmente' },
  { value: 'sim', label: '✅ Sim, implementei com sucesso' }
];

const TOOL_SUGGESTIONS = [
  'ChatGPT',
  'Google Gemini',
  'Claude',
  'Midjourney',
  'DALL-E',
  'Jasper',
  'Copy.ai',
  'Notion AI',
  'Canva AI',
  'Zapier',
  'Make (Integromat)',
  'Power Automate',
  'Typeform',
  'HubSpot',
  'Salesforce Einstein'
];

const AI_AREAS_SUGGESTIONS = [
  'Atendimento ao cliente',
  'Marketing e vendas',
  'Análise de dados',
  'Automação de processos',
  'Criação de conteúdo',
  'Gestão de leads',
  'E-mail marketing',
  'Chatbots',
  'Análise preditiva',
  'Reconhecimento de imagem',
  'Processamento de linguagem natural',
  'Recomendação de produtos'
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
  const addTool = (tool: string) => {
    const currentTools = data.previous_tools || [];
    if (!currentTools.includes(tool)) {
      onUpdate('previous_tools', [...currentTools, tool]);
    }
  };

  const removeTool = (tool: string) => {
    const currentTools = data.previous_tools || [];
    onUpdate('previous_tools', currentTools.filter(t => t !== tool));
  };

  const addArea = (area: string) => {
    const currentAreas = data.desired_ai_areas || [];
    if (!currentAreas.includes(area)) {
      onUpdate('desired_ai_areas', [...currentAreas, area]);
    }
  };

  const removeArea = (area: string) => {
    const currentAreas = data.desired_ai_areas || [];
    onUpdate('desired_ai_areas', currentAreas.filter(a => a !== area));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sua experiência com IA 🤖
        </h2>
        <p className="text-gray-400">
          Vamos entender seu nível atual para personalizar o conteúdo
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.ai_knowledge_level || ''}
          onChange={(value) => onUpdate('ai_knowledge_level', value)}
          options={AI_KNOWLEDGE_OPTIONS}
          placeholder="Selecione seu nível de conhecimento"
          label="Nível de conhecimento em IA"
          required
        />

        <DropdownModerno
          value={data.has_implemented || ''}
          onChange={(value) => onUpdate('has_implemented', value)}
          options={HAS_IMPLEMENTED_OPTIONS}
          placeholder="Selecione sua experiência"
          label="Já implementou IA na empresa?"
          required
        />

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Ferramentas de IA que já utilizou (opcional)
          </label>
          
          {/* Tools selecionadas */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(data.previous_tools || []).map((tool, index) => (
              <div
                key={index}
                className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{tool}</span>
                <button
                  onClick={() => removeTool(tool)}
                  className="text-green-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Sugestões de ferramentas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TOOL_SUGGESTIONS.map((tool, index) => (
              <button
                key={index}
                onClick={() => addTool(tool)}
                disabled={(data.previous_tools || []).includes(tool)}
                className={`text-left p-2 rounded-lg border transition-colors text-sm ${
                  (data.previous_tools || []).includes(tool)
                    ? 'bg-green-500/20 border-green-500/40 text-green-300 cursor-not-allowed'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'
                }`}
              >
                <Plus size={14} className="inline mr-1" />
                {tool}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Áreas de IA que deseja explorar (opcional)
          </label>
          
          {/* Áreas selecionadas */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(data.desired_ai_areas || []).map((area, index) => (
              <div
                key={index}
                className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{area}</span>
                <button
                  onClick={() => removeArea(area)}
                  className="text-purple-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Sugestões de áreas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {AI_AREAS_SUGGESTIONS.map((area, index) => (
              <button
                key={index}
                onClick={() => addArea(area)}
                disabled={(data.desired_ai_areas || []).includes(area)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  (data.desired_ai_areas || []).includes(area)
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 cursor-not-allowed'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'
                }`}
              >
                <Plus size={16} className="inline mr-2" />
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-yellow-300">
            💡 <strong>Personalização:</strong> Com base na sua experiência, vamos ajustar 
            o nível de complexidade das soluções e sugerir um plano de aprendizado adequado.
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
