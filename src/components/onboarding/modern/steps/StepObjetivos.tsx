
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const PRIMARY_GOAL_OPTIONS = [
  { value: 'reduzir_custos', label: '💰 Reduzir custos operacionais' },
  { value: 'aumentar_vendas', label: '📈 Aumentar vendas e receita' },
  { value: 'melhorar_eficiencia', label: '⚡ Melhorar eficiência dos processos' },
  { value: 'automatizar_tarefas', label: '🤖 Automatizar tarefas repetitivas' },
  { value: 'melhorar_atendimento', label: '🎯 Melhorar atendimento ao cliente' },
  { value: 'analisar_dados', label: '📊 Analisar dados e obter insights' },
  { value: 'competitividade', label: '🚀 Aumentar competitividade no mercado' },
  { value: 'inovacao', label: '💡 Inovar produtos/serviços' },
  { value: 'escalar_negocio', label: '📏 Escalar o negócio' },
  { value: 'outro', label: '🔄 Outro objetivo' }
];

const EXPECTED_OUTCOME_OPTIONS = [
  { value: '1_mes', label: '📅 Em 1 mês' },
  { value: '3_meses', label: '📅 Em 3 meses' },
  { value: '6_meses', label: '📅 Em 6 meses' },
  { value: '1_ano', label: '📅 Em 1 ano' },
  { value: 'mais_1_ano', label: '📅 Mais de 1 ano' }
];

export const StepObjetivos: React.FC<OnboardingStepProps> = ({
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
          Objetivos e metas 🎯
        </h2>
        <p className="text-gray-400">
          Vamos definir seus objetivos para personalizar sua jornada
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
            Resultado esperado em 30 dias <span className="text-red-400">*</span>
          </label>
          <textarea
            value={data.expected_outcome_30days || ''}
            onChange={(e) => onUpdate('expected_outcome_30days', e.target.value)}
            placeholder="Descreva o que você espera alcançar nos primeiros 30 dias após implementar soluções de IA"
            className="w-full h-24 p-3 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-viverblue/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Tipo de solução prioritária (opcional)
          </label>
          <Input
            type="text"
            value={data.priority_solution_type || ''}
            onChange={(e) => onUpdate('priority_solution_type', e.target.value)}
            placeholder="Ex: Automação de atendimento, análise de dados, etc."
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Como pretende implementar (opcional)
          </label>
          <textarea
            value={data.how_implement || ''}
            onChange={(e) => onUpdate('how_implement', e.target.value)}
            placeholder="Conte-nos sobre sua estratégia de implementação, equipe envolvida, orçamento, etc."
            className="w-full h-20 p-3 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-viverblue/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Disponibilidade semanal para implementação (opcional)
          </label>
          <Input
            type="text"
            value={data.week_availability || ''}
            onChange={(e) => onUpdate('week_availability', e.target.value)}
            placeholder="Ex: 5-10 horas por semana, apenas fins de semana, etc."
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            🎯 <strong>Personalização:</strong> Com base nos seus objetivos, vamos criar 
            uma trilha de implementação personalizada e recomendar as soluções mais adequadas.
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
