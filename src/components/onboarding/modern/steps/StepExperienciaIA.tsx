
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const AI_KNOWLEDGE_LEVELS = [
  { value: 'iniciante', label: '🌱 Iniciante - Pouco ou nenhum conhecimento' },
  { value: 'basico', label: '📚 Básico - Conheço alguns conceitos' },
  { value: 'intermediario', label: '🔧 Intermediário - Já usei algumas ferramentas' },
  { value: 'avancado', label: '⚡ Avançado - Implemento soluções regularmente' },
  { value: 'especialista', label: '🎯 Especialista - Desenvolvo IA no negócio' }
];

const HAS_IMPLEMENTED_OPTIONS = [
  { value: 'sim', label: 'Sim, já implementei' },
  { value: 'nao', label: 'Não, ainda não implementei' },
  { value: 'testando', label: 'Estou testando algumas ferramentas' }
];

const AI_TOOLS = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'copilot', label: 'GitHub Copilot' },
  { value: 'zapier', label: 'Zapier AI' },
  { value: 'notion', label: 'Notion AI' },
  { value: 'canva', label: 'Canva AI' },
  { value: 'outras', label: 'Outras ferramentas' }
];

const DESIRED_AI_AREAS = [
  { value: 'chatbots', label: 'Chatbots e Atendimento' },
  { value: 'automacao', label: 'Automação de Processos' },
  { value: 'marketing', label: 'Marketing e Vendas' },
  { value: 'analise-dados', label: 'Análise de Dados' },
  { value: 'conteudo', label: 'Criação de Conteúdo' },
  { value: 'design', label: 'Design e Criação Visual' },
  { value: 'programacao', label: 'Programação e Desenvolvimento' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'financeiro', label: 'Financeiro e Contabilidade' }
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
  const selectedTools = Array.isArray(data.previous_tools) ? data.previous_tools : [];
  const selectedAreas = Array.isArray(data.desired_ai_areas) ? data.desired_ai_areas : [];

  const toggleTool = (tool: string) => {
    const updated = selectedTools.includes(tool)
      ? selectedTools.filter(t => t !== tool)
      : [...selectedTools, tool];
    onUpdate('previous_tools', updated);
  };

  const toggleArea = (area: string) => {
    const updated = selectedAreas.includes(area)
      ? selectedAreas.filter(a => a !== area)
      : [...selectedAreas, area];
    onUpdate('desired_ai_areas', updated);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Experiência com IA 🤖
        </h2>
        <p className="text-gray-400">
          Conte-nos sobre seu conhecimento e experiência com inteligência artificial
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.ai_knowledge_level || ''}
          onChange={(value) => onUpdate('ai_knowledge_level', value)}
          options={AI_KNOWLEDGE_LEVELS}
          placeholder="Selecione seu nível"
          label="Qual seu nível de conhecimento em IA?"
          required
        />

        <DropdownModerno
          value={data.has_implemented || ''}
          onChange={(value) => onUpdate('has_implemented', value)}
          options={HAS_IMPLEMENTED_OPTIONS}
          placeholder="Selecione uma opção"
          label="Já implementou IA no seu negócio?"
          required
        />

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Ferramentas de IA que já utilizou (opcional)
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AI_TOOLS.map((tool) => (
              <div
                key={tool.value}
                onClick={() => toggleTool(tool.value)}
                className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                  selectedTools.includes(tool.value)
                    ? 'border-viverblue bg-viverblue/10 text-viverblue'
                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-sm">{tool.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Áreas de IA que tem interesse (opcional)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DESIRED_AI_AREAS.map((area) => (
              <div
                key={area.value}
                onClick={() => toggleArea(area.value)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedAreas.includes(area.value)
                    ? 'border-viverblue bg-viverblue/10 text-viverblue'
                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-sm">{area.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
          <p className="text-sm text-cyan-400">
            🧠 <strong>Personalização:</strong> Com base na sua experiência, vamos personalizar 
            o conteúdo e recomendações para seu nível de conhecimento.
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
