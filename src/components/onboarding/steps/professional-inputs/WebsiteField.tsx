
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export const WebsiteField: React.FC = () => {
  const { register, formState: { errors, touchedFields } } = useFormContext();

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
        Site da Empresa
        {touchedFields.company_website && !errors.company_website && (
          <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
        )}
        <span className="text-xs text-gray-500 ml-2">(opcional)</span>
      </Label>
      <Input
        placeholder="www.suaempresa.com.br"
        {...register("company_website", { 
          pattern: {
            value: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i,
            message: "URL inválida"
          }
        })}
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
