
import React from 'react';
import { Building } from 'lucide-react';
import { OnboardingSection } from './OnboardingSection';
import { DataField } from './DataField';
import { OnboardingBusinessInfo } from '@/types/onboardingFinal';

interface BusinessInfoSectionProps {
  data: OnboardingBusinessInfo;
}

export const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({ data }) => {
  return (
    <OnboardingSection 
      title="Dados Profissionais" 
      icon={<Building className="h-5 w-5 text-viverblue" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataField label="Empresa" value={data.company_name} />
        <DataField label="Cargo" value={data.role} />
        <DataField label="Tamanho da Empresa" value={data.company_size} />
        <DataField label="Setor" value={data.company_sector} />
        <DataField label="Website" value={data.company_website} link />
        <DataField label="Faturamento Anual" value={data.annual_revenue} />
        <DataField label="Posição Atual" value={data.current_position} />
      </div>
    </OnboardingSection>
  );
};
