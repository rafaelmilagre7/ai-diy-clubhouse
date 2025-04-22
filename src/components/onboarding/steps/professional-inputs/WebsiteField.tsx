
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateWebsite, normalizeWebsiteUrl } from "@/utils/professionalDataValidation";

export const WebsiteField: React.FC = () => {
  const { register, formState: { errors, touchedFields }, watch, setValue } = useFormContext();
  const website = watch("company_website");

  // Processar URL ao perder foco para garantir formato adequado
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) {
      // Normalizar URL usando a função utilitária
      const normalizedUrl = normalizeWebsiteUrl(value);
      setValue("company_website", normalizedUrl, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center gap-2",
          errors.company_website ? "text-red-500" : 
          touchedFields.company_website && website ? "text-[#0ABAB5]" : ""
        )}
      >
        <Globe className="h-4 w-4" />
        Website da Empresa (opcional)
        {touchedFields.company_website && website && !errors.company_website && (
          <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Input
        placeholder="www.suaempresa.com.br"
        {...register("company_website", {
          validate: validateWebsite,
          onBlur: handleBlur
        })}
        className={cn(
          "transition-all duration-200",
          errors.company_website ? "border-red-500" : 
          touchedFields.company_website && website ? "border-[#0ABAB5]" : ""
        )}
      />
      <FormMessage 
        type={touchedFields.company_website && website && !errors.company_website ? "success" : "error"}
        message={errors.company_website?.message?.toString()}
      />
    </div>
  );
};
