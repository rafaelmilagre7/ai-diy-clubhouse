
import React from "react";
import { NameInput } from "./inputs/NameInput";
import { EmailInput } from "./inputs/EmailInput";
import { PhoneInput } from "./inputs/PhoneInput";
import { SocialInputs } from "./inputs/SocialInputs";
import { LocationInputs } from "./inputs/LocationInputs";
import { TimezoneInput } from "./inputs/TimezoneInput";
import { useAuth } from "@/contexts/auth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface PersonalInfoInputsProps {
  formData?: {
    name: string;
    email: string;
    phone: string;
    ddi?: string;
    linkedin: string;
    instagram: string;
    country: string;
    state: string;
    city: string;
    timezone: string;
  };
  onChange: (field: string, value: string) => void;
  disabled: boolean;
  readOnly?: boolean;
  errors?: Record<string, string>;
}

export const PersonalInfoInputs = ({ 
  formData, 
  onChange, 
  disabled, 
  readOnly, 
  errors = {} 
}: PersonalInfoInputsProps) => {
  const { user } = useAuth();

  if (!formData) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size={6} />
        <span className="ml-3 text-sm text-gray-500">Carregando dados...</span>
      </div>
    );
  }
  
  // Usar os valores do usuário autenticado como fallback
  const userName = formData.name || user?.user_metadata?.name || '';
  const userEmail = formData.email || user?.email || '';
  
  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-6">
        <h3 className="text-lg font-semibold text-[#0ABAB5]">Informações Básicas</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <NameInput
            value={userName}
            onChange={v => onChange("name", v)}
            disabled={true}
            readOnly={true}
          />
          <EmailInput
            value={userEmail}
            onChange={v => onChange("email", v)}
            disabled={true}
            readOnly={true}
          />
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-6">
        <h3 className="text-lg font-semibold text-[#0ABAB5]">Contato</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PhoneInput
            value={formData.phone}
            onChange={v => onChange("phone", v)}
            disabled={disabled}
            error={errors.phone}
            ddi={formData.ddi || "+55"}
            onChangeDDI={v => onChange("ddi", v)}
          />
          <TimezoneInput 
            value={formData.timezone} 
            onChange={v => onChange("timezone", v)} 
            disabled={disabled} 
            error={errors.timezone}
          />
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-6">
        <h3 className="text-lg font-semibold text-[#0ABAB5]">Redes Sociais</h3>
        <SocialInputs
          linkedin={formData.linkedin}
          instagram={formData.instagram}
          onChangeLinkedin={v => onChange("linkedin", v)}
          onChangeInstagram={v => onChange("instagram", v)}
          disabled={disabled}
          errors={{
            linkedin: errors.linkedin,
            instagram: errors.instagram
          }}
        />
      </div>
      
      <LocationInputs
        country={formData.country}
        state={formData.state}
        city={formData.city}
        onChangeCountry={v => onChange("country", v)}
        onChangeState={v => onChange("state", v)}
        onChangeCity={v => onChange("city", v)}
        disabled={disabled}
        errors={{
          state: errors.state,
          city: errors.city
        }}
      />
    </div>
  );
};
