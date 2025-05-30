
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const PRIMARY_GOAL_OPTIONS = [
  { value: 'aumentar-vendas', label: '💰 Aumentar vendas e receita' },
  { value: 'reduzir-custos', label: '📉 Reduzir custos operacionais' },
  { value: 'melhorar-produtividade', label: '⚡ Melhorar produtividade da equipe' },
  { value: 'automatizar-processos', label: '🤖 Automatizar processos manuais' },
  { value: 'melhorar-atendimento', label: '🎯 Melhorar atendimento ao cliente' },
  { value: 'analisar-dados', label: '📊 Melhorar análise de dados' },
  { value: 'criar-conteudo', label: '✍️ Otimizar criação de conteúdo' },
  { value: 'inovar-produtos', label: '🚀 Inovar produtos/serviços' },
  { value: 'outro', label: '🔗 Outro objetivo' }
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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Objetivos e metas 🎯
        </h2>
        <p className="text-gray-400">
          Quais são seus principais objetivos com IA?
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.primary_goal || ''}
          onChange={(value) => onUpdate('primary_goal', value)}
          options={PRIMARY_GOAL_OPTIONS}
          placeholder="Selecione seu principal objetivo"
          label="Principal objetivo com IA"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            O que você espera alcançar em 30 dias? <span className="text-red-400">*</span>
          </label>
          <Textarea
            value={data.expected_outcome_30days || ''}
            onChange={(e) => onUpdate('expected_outcome_30days', e.target.value)}
            placeholder="Ex: Implementar um chatbot para atendimento, automatizar geração de relatórios, etc."
            className="min-h-[100px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Disponibilidade semanal <span className="text-gray-400 text-sm font-normal">(opcional)</span>
          </label>
          <DropdownModerno
            value={data.week_availability || ''}
            onChange={(value) => onUpdate('week_availability', value)}
            options={[
              { value: '1-2h', label: '1-2 horas por semana' },
              { value: '3-5h', label: '3-5 horas por semana' },
              { value: '6-10h', label: '6-10 horas por semana' },
              { value: '10h+', label: 'Mais de 10 horas por semana' }
            ]}
            placeholder="Quanto tempo pode dedicar"
            label=""
          />
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-400">
            🚀 <strong>Meta clara:</strong> Objetivos específicos nos ajudam a 
            criar uma trilha de implementação mais eficaz e resultados mensuráveis.
          </p>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
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
