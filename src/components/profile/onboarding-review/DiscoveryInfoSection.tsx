
import React from 'react';
import { Search } from 'lucide-react';
import { OnboardingSection } from './OnboardingSection';
import { DataField } from './DataField';
import { OnboardingDiscoveryInfo } from '@/types/onboardingFinal';

interface DiscoveryInfoSectionProps {
  data: OnboardingDiscoveryInfo;
}

export const DiscoveryInfoSection: React.FC<DiscoveryInfoSectionProps> = ({ data }) => {
  const getSourceLabel = (value?: string) => {
    const labels: Record<string, string> = {
      'google': 'Google',
      'social_media': 'Redes Sociais',
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'recommendation': 'Recomendação',
      'other': 'Outro'
    };
    return labels[value || ''] || value || 'Não informado';
  };

  return (
    <OnboardingSection 
      title="Como nos conheceu" 
      icon={<Search className="h-5 w-5 text-viverblue" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataField 
          label="Como nos encontrou" 
          value={getSourceLabel(data.how_found_us)} 
        />
        <DataField label="Indicado por" value={data.referred_by} />
      </div>
    </OnboardingSection>
  );
};
