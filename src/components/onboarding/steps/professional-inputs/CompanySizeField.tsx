
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

export const CompanySizeField: React.FC = () => {
  const { setValue, watch, formState: { errors, touchedFields } } = useFormContext();
  const companySize = watch("company_size");

  const companySizes = [
    { value: "micro", label: "Micro (0-9 pessoas)" },
    { value: "pequena", label: "Pequena (10-49 pessoas)" },
    { value: "media", label: "Média (50-249 pessoas)" },
    { value: "grande", label: "Grande (250+ pessoas)" },
  ];

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center",
          errors.company_size ? "text-red-500" : 
          touchedFields.company_size ? "text-[#0ABAB5]" : ""
        )}
      >
        Porte da Empresa
        {touchedFields.company_size && !errors.company_size && (
          <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Select
        value={companySize}
        onValueChange={(value) => setValue("company_size", value, { 
          shouldValidate: true, 
          shouldTouch: true 
        })}
      >
        <SelectTrigger 
          className={cn(
            "transition-colors",
            errors.company_size ? "border-red-500" : 
            touchedFields.company_size ? "border-[#0ABAB5]" : ""
          )}
        >
          <SelectValue placeholder="Selecione o porte" />
        </SelectTrigger>
        <SelectContent>
          {companySizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
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
