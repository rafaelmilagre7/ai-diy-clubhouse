
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const CompanyNameField: React.FC = () => {
  const { register, formState: { errors, touchedFields } } = useFormContext();

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center",
          errors.company_name ? "text-red-500" : 
          touchedFields.company_name ? "text-[#0ABAB5]" : ""
        )}
      >
        Nome da Empresa
        {touchedFields.company_name && !errors.company_name && (
          <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Input
        placeholder="Nome da sua empresa"
        {...register("company_name", { 
          required: "Nome da empresa é obrigatório",
          minLength: { value: 2, message: "Nome muito curto" },
          validate: (value) => {
            // Só validar quando o usuário terminar de digitar (campo perder o foco)
            // ou quando houver pelo menos 2 caracteres
            if (value.length < 2 && value.length > 0) {
              return "Nome muito curto";
            }
            return true;
          }
        })}
        className={cn(
          "transition-all duration-200",
          errors.company_name && errors.company_name.type !== "validate" ? "border-red-500" : 
          touchedFields.company_name && !errors.company_name ? "border-[#0ABAB5]" : ""
        )}
      />
      <FormMessage 
        type={touchedFields.company_name && !errors.company_name ? "success" : "error"}
        message={errors.company_name?.message?.toString()}
      />
    </div>
  );
};
