
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const PRIMARY_GOAL_OPTIONS = [
  { value: 'reducao_custos', label: '💰 Redução de custos operacionais' },
  { value: 'aumento_receita', label: '📈 Aumento de receita' },
  { value: 'melhoria_processos', label: '⚙️ Melhoria de processos' },
  { value: 'atendimento_cliente', label: '🎯 Melhorar atendimento ao cliente' },
  { value: 'automacao', label: '🤖 Automação de tarefas' },
  { value: 'analise_dados', label: '📊 Análise de dados' },
  { value: 'inovacao', label: '💡 Inovação e diferenciação' },
  { value: 'expansao', label: '🚀 Expansão do negócio' }
];

const CONTENT_FORMATS_OPTIONS = [
  'Vídeos curtos',
  'Webinars',
  'Artigos detalhados',
  'Infográficos',
  'Podcasts',
  'Cases práticos',
  'Templates prontos',
  'Workshops ao vivo'
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
  const handleContentFormatChange = (format: string, checked: boolean) => {
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
          Seus objetivos e metas 🎯
        </h2>
        <p className="text-gray-400">
          Vamos alinhar suas expectativas e objetivos
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.primary_goal || ''}
          onChange={(value) => onUpdate('primary_goal', value)}
          options={PRIMARY_GOAL_OPTIONS}
          placeholder="Selecione seu objetivo principal"
          label="Objetivo principal com IA"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            O que espera alcançar em 30 dias? <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={data.expected_outcome_30days || ''}
            onChange={(e) => onUpdate('expected_outcome_30days', e.target.value)}
            placeholder="Ex: Implementar um chatbot para atendimento básico"
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            Formatos de conteúdo preferidos <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CONTENT_FORMATS_OPTIONS.map((format) => (
              <label key={format} className="flex items-center gap-2 text-white cursor-pointer">
                <Checkbox
                  checked={Array.isArray(data.content_formats) && data.content_formats.includes(format)}
                  onCheckedChange={(checked) => handleContentFormatChange(format, checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue"
                />
                <span className="text-sm">{format}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <p className="text-sm text-orange-300">
            ⚡ <strong>Importante:</strong> Definir objetivos claros nos ajuda a 
            personalizar sua trilha de implementação de IA.
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
