
import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CompanySectorField: React.FC = () => {
  const { setValue, watch, formState: { errors, touchedFields } } = useFormContext();
  const companySector = watch("company_sector");

  const companySectors = [
    { value: "tecnologia", label: "Tecnologia" },
    { value: "educacao", label: "Educação" },
    { value: "saude", label: "Saúde" },
    { value: "financas", label: "Finanças" },
    { value: "comercio", label: "Comércio" },
    { value: "servicos", label: "Serviços" },
    { value: "industria", label: "Indústria" },
    { value: "agronegocio", label: "Agronegócio" },
    { value: "outro", label: "Outro" },
  ];

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center",
          errors.company_sector ? "text-red-500" : 
          touchedFields.company_sector ? "text-[#0ABAB5]" : ""
        )}
      >
        Setor de Atuação
        {touchedFields.company_sector && !errors.company_sector && (
          <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Select
        value={companySector}
        onValueChange={(value) => setValue("company_sector", value, { 
          shouldValidate: true, 
          shouldTouch: true 
        })}
      >
        <SelectTrigger 
          className={cn(
            "transition-colors",
            errors.company_sector ? "border-red-500" : 
            touchedFields.company_sector ? "border-[#0ABAB5]" : ""
          )}
        >
          <SelectValue placeholder="Selecione o setor" />
        </SelectTrigger>
        <SelectContent>
          {companySectors.map((sector) => (
            <SelectItem key={sector.value} value={sector.value}>
              {sector.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage 
        type={touchedFields.company_sector && !errors.company_sector ? "success" : "error"}
        message={errors.company_sector?.message?.toString()}
      />
    </div>
  );
};
