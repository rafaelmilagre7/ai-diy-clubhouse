
import React from 'react';
import { OnboardingStepProps } from '@/types/onboarding';
import { FormField } from '../FormField';
import { NavigationButtons } from '../NavigationButtons';
import { AI_TOOLS } from '@/constants/onboarding';

export const AIMaturityStep: React.FC<OnboardingStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading
}) => {
  const isFormValid = data.hasImplementedAI && data.aiKnowledgeLevel && data.dailyAITool && data.implementationResponsible;

  const implementationOptions = [
    { value: 'yes', label: 'Sim, já implementei com sucesso' },
    { value: 'tried_failed', label: 'Tentei, mas não obtive os resultados esperados' },
    { value: 'no', label: 'Não, ainda não implementei' }
  ];

  const knowledgeOptions = [
    { value: 'beginner', label: 'Iniciante - Estou começando a aprender' },
    { value: 'intermediate', label: 'Intermediário - Tenho conhecimento básico' },
    { value: 'advanced', label: 'Avançado - Domino bem o assunto' },
    { value: 'expert', label: 'Expert - Sou especialista na área' }
  ];

  const responsibleOptions = [
    { value: 'myself', label: 'Eu mesmo implemento' },
    { value: 'team', label: 'Tenho uma equipe técnica' },
    { value: 'hire', label: 'Preciso contratar ajuda externa' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-3">
          Maturidade em IA 🤖
        </h1>
        <p className="text-lg text-muted-foreground">
          Vamos avaliar seu nível atual de conhecimento e experiência com IA
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
              Perfeito! Agora preciso entender seu nível atual com IA para recomendar o caminho ideal. 
              Não se preocupe se está começando - todos os níveis são bem-vindos!
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Experiência com IA */}
        <FormField
          label="Você já implementou IA no seu negócio?"
          type="radio"
          value={data.hasImplementedAI || ''}
          onChange={(value) => onDataChange({ hasImplementedAI: value })}
          options={implementationOptions}
          required
        />

        {/* Ferramentas usadas (se já implementou) */}
        {data.hasImplementedAI === 'yes' && (
          <FormField
            label="Quais soluções de IA você já implementou?"
            type="multi-select"
            value={data.aiSolutions || []}
            onChange={(value) => onDataChange({ aiSolutions: value })}
            options={AI_TOOLS}
            description="Selecione todas que se aplicam"
          />
        )}

        {/* Nível de conhecimento */}
        <FormField
          label="Como você avalia seu conhecimento em IA?"
          type="radio"
          value={data.aiKnowledgeLevel || ''}
          onChange={(value) => onDataChange({ aiKnowledgeLevel: value })}
          options={knowledgeOptions}
          required
        />

        {/* Ferramenta diária */}
        <FormField
          label="Qual ferramenta de IA você mais usa no dia a dia?"
          type="select"
          value={data.dailyAITool || ''}
          onChange={(value) => onDataChange({ dailyAITool: value })}
          options={AI_TOOLS}
          placeholder="Selecione a principal"
          required
        />

        {/* Quem implementa */}
        <FormField
          label="Quem será responsável pela implementação das soluções?"
          type="radio"
          value={data.implementationResponsible || ''}
          onChange={(value) => onDataChange({ implementationResponsible: value })}
          options={responsibleOptions}
          required
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
