
import React from "react";
import { NameInput } from "./inputs/NameInput";
import { EmailInput } from "./inputs/EmailInput";
import { PhoneInput } from "./inputs/PhoneInput";
import { SocialInputs } from "./inputs/SocialInputs";
import { LocationInputs } from "./inputs/LocationInputs";
import { TimezoneInput } from "./inputs/TimezoneInput";

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
}

export const PersonalInfoInputs = ({ formData, onChange, disabled, readOnly }: PersonalInfoInputsProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <NameInput
        value={formData.name}
        onChange={v => onChange("name", v)}
        disabled={true}
        readOnly={true}
      />
      <EmailInput
        value={formData.email}
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
      />
      <SocialInputs
        linkedin={formData.linkedin}
        instagram={formData.instagram}
        onChangeLinkedin={v => onChange("linkedin", v)}
        onChangeInstagram={v => onChange("instagram", v)}
        disabled={disabled}
      />
      <LocationInputs
        country={formData.country}
        state={formData.state}
        city={formData.city}
        onChangeCountry={v => onChange("country", v)}
        onChangeState={v => onChange("state", v)}
        onChangeCity={v => onChange("city", v)}
        disabled={disabled}
      />
      <TimezoneInput value={formData.timezone} onChange={v => onChange("timezone", v)} disabled={disabled} />
    </div>
  );
};
