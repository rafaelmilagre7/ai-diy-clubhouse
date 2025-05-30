
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const AI_KNOWLEDGE_OPTIONS = [
  { value: 'iniciante', label: 'Iniciante - Pouco ou nenhum conhecimento' },
  { value: 'basico', label: 'Básico - Já usei algumas ferramentas' },
  { value: 'intermediario', label: 'Intermediário - Uso regularmente' },
  { value: 'avancado', label: 'Avançado - Implemento soluções' },
  { value: 'especialista', label: 'Especialista - Desenvolvo IA' }
];

const USES_AI_OPTIONS = [
  { value: 'nunca', label: 'Nunca usei IA no trabalho' },
  { value: 'raramente', label: 'Raramente (menos de 1x/semana)' },
  { value: 'ocasionalmente', label: 'Ocasionalmente (1-3x/semana)' },
  { value: 'frequentemente', label: 'Frequentemente (4-6x/semana)' },
  { value: 'diariamente', label: 'Diariamente' }
];

const MAIN_GOAL_OPTIONS = [
  { value: 'reduzir-custos', label: 'Reduzir custos operacionais' },
  { value: 'aumentar-receita', label: 'Aumentar receita' },
  { value: 'automatizar-processos', label: 'Automatizar processos' },
  { value: 'melhorar-produtividade', label: 'Melhorar produtividade' },
  { value: 'inovar-produtos', label: 'Inovar produtos/serviços' },
  { value: 'melhorar-experiencia', label: 'Melhorar experiência do cliente' },
  { value: 'tomar-decisoes', label: 'Tomar decisões baseadas em dados' },
  { value: 'competitividade', label: 'Manter competitividade' }
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
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Experiência com IA 🤖
        </h2>
        <p className="text-gray-400">
          Conte-nos sobre seu nível de conhecimento e objetivos com inteligência artificial
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <div className="space-y-2">
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Com que frequência você usa IA no trabalho? <span className="text-red-400">*</span>
          </label>
          <Select value={data.uses_ai || ''} onValueChange={(value) => onUpdate('uses_ai', value)}>
            <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {USES_AI_OPTIONS.map((option) => (
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Qual seu principal objetivo com IA? <span className="text-red-400">*</span>
          </label>
          <Select value={data.main_goal || ''} onValueChange={(value) => onUpdate('main_goal', value)}>
            <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
              <SelectValue placeholder="Selecione seu principal objetivo" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {MAIN_GOAL_OPTIONS.map((option) => (
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
            <span>Finalizar Dados</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
