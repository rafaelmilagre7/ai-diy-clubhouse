
import React from 'react';
import { Target } from 'lucide-react';
import { OnboardingSection } from './OnboardingSection';
import { DataField } from './DataField';
import { ArrayField } from './ArrayField';
import { OnboardingBusinessContext } from '@/types/onboardingFinal';

interface BusinessContextSectionProps {
  data: OnboardingBusinessContext;
}

export const BusinessContextSection: React.FC<BusinessContextSectionProps> = ({ data }) => {
  return (
    <OnboardingSection 
      title="Contexto do Negócio" 
      icon={<Target className="h-5 w-5 text-viverblue" />}
    >
      <div className="space-y-4">
        <DataField label="Modelo de Negócio" value={data.business_model} />
        <ArrayField label="Desafios do Negócio" items={data.business_challenges} />
        <ArrayField label="Metas de Curto Prazo" items={data.short_term_goals} />
        <ArrayField label="Metas de Médio Prazo" items={data.medium_term_goals} />
        <ArrayField label="KPIs Importantes" items={data.important_kpis} />
        <DataField 
          label="Contexto Adicional" 
          value={data.additional_context}
          multiline 
        />
      </div>
    </OnboardingSection>
  );
};
