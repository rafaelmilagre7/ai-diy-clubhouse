
import React from "react";
import { PhoneInput } from "../inputs/PhoneInput";
import { SocialInputs } from "../inputs/SocialInputs";
import { LocationInputs } from "../inputs/LocationInputs";
import { TimezoneInput } from "../inputs/TimezoneInput";
import { Button } from "@/components/ui/button";

interface PersonalInfoFormProps {
  validation?: any;
  register?: any;
  errors: Record<string, string>;
  touchedFields?: any;
  isSubmitting: boolean;
  initialData?: any;
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  validation,
  register,
  errors,
  touchedFields,
  isSubmitting,
  initialData,
  formData,
  onChange
}) => {
  // Combinar dados iniciais e formData para garantir valores corretos
  const currentData = {
    ...initialData,
    ...formData
  };

  return (
    <div className="space-y-8">
      <LocationInputs
        country={currentData.country || "Brasil"}
        state={currentData.state || ""}
        city={currentData.city || ""}
        onChangeCountry={(value) => onChange("country", value)}
        onChangeState={(value) => onChange("state", value)}
        onChangeCity={(value) => onChange("city", value)}
        errors={{
          state: errors.state,
          city: errors.city
        }}
        disabled={isSubmitting}
      />
      
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-6">
        <h3 className="text-lg font-semibold text-[#0ABAB5]">Contato</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PhoneInput
            value={currentData.phone || ""}
            onChange={(v) => onChange("phone", v)}
            disabled={isSubmitting}
            error={errors.phone}
            ddi={currentData.ddi || "+55"}
            onChangeDDI={(v) => onChange("ddi", v)}
          />
          <TimezoneInput 
            value={currentData.timezone || "America/Sao_Paulo"} 
            onChange={(v) => onChange("timezone", v)} 
            disabled={isSubmitting}
            error={errors.timezone}
          />
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-6">
        <h3 className="text-lg font-semibold text-[#0ABAB5]">Redes Sociais</h3>
        <SocialInputs
          linkedin={currentData.linkedin || ""}
          instagram={currentData.instagram || ""}
          onChangeLinkedin={(v) => onChange("linkedin", v)}
          onChangeInstagram={(v) => onChange("instagram", v)}
          disabled={isSubmitting}
          errors={{
            linkedin: errors.linkedin,
            instagram: errors.instagram
          }}
        />
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSubmitting ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};
