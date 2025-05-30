
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const MAIN_GOAL_OPTIONS = [
  { value: 'automatizar', label: 'Automatizar processos manuais' },
  { value: 'produtividade', label: 'Aumentar produtividade da equipe' },
  { value: 'vendas', label: 'Melhorar processo de vendas' },
  { value: 'atendimento', label: 'Otimizar atendimento ao cliente' },
  { value: 'decisoes', label: 'Melhorar tomada de decisões' },
  { value: 'custos', label: 'Reduzir custos operacionais' },
  { value: 'inovacao', label: 'Acelerar inovação' },
  { value: 'competitividade', label: 'Manter vantagem competitiva' }
];

const EXPECTED_OUTCOMES_OPTIONS = [
  'Redução de tempo em tarefas manuais',
  'Melhoria na qualidade do atendimento',
  'Aumento na taxa de conversão',
  'Decisões mais rápidas e precisas',
  'Redução de custos operacionais',
  'Melhoria na experiência do cliente',
  'Aumento da produtividade da equipe',
  'Automatização de processos-chave',
  'Insights mais profundos dos dados',
  'Diferenciação competitiva'
];

const PRIORITY_SOLUTION_TYPES = [
  { value: 'chatbot', label: 'Chatbot/Atendimento Automatizado' },
  { value: 'automacao', label: 'Automação de Processos' },
  { value: 'analytics', label: 'Análise de Dados e BI' },
  { value: 'vendas', label: 'Automação de Vendas' },
  { value: 'marketing', label: 'Marketing Inteligente' },
  { value: 'operacoes', label: 'Otimização Operacional' }
];

const HOW_IMPLEMENT_OPTIONS = [
  { value: 'gradual', label: 'Implementação gradual (passo a passo)' },
  { value: 'piloto', label: 'Projeto piloto primeiro' },
  { value: 'completa', label: 'Implementação completa' },
  { value: 'terceirizada', label: 'Com ajuda de parceiros/consultoria' }
];

const WEEK_AVAILABILITY_OPTIONS = [
  { value: '1-2h', label: '1-2 horas por semana' },
  { value: '3-5h', label: '3-5 horas por semana' },
  { value: '6-10h', label: '6-10 horas por semana' },
  { value: '10h+', label: 'Mais de 10 horas por semana' }
];

const CONTENT_FORMATS_OPTIONS = [
  'Vídeos tutoriais',
  'Documentação escrita',
  'Lives e webinars',
  'Workshops práticos',
  'Estudos de caso',
  'Templates prontos',
  'Consultoria 1:1',
  'Comunidade/Fórum'
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

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Resultados esperados (selecione todos que se aplicam)
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            O que espera alcançar nos próximos 30 dias? <span className="text-red-400">*</span>
          </label>
          <Textarea
            value={data.expected_outcome_30days || ''}
            onChange={(e) => onUpdate('expected_outcome_30days', e.target.value)}
            placeholder="Descreva seus objetivos para os próximos 30 dias..."
            className="min-h-[80px] bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Tipo de solução prioritária <span className="text-red-400">*</span>
          </label>
          <RadioGroup 
            value={data.priority_solution_type || ''} 
            onValueChange={(value) => onUpdate('priority_solution_type', value)}
            className="space-y-3"
          >
            {PRIORITY_SOLUTION_TYPES.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value}
                  className="border-gray-600 text-viverblue"
                />
                <Label htmlFor={option.value} className="text-white cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Como prefere implementar? <span className="text-red-400">*</span>
            </label>
            <Select value={data.how_implement || ''} onValueChange={(value) => onUpdate('how_implement', value)}>
              <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {HOW_IMPLEMENT_OPTIONS.map((option) => (
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
              Disponibilidade semanal <span className="text-red-400">*</span>
            </label>
            <Select value={data.week_availability || ''} onValueChange={(value) => onUpdate('week_availability', value)}>
              <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
                <SelectValue placeholder="Selecione sua disponibilidade" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {WEEK_AVAILABILITY_OPTIONS.map((option) => (
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
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Formatos de conteúdo preferidos
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
