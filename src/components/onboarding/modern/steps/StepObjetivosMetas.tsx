
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelectorModerno } from '../MultiSelectorModerno';
import { Target, Lightbulb, Calendar } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';

const primaryGoalOptions = [
  { value: 'aumentar_vendas', label: 'Aumentar vendas com IA' },
  { value: 'automatizar_processos', label: 'Automatizar processos' },
  { value: 'melhorar_atendimento', label: 'Melhorar atendimento ao cliente' },
  { value: 'otimizar_marketing', label: 'Otimizar estratégias de marketing' },
  { value: 'reduzir_custos', label: 'Reduzir custos operacionais' },
  { value: 'inovar_produtos', label: 'Inovar produtos/serviços' },
  { value: 'aprender_ia', label: 'Aprender sobre IA' },
  { value: 'network', label: 'Fazer networking' }
];

const contentFormatOptions = [
  { value: 'videos', label: 'Vídeos práticos' },
  { value: 'artigos', label: 'Artigos e guias' },
  { value: 'webinars', label: 'Webinars ao vivo' },
  { value: 'podcasts', label: 'Podcasts' },
  { value: 'cases', label: 'Cases de sucesso' },
  { value: 'templates', label: 'Templates e ferramentas' },
  { value: 'mentoria', label: 'Mentorias 1:1' },
  { value: 'workshops', label: 'Workshops práticos' }
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
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Target className="h-6 w-6 text-viverblue" />
          Seus objetivos e metas
        </h2>
        <p className="text-gray-400">
          Vamos personalizar sua experiência baseada nos seus objetivos
        </p>
      </div>

      <div className="space-y-6">
        {/* Objetivo Principal */}
        <div className="space-y-3">
          <Label className="text-white flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-viverblue" />
            Qual seu principal objetivo?
          </Label>
          <RadioGroup
            value={data.primary_goal}
            onValueChange={(value) => onUpdate('primary_goal', value)}
            className="space-y-2"
          >
            {primaryGoalOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value}
                  className="border-gray-600 text-viverblue"
                />
                <Label 
                  htmlFor={option.value} 
                  className="text-white cursor-pointer flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Resultado esperado em 30 dias */}
        <div className="space-y-2">
          <Label htmlFor="expected_outcome" className="text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-viverblue" />
            O que você espera alcançar em 30 dias?
          </Label>
          <Textarea
            id="expected_outcome"
            value={data.expected_outcome_30days}
            onChange={(e) => onUpdate('expected_outcome_30days', e.target.value)}
            placeholder="Descreva o que você gostaria de alcançar no primeiro mês..."
            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-viverblue min-h-[100px]"
          />
        </div>

        {/* Formatos de conteúdo preferidos */}
        <div className="space-y-2">
          <Label className="text-white">
            Que tipos de conteúdo você prefere?
          </Label>
          <MultiSelectorModerno
            value={data.content_formats || []}
            onChange={(formats) => onUpdate('content_formats', formats)}
            options={contentFormatOptions}
            placeholder="Selecione os formatos que mais te interessam..."
          />
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Voltar
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finalizar
        </Button>
      </div>

      {/* Indicador de progresso */}
      <div className="flex justify-center">
        <span className="text-sm text-gray-400">
          Etapa {currentStep} de {totalSteps}
        </span>
      </div>
    </div>
  );
};
