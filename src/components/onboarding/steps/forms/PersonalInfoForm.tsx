
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { NavigationButtons } from "../../NavigationButtons";
import { PhoneInput } from "../inputs/PhoneInput";
import { SocialInputs } from "../inputs/SocialInputs";
import { LocationInputs } from "../inputs/LocationInputs";
import { cn } from "@/lib/utils";

interface PersonalInfoFormProps {
  validation: any;
  register: any;
  errors: any;
  touchedFields: any;
  isSubmitting: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  validation,
  register,
  errors,
  touchedFields,
  isSubmitting
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className={cn(
            "transition-colors",
            errors.name ? "text-red-500" : touchedFields.name ? "text-[#0ABAB5]" : ""
          )}>
            Nome completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            className={cn(
              "transition-all duration-200",
              errors.name ? "border-red-500 focus:border-red-500" : 
              touchedFields.name ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
            )}
            {...register("name", { 
              required: "Nome é obrigatório",
              minLength: {
                value: 3,
                message: "Nome deve ter pelo menos 3 caracteres"
              }
            })}
          />
          <FormMessage
            type={touchedFields.name && !errors.name ? "success" : "error"}
            message={errors.name?.message?.toString()}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={cn(
            "transition-colors",
            errors.email ? "text-red-500" : touchedFields.email ? "text-[#0ABAB5]" : ""
          )}>
            E-mail <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            className={cn(
              "transition-all duration-200",
              errors.email ? "border-red-500 focus:border-red-500" : 
              touchedFields.email ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
            )}
            {...register("email", {
              required: "E-mail é obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "E-mail inválido"
              }
            })}
          />
          <FormMessage
            type={touchedFields.email && !errors.email ? "success" : "error"}
            message={errors.email?.message?.toString()}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PhoneInput
          value={validation.values.phone}
          onChange={(v) => validation.handleChange("phone", v)}
          onBlur={() => validation.handleBlur("phone")}
          error={validation.touched.phone ? validation.errors.phone : undefined}
          ddi={validation.values.ddi}
          onChangeDDI={(v) => validation.handleChange("ddi", v)}
        />

        <SocialInputs
          linkedin={validation.values.linkedin}
          instagram={validation.values.instagram}
          onChangeLinkedin={(v) => validation.handleChange("linkedin", v)}
          onChangeInstagram={(v) => validation.handleChange("instagram", v)}
          disabled={isSubmitting}
          errors={{
            linkedin: validation.errors.linkedin,
            instagram: validation.errors.instagram
          }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Localização</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LocationInputs
            country={initialData?.country || "Brasil"}
            state={validation.values.state}
            city={validation.values.city}
            onChangeCountry={() => {}}
            onChangeState={(v) => validation.handleChange("state", v)}
            onChangeCity={(v) => validation.handleChange("city", v)}
            disabled={isSubmitting}
            errors={{
              state: validation.errors.state,
              city: validation.errors.city
            }}
          />
        </div>
      </div>

      <NavigationButtons 
        isSubmitting={isSubmitting} 
        showPrevious={false}
        submitText="Salvar e Continuar"
        loadingText="Salvando..." 
      />
    </div>
  );
};
