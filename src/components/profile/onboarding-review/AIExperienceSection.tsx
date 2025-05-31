
import React from 'react';
import { Bot } from 'lucide-react';
import { OnboardingSection } from './OnboardingSection';
import { DataField } from './DataField';
import { ArrayField } from './ArrayField';
import { OnboardingAIExperience } from '@/types/onboardingFinal';

interface AIExperienceSectionProps {
  data: OnboardingAIExperience;
}

export const AIExperienceSection: React.FC<AIExperienceSectionProps> = ({ data }) => {
  const formatBoolean = (value?: boolean) => {
    if (value === undefined || value === null) return 'Não informado';
    return value ? 'Sim' : 'Não';
  };

  return (
    <OnboardingSection 
      title="Experiência com IA" 
      icon={<Bot className="h-5 w-5 text-viverblue" />}
    >
      <div className="space-y-4">
        <DataField 
          label="Nível de Conhecimento em IA" 
          value={data.ai_knowledge_level} 
        />
        <ArrayField label="Ferramentas Utilizadas" items={data.previous_tools} />
        <DataField 
          label="Já Implementou IA" 
          value={data.has_implemented} 
        />
        <ArrayField label="Áreas de IA Desejadas" items={data.desired_ai_areas} />
        <DataField 
          label="Completou Formação" 
          value={formatBoolean(data.completed_formation)} 
        />
        <DataField 
          label="É Membro há Mais de 1 Mês" 
          value={formatBoolean(data.is_member_for_month)} 
        />
        <DataField label="Nota NPS" value={data.nps_score?.toString()} />
        <DataField 
          label="Sugestões de Melhoria" 
          value={data.improvement_suggestions}
          multiline 
        />
      </div>
    </OnboardingSection>
  );
};
