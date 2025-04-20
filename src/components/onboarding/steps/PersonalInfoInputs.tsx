
import React from "react";
import { NameInput } from "./inputs/NameInput";
import { EmailInput } from "./inputs/EmailInput";
import { PhoneInput } from "./inputs/PhoneInput";
import { SocialInputs } from "./inputs/SocialInputs";
import { LocationInputs } from "./inputs/LocationInputs";
import { TimezoneInput } from "./inputs/TimezoneInput";
import { useAuth } from "@/contexts/auth";

interface PersonalInfoInputsProps {
  formData: {
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
  
  // Usar os valores do usuário autenticado como fallback
  const userName = formData.name || user?.user_metadata?.name || '';
  const userEmail = formData.email || user?.email || '';
  
  return (
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
      <PhoneInput
        ddi={formData.ddi || "+55"}
        phone={formData.phone}
        onChangeDDI={v => onChange("ddi", v)}
        onChangePhone={v => onChange("phone", v)}
        disabled={disabled}
        error={errors.phone}
      />
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
      <TimezoneInput value={formData.timezone} onChange={v => onChange("timezone", v)} disabled={disabled} />
    </div>
  );
};
