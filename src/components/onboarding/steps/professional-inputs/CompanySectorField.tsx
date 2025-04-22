
import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, Building2 } from "lucide-react";
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
    // Usar setValue com opções que previnem validação imediata
    setValue("company_sector", value, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const sectorOptions = [
    { value: "inteligencia-artificial", label: "Inteligência Artificial" },
    { value: "tecnologia", label: "Tecnologia / TI" },
    { value: "educacao", label: "Educação" },
    { value: "saude", label: "Saúde" },
    { value: "financeiro", label: "Financeiro" },
    { value: "ecommerce", label: "E-commerce / Varejo" },
    { value: "servicos-profissionais", label: "Serviços Profissionais" },
    { value: "marketing", label: "Marketing / Publicidade" },
    { value: "industria", label: "Manufatura / Indústria" },
    { value: "alimentacao", label: "Alimentação" },
    { value: "construcao", label: "Construção Civil" },
    { value: "imobiliario", label: "Imobiliário" },
    { value: "transporte", label: "Transporte / Logística" },
    { value: "agronegocio", label: "Agronegócio" },
    { value: "energia", label: "Energia / Sustentabilidade" },
    { value: "juridico", label: "Jurídico" },
    { value: "rh", label: "Recursos Humanos / Recrutamento" },
    { value: "consultoria", label: "Consultoria" },
    { value: "governo", label: "Governo / Setor Público" },
    { value: "outro", label: "Outro" },
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
        <Building2 className="h-4 w-4" />
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
          {sectorOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
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
