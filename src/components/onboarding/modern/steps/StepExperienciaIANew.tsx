
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const AI_KNOWLEDGE_OPTIONS = [
  { value: 'iniciante', label: 'Iniciante - Estou começando agora' },
  { value: 'basico', label: 'Básico - Já experimentei algumas ferramentas' },
  { value: 'intermediario', label: 'Intermediário - Uso regularmente' },
  { value: 'avancado', label: 'Avançado - Uso frequentemente e conheço bem' },
  { value: 'especialista', label: 'Especialista - Trabalho profissionalmente com IA' }
];

const AI_TOOLS_OPTIONS = [
  'ChatGPT', 'Gemini (Google)', 'Midjourney', 'Typebot', 'Make.com',
  'Zapier', 'Claude', 'Microsoft Copilot', 'OpenAI API',
  'ManyChat', 'N8N', 'NicoChat', 'Nenhuma ferramenta'
];

const AI_AREAS_OPTIONS = [
  'Atendimento ao cliente', 'Automação de processos', 'Marketing e vendas',
  'Análise de dados', 'Criação de conteúdo', 'Recursos humanos',
  'Desenvolvimento de produtos', 'Operações internas'
];

export const StepExperienciaIANew: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleToolsChange = (tool: string, checked: boolean) => {
    const currentTools = Array.isArray(data.previous_tools) ? data.previous_tools : [];
    if (checked) {
      onUpdate('previous_tools', [...currentTools, tool]);
    } else {
      onUpdate('previous_tools', currentTools.filter(t => t !== tool));
    }
  };

  const handleAreasChange = (area: string, checked: boolean) => {
    const currentAreas = Array.isArray(data.desired_ai_areas) ? data.desired_ai_areas : [];
    if (checked) {
      onUpdate('desired_ai_areas', [...currentAreas, area]);
    } else {
      onUpdate('desired_ai_areas', currentAreas.filter(a => a !== area));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sua experiência com IA 🤖
        </h2>
        <p className="text-gray-400">
          Vamos entender seu nível atual com inteligência artificial
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Qual seu nível de conhecimento em IA? <span className="text-red-400">*</span>
          </label>
          <Select value={data.ai_knowledge_level || ''} onValueChange={(value) => onUpdate('ai_knowledge_level', value)}>
            <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {AI_KNOWLEDGE_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-white hover:bg-gray-700"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Você já implementou IA no seu negócio? <span className="text-red-400">*</span>
          </label>
          <Select value={data.has_implemented || ''} onValueChange={(value) => onUpdate('has_implemented', value)}>
            <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="sim" className="text-white hover:bg-gray-700">
                Sim, já implementei IA no meu negócio
              </SelectItem>
              <SelectItem value="nao" className="text-white hover:bg-gray-700">
                Não, ainda não implementei IA
              </SelectItem>
              <SelectItem value="testando" className="text-white hover:bg-gray-700">
                Estou testando algumas ferramentas
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Quais ferramentas de IA você já utilizou?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AI_TOOLS_OPTIONS.map((tool) => (
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

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Em quais áreas você gostaria de implementar IA?
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
            <span>Finalizar</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
