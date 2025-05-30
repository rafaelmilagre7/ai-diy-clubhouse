
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepProps } from '@/types/quickOnboarding';
import { DropdownModerno } from '../DropdownModerno';

const PRIMARY_GOAL_OPTIONS = [
  { value: 'automatizar-processos', label: '🤖 Automatizar processos e reduzir trabalho manual' },
  { value: 'melhorar-atendimento', label: '💬 Melhorar atendimento e experiência do cliente' },
  { value: 'aumentar-receita', label: '💰 Aumentar receita e vendas' },
  { value: 'reduzir-custos', label: '📉 Reduzir custos operacionais' },
  { value: 'inovar-produtos', label: '🚀 Inovar produtos e serviços' },
  { value: 'melhorar-marketing', label: '📢 Otimizar marketing e geração de leads' },
  { value: 'analise-dados', label: '📊 Melhorar análise e tomada de decisão' },
  { value: 'competitive-advantage', label: '🎯 Obter vantagem competitiva' }
];

const WEEK_AVAILABILITY_OPTIONS = [
  { value: '1-2h', label: '⏱️ 1-2 horas por semana' },
  { value: '3-5h', label: '⏰ 3-5 horas por semana' },
  { value: '6-10h', label: '🕐 6-10 horas por semana' },
  { value: '10h+', label: '⏳ Mais de 10 horas por semana' },
  { value: 'flexivel', label: '🔄 Flexível conforme necessário' }
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
          Vamos definir seus objetivos e como você pretende alcançá-los
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 space-y-6">
        <DropdownModerno
          value={data.primary_goal || ''}
          onChange={(value) => onUpdate('primary_goal', value)}
          options={PRIMARY_GOAL_OPTIONS}
          placeholder="Selecione seu objetivo principal"
          label="Principal objetivo com IA"
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
            placeholder="Ex: Implementar chatbot, automatizar processo específico..."
            className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
          />
        </div>

        <DropdownModerno
          value={data.week_availability || ''}
          onChange={(value) => onUpdate('week_availability', value)}
          options={WEEK_AVAILABILITY_OPTIONS}
          placeholder="Disponibilidade semanal"
          label="Quanto tempo pode dedicar por semana?"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-green-400 mb-2">🎯 Objetivo</h4>
            <p className="text-sm text-gray-300">Definir meta clara e específica</p>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-blue-400 mb-2">📅 Prazo</h4>
            <p className="text-sm text-gray-300">Estabelecer cronograma realista</p>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-purple-400 mb-2">⚡ Ação</h4>
            <p className="text-sm text-gray-300">Começar implementação prática</p>
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <p className="text-sm text-orange-400">
            🚀 <strong>Sucesso:</strong> Com objetivos claros e dedicação adequada, 
            você estará no caminho certo para transformar seu negócio com IA.
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
