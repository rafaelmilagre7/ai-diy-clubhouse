
import React from 'react';
import { OnboardingStepProps } from '@/types/onboarding';
import { FormField } from '../FormField';
import { NavigationButtons } from '../NavigationButtons';
import { 
  WEEKLY_LEARNING_TIME, 
  MEETING_DAYS, 
  TIME_PERIODS 
} from '@/constants/onboarding';

export const PersonalizationStep: React.FC<OnboardingStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading
}) => {
  const isFormValid = data.weeklyLearningTime && data.contentPreference;

  const contentOptions = [
    { value: 'theoretical', label: 'Mais teórico - Conceitos e estratégias' },
    { value: 'hands_on', label: 'Mais prático - Implementação direta' },
    { value: 'mixed', label: 'Equilibrado - Teoria e prática' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-3">
          Personalização da Experiência ⚙️
        </h1>
        <p className="text-lg text-muted-foreground">
          Últimos ajustes para personalizar completamente sua jornada
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
              Estamos quase lá! Agora vou personalizar sua experiência de aprendizado 
              e definir como você prefere receber conteúdo e interagir com a comunidade.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Tempo de aprendizado */}
        <FormField
          label="Quanto tempo por semana você pode dedicar ao aprendizado?"
          type="select"
          value={data.weeklyLearningTime || ''}
          onChange={(value) => onDataChange({ weeklyLearningTime: value })}
          options={WEEKLY_LEARNING_TIME}
          placeholder="Selecione o tempo disponível"
          required
        />

        {/* Preferência de conteúdo */}
        <FormField
          label="Que tipo de conteúdo você prefere?"
          type="radio"
          value={data.contentPreference || ''}
          onChange={(value) => onDataChange({ contentPreference: value })}
          options={contentOptions}
          required
        />

        {/* Interesse em networking */}
        <FormField
          label="Você tem interesse em networking com outros membros?"
          type="checkbox"
          value={data.wantsNetworking || false}
          onChange={(value) => onDataChange({ wantsNetworking: value })}
          description="Conectar-se com outros profissionais da comunidade"
        />

        {/* Dias preferenciais para encontros */}
        {data.wantsNetworking && (
          <FormField
            label="Quais dias são melhores para você participar de encontros?"
            type="multi-select"
            value={data.bestMeetingDays || []}
            onChange={(value) => onDataChange({ bestMeetingDays: value })}
            options={MEETING_DAYS}
            description="Selecione todos os dias que funcionam para você"
          />
        )}

        {/* Horários preferenciais */}
        {data.wantsNetworking && (
          <FormField
            label="Quais horários funcionam melhor?"
            type="multi-select"
            value={data.bestTimeOfDay || []}
            onChange={(value) => onDataChange({ bestTimeOfDay: value })}
            options={TIME_PERIODS}
            description="Selecione os períodos que prefere"
          />
        )}

        {/* Aceita ser case de estudo */}
        <FormField
          label="Você aceita que seu caso seja usado como exemplo de sucesso?"
          type="checkbox"
          value={data.acceptsCaseStudy || false}
          onChange={(value) => onDataChange({ acceptsCaseStudy: value })}
          description="Apenas se você alcançar resultados excepcionais, com total anonimato se preferir"
        />
      </div>

      <NavigationButtons
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid}
        isLoading={isLoading}
        nextLabel="Finalizar"
      />
    </div>
  );
};
