
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateWebsite, normalizeWebsiteUrl } from "@/utils/professionalDataValidation";

export const WebsiteField: React.FC = () => {
  const { 
    register,
    formState: { errors, touchedFields },
    setValue,
    trigger
  } = useFormContext();

  // Registra o input com validação personalizada
  const registerOptions = {
    required: false,
    validate: validateWebsite,
    setValueAs: (value: string) => value ? normalizeWebsiteUrl(value) : "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // Permite que a validação aconteça após a digitação
      setTimeout(() => {
        trigger("company_website");
      }, 200);
    }
  };

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center gap-2",
          errors.company_website ? "text-red-500" : 
          touchedFields.company_website ? "text-[#0ABAB5]" : ""
        )}
      >
        <Globe className="h-4 w-4" />
        Website da Empresa
        <span className="text-gray-400 text-sm font-normal">(opcional)</span>
        {touchedFields.company_website && !errors.company_website && (
          <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Input
        placeholder="www.suaempresa.com.br"
        {...register("company_website", registerOptions)}
        className={cn(
          "transition-all duration-200",
          errors.company_website ? "border-red-500" : 
          touchedFields.company_website ? "border-[#0ABAB5]" : ""
        )}
      />
      <FormMessage 
        type={touchedFields.company_website && !errors.company_website ? "success" : "error"}
        message={errors.company_website?.message?.toString()}
      />
    </div>
  );
};
