
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const PRIMARY_GOAL_OPTIONS = [
  { value: 'automatizar_processos', label: 'Automatizar processos operacionais' },
  { value: 'melhorar_atendimento', label: 'Melhorar atendimento ao cliente' },
  { value: 'aumentar_vendas', label: 'Aumentar vendas e conversões' },
  { value: 'reduzir_custos', label: 'Reduzir custos operacionais' },
  { value: 'analisar_dados', label: 'Melhorar análise de dados' },
  { value: 'otimizar_marketing', label: 'Otimizar estratégias de marketing' },
  { value: 'inovar_produtos', label: 'Inovar produtos/serviços' },
  { value: 'escalar_negocio', label: 'Escalar o negócio rapidamente' }
];

const EXPECTED_OUTCOMES_OPTIONS = [
  'Aumento de 20-30% na produtividade',
  'Redução de 40-50% no tempo de processos manuais',
  'Melhoria de 25-35% na satisfação do cliente',
  'Aumento de 15-25% nas vendas',
  'Redução de 30-40% nos custos operacionais',
  'Maior precisão na tomada de decisões',
  'Automatização de tarefas repetitivas',
  'Criação de vantagem competitiva'
];

const CONTENT_FORMATS_OPTIONS = [
  'Vídeos tutoriais práticos',
  'Guias escritos passo a passo',
  'Templates e ferramentas prontas',
  'Aulas ao vivo e Q&A',
  'Casos de sucesso reais',
  'Comunidade para networking'
];

export const StepObjetivosMetas: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps
}) => {
  const handleExpectedOutcomesChange = (outcome: string, checked: boolean) => {
    const currentOutcomes = Array.isArray(data.expected_outcomes) ? data.expected_outcomes : [];
    if (checked) {
      onUpdate('expected_outcomes', [...currentOutcomes, outcome]);
    } else {
      onUpdate('expected_outcomes', currentOutcomes.filter(o => o !== outcome));
    }
  };

  const handleContentFormatsChange = (format: string, checked: boolean) => {
    const currentFormats = Array.isArray(data.content_formats) ? data.content_formats : [];
    if (checked) {
      onUpdate('content_formats', [...currentFormats, format]);
    } else {
      onUpdate('content_formats', currentFormats.filter(f => f !== format));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Objetivos e Metas 🚀
        </h2>
        <p className="text-gray-400">
          Vamos definir seus objetivos para personalizar sua jornada
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Qual seu principal objetivo com IA? <span className="text-red-400">*</span>
          </label>
          <Select value={data.primary_goal || ''} onValueChange={(value) => onUpdate('primary_goal', value)}>
            <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
              <SelectValue placeholder="Selecione seu objetivo principal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {PRIMARY_GOAL_OPTIONS.map((option) => (
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
            Que resultados você espera alcançar?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXPECTED_OUTCOMES_OPTIONS.map((outcome) => (
              <label key={outcome} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.expected_outcomes) && data.expected_outcomes.includes(outcome)}
                  onCheckedChange={(checked) => handleExpectedOutcomesChange(outcome, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{outcome}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Quais formatos de conteúdo você prefere?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONTENT_FORMATS_OPTIONS.map((format) => (
              <label key={format} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.content_formats) && data.content_formats.includes(format)}
                  onCheckedChange={(checked) => handleContentFormatsChange(format, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{format}</span>
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
            <span>Continuar</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
