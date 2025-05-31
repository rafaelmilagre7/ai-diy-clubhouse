
import React from 'react';
import { Trophy } from 'lucide-react';
import { OnboardingSection } from './OnboardingSection';
import { DataField } from './DataField';
import { ArrayField } from './ArrayField';
import { OnboardingGoalsInfo } from '@/types/onboardingFinal';

interface GoalsInfoSectionProps {
  data: OnboardingGoalsInfo;
}

export const GoalsInfoSection: React.FC<GoalsInfoSectionProps> = ({ data }) => {
  return (
    <OnboardingSection 
      title="Objetivos e Metas" 
      icon={<Trophy className="h-5 w-5 text-viverblue" />}
    >
      <div className="space-y-4">
        <DataField label="Objetivo Principal" value={data.primary_goal} />
        <ArrayField label="Resultados Esperados" items={data.expected_outcomes} />
        <DataField 
          label="Resultado em 30 dias" 
          value={data.expected_outcome_30days} 
        />
        <DataField 
          label="Tipo de Solução Prioritária" 
          value={data.priority_solution_type} 
        />
        <DataField label="Como Implementar" value={data.how_implement} />
        <DataField label="Disponibilidade Semanal" value={data.week_availability} />
        <ArrayField label="Formatos de Conteúdo" items={data.content_formats} />
      </div>
    </OnboardingSection>
  );
};
