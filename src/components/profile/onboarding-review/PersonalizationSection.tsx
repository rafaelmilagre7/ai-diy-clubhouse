
import React from 'react';
import { Settings } from 'lucide-react';
import { OnboardingSection } from './OnboardingSection';
import { DataField } from './DataField';
import { ArrayField } from './ArrayField';
import { OnboardingPersonalization } from '@/types/onboardingFinal';

interface PersonalizationSectionProps {
  data: OnboardingPersonalization;
}

export const PersonalizationSection: React.FC<PersonalizationSectionProps> = ({ data }) => {
  const formatBoolean = (value?: boolean) => {
    if (value === undefined || value === null) return 'Não informado';
    return value ? 'Sim' : 'Não';
  };

  return (
    <OnboardingSection 
      title="Personalização da Experiência" 
      icon={<Settings className="h-5 w-5 text-viverblue" />}
    >
      <div className="space-y-4">
        <ArrayField label="Interesses" items={data.interests} />
        <ArrayField label="Preferência de Horário" items={data.time_preference} />
        <ArrayField label="Dias Disponíveis" items={data.available_days} />
        <DataField 
          label="Disponibilidade para Networking" 
          value={data.networking_availability} 
        />
        <ArrayField label="Habilidades para Compartilhar" items={data.skills_to_share} />
        <ArrayField label="Tópicos de Mentoria" items={data.mentorship_topics} />
        <DataField 
          label="Interesse em Lives" 
          value={data.live_interest} 
        />
        <DataField 
          label="Autoriza Uso do Caso" 
          value={formatBoolean(data.authorize_case_usage)} 
        />
        <DataField 
          label="Interesse em Entrevista" 
          value={formatBoolean(data.interested_in_interview)} 
        />
        <ArrayField label="Tópicos Prioritários" items={data.priority_topics} />
        <ArrayField label="Formatos de Conteúdo" items={data.content_formats} />
      </div>
    </OnboardingSection>
  );
};
