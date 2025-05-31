
import React from 'react';
import { MapPin } from 'lucide-react';
import { OnboardingSection } from './OnboardingSection';
import { DataField } from './DataField';
import { OnboardingLocationInfo } from '@/types/onboardingFinal';

interface LocationInfoSectionProps {
  data: OnboardingLocationInfo;
}

export const LocationInfoSection: React.FC<LocationInfoSectionProps> = ({ data }) => {
  return (
    <OnboardingSection 
      title="Localização e Contato" 
      icon={<MapPin className="h-5 w-5 text-viverblue" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataField label="País" value={data.country} />
        <DataField label="Estado" value={data.state} />
        <DataField label="Cidade" value={data.city} />
        <DataField label="Instagram" value={data.instagram_url} link />
        <DataField label="LinkedIn" value={data.linkedin_url} link />
      </div>
    </OnboardingSection>
  );
};
