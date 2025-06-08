
import React from 'react';
import { OnboardingStepProps } from '@/types/onboarding';
import { FormField } from '../FormField';
import { NavigationButtons } from '../NavigationButtons';
import { 
  IMPACT_AREAS, 
  EXPECTED_RESULTS_90_DAYS, 
  AI_BUDGETS 
} from '@/constants/onboarding';

export const ObjectivesStep: React.FC<OnboardingStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading
}) => {
  const isFormValid = data.mainObjective && data.targetArea && data.expectedResult90Days;

  const objectiveOptions = [
    { value: 'reduce_costs', label: 'Reduzir custos operacionais' },
    { value: 'increase_sales', label: 'Aumentar vendas e receita' },
    { value: 'automate_processes', label: 'Automatizar processos' },
    { value: 'innovate_products', label: 'Inovar produtos/serviços' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-3">
          Objetivos e Expectativas 🎯
        </h1>
        <p className="text-lg text-muted-foreground">
          Defina seus objetivos para criar um plano personalizado
        </p>
      </div>

      {/* AI Message Placeholder */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
            IA
          </div>
          <div className="flex-1">
            <p className="text-sm">
              Ótimo progresso! Agora vamos definir seus objetivos específicos. 
              Isso me permitirá criar um plano de implementação focado nos seus resultados.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Objetivo principal */}
        <FormField
          label="Qual é seu principal objetivo com IA?"
          type="radio"
          value={data.mainObjective || ''}
          onChange={(value) => onDataChange({ mainObjective: value })}
          options={objectiveOptions}
          required
        />

        {/* Área de impacto */}
        <FormField
          label="Em qual área você quer ver o primeiro impacto?"
          type="select"
          value={data.targetArea || ''}
          onChange={(value) => onDataChange({ targetArea: value })}
          options={IMPACT_AREAS}
          placeholder="Selecione a área prioritária"
          required
        />

        {/* Resultado esperado em 90 dias */}
        <FormField
          label="Que resultado você espera alcançar em 90 dias?"
          type="select"
          value={data.expectedResult90Days || ''}
          onChange={(value) => onDataChange({ expectedResult90Days: value })}
          options={EXPECTED_RESULTS_90_DAYS}
          placeholder="Defina sua meta"
          required
        />

        {/* Orçamento */}
        <FormField
          label="Qual orçamento você tem disponível para investir em IA?"
          type="select"
          value={data.budget || ''}
          onChange={(value) => onDataChange({ budget: value })}
          options={AI_BUDGETS}
          placeholder="Faixa de investimento"
          description="Isso inclui ferramentas, treinamento e implementação"
        />
      </div>

      <NavigationButtons
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid}
        isLoading={isLoading}
        nextLabel="Continuar"
      />
    </div>
  );
};
