
import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, Building } from "lucide-react";
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

  const sectors = [
    { value: "tecnologia", label: "Tecnologia e Software" },
    { value: "saude", label: "Saúde e Bem-estar" },
    { value: "educacao", label: "Educação e Ensino" },
    { value: "financas", label: "Finanças e Seguros" },
    { value: "varejo", label: "Varejo e Comércio" },
    { value: "servicos", label: "Serviços Profissionais" },
    { value: "manufatura", label: "Manufatura e Indústria" },
    { value: "alimentacao", label: "Alimentação e Bebidas" },
    { value: "imobiliario", label: "Imobiliário" },
    { value: "marketing", label: "Marketing e Publicidade" },
    { value: "consultoria", label: "Consultoria" },
    { value: "turismo", label: "Turismo e Hotelaria" },
    { value: "recursos-humanos", label: "Recursos Humanos" },
    { value: "logistica", label: "Logística e Transporte" },
    { value: "construcao", label: "Construção Civil" },
    { value: "agricultura", label: "Agricultura" },
    { value: "energia", label: "Energia" },
    { value: "meio-ambiente", label: "Meio Ambiente" },
    { value: "entretenimento", label: "Entretenimento e Mídia" },
    { value: "outro", label: "Outro" }
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
        <Building className="h-4 w-4" />
        Setor de Atuação
        {touchedFields.company_sector && !errors.company_sector && (
          <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
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
