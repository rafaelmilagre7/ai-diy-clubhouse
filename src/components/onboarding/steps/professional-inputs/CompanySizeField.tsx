
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

export const CompanySizeField: React.FC = () => {
  const { setValue, watch, formState: { errors, touchedFields } } = useFormContext();
  const companySize = watch("company_size");

  const companySizes = [
    { value: "solo", label: "Somente eu" },
    { value: "2-5", label: "2-5 funcionários" },
    { value: "6-10", label: "6-10 funcionários" },
    { value: "11-25", label: "11-25 funcionários" },
    { value: "26-50", label: "26-50 funcionários" },
    { value: "51-100", label: "51-100 funcionários" },
    { value: "101-250", label: "101-250 funcionários" },
    { value: "251-500", label: "251-500 funcionários" },
    { value: "501-1000", label: "501-1000 funcionários" },
    { value: "1000+", label: "Mais de 1000 funcionários" },
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
          <SelectValue placeholder="Selecione o tamanho" />
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
