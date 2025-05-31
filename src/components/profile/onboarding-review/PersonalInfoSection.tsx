
import React from 'react';
import { User } from 'lucide-react';
import { OnboardingSection } from './OnboardingSection';
import { DataField } from './DataField';
import { OnboardingPersonalInfo } from '@/types/onboardingFinal';

interface PersonalInfoSectionProps {
  data: OnboardingPersonalInfo;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ data }) => {
  const formatPhone = (countryCode?: string, phone?: string) => {
    if (!phone) return 'Não informado';
    const cleanCountryCode = countryCode?.startsWith('+') ? countryCode : `+${countryCode || '55'}`;
    return `${cleanCountryCode} ${phone}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <OnboardingSection 
      title="Informações Pessoais" 
      icon={<User className="h-5 w-5 text-viverblue" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataField label="Nome" value={data.name} />
        <DataField label="Email" value={data.email} />
        <DataField 
          label="WhatsApp" 
          value={formatPhone(data.country_code, data.whatsapp)} 
        />
        <DataField 
          label="Data de Nascimento" 
          value={formatDate(data.birth_date)} 
        />
      </div>
    </OnboardingSection>
  );
};
