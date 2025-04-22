
import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, Briefcase } from "lucide-react";
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

  const handleValueChange = (value: string) => {
    console.log("CompanySectorField: atualizando para", value);
    setValue("company_sector", value, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const sectors = [
    { value: "tecnologia", label: "Tecnologia" },
    { value: "saude", label: "Saúde" },
    { value: "educacao", label: "Educação" },
    { value: "financas", label: "Finanças" },
    { value: "varejo", label: "Varejo" },
    { value: "industria", label: "Indústria" },
    { value: "agronegocio", label: "Agronegócio" },
    { value: "construcao", label: "Construção" },
    { value: "logistica", label: "Logística" },
    { value: "alimentacao", label: "Alimentação" },
    { value: "turismo", label: "Turismo" },
    { value: "entretenimento", label: "Entretenimento" },
    { value: "consultoria", label: "Consultoria" },
    { value: "marketing", label: "Marketing" },
    { value: "inteligencia-artificial", label: "Inteligência Artificial" },
    { value: "outros", label: "Outros" }
  ];

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center gap-2",
          errors.company_sector ? "text-red-500" : 
          touchedFields.company_sector ? "text-[#0ABAB5]" : ""
        )}
      >
        <Briefcase className="h-4 w-4" />
        Setor de Atuação
        {touchedFields.company_sector && !errors.company_sector && (
          <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Select
        value={companySector}
        onValueChange={handleValueChange}
      >
        <SelectTrigger 
          className={cn(
            "transition-colors",
            errors.company_sector ? "border-red-500" : 
            touchedFields.company_sector ? "border-[#0ABAB5]" : ""
          )}
        >
          <SelectValue placeholder="Selecione o setor de atuação" />
        </SelectTrigger>
        <SelectContent>
          {sectors.map((sector) => (
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
