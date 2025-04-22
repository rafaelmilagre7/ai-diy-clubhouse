
import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AnnualRevenueField: React.FC = () => {
  const { setValue, watch, formState: { errors, touchedFields } } = useFormContext();
  const annualRevenue = watch("annual_revenue");

  const handleValueChange = (value: string) => {
    console.log("AnnualRevenueField: atualizando para", value);
    // Usar setValue com opções que previnem validação imediata
    setValue("annual_revenue", value, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const annualRevenueOptions = [
    { value: "0-100k", label: "Até R$ 100 mil" },
    { value: "100k-500k", label: "R$ 100 mil a R$ 500 mil" },
    { value: "500k-1m", label: "R$ 500 mil a R$ 1 milhão" },
    { value: "1m-5m", label: "R$ 1 milhão a R$ 5 milhões" },
    { value: "5m-10m", label: "R$ 5 milhões a R$ 10 milhões" },
    { value: "+10m", label: "Acima de R$ 10 milhões" },
  ];

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center gap-2",
          errors.annual_revenue ? "text-red-500" : 
          touchedFields.annual_revenue ? "text-[#0ABAB5]" : ""
        )}
      >
        <DollarSign className="h-4 w-4" />
        Faturamento Anual
        {touchedFields.annual_revenue && !errors.annual_revenue && (
          <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Select
        value={annualRevenue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger 
          className={cn(
            "transition-colors",
            errors.annual_revenue ? "border-red-500" : 
            touchedFields.annual_revenue ? "border-[#0ABAB5]" : ""
          )}
        >
          <SelectValue placeholder="Selecione o faturamento" />
        </SelectTrigger>
        <SelectContent>
          {annualRevenueOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage 
        type={touchedFields.annual_revenue && !errors.annual_revenue ? "success" : "error"}
        message={errors.annual_revenue?.message?.toString()}
      />
    </div>
  );
};
