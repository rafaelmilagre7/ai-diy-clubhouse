
import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfessionalDataForm } from "./useProfessionalDataForm";

export const CompanySizeField: React.FC = () => {
  const { setValue, watch, formState: { errors, touchedFields } } = useFormContext();
  const companySize = watch("company_size");

  const handleValueChange = (value: string) => {
    console.log("CompanySizeField: atualizando para", value);
    // Usar setValue com opções que previnem validação imediata
    setValue("company_size", value, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const companySizeOptions = [
    { value: "1-10", label: "1-10 funcionários" },
    { value: "11-50", label: "11-50 funcionários" },
    { value: "51-200", label: "51-200 funcionários" },
    { value: "201-500", label: "201-500 funcionários" },
    { value: "501-1000", label: "501-1000 funcionários" },
    { value: "1001+", label: "Mais de 1000 funcionários" },
  ];

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center gap-2",
          errors.company_size ? "text-red-500" : 
          touchedFields.company_size ? "text-[#0ABAB5]" : ""
        )}
      >
        <Users className="h-4 w-4" />
        Tamanho da Empresa
        {touchedFields.company_size && !errors.company_size && (
          <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Select
        value={companySize}
        onValueChange={handleValueChange}
      >
        <SelectTrigger 
          className={cn(
            "transition-colors",
            errors.company_size ? "border-red-500" : 
            touchedFields.company_size ? "border-[#0ABAB5]" : ""
          )}
        >
          <SelectValue placeholder="Selecione o tamanho da empresa" />
        </SelectTrigger>
        <SelectContent>
          {companySizeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage 
        type={touchedFields.company_size && !errors.company_size ? "success" : "error"}
        message={errors.company_size?.message?.toString()}
      />
    </div>
  );
};
