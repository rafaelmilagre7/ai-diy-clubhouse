
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

export const CurrentPositionField: React.FC = () => {
  const { setValue, watch, formState: { errors, touchedFields } } = useFormContext();
  const currentPosition = watch("current_position");

  const positions = [
    { value: "ceo", label: "CEO" },
    { value: "founder", label: "Founder" },
    { value: "socio", label: "Sócio" },
    { value: "diretor-executivo", label: "Diretor(a) Executivo(a)" },
    { value: "diretor-operacoes", label: "Diretor(a) de Operações (COO)" },
    { value: "diretor-financeiro", label: "Diretor(a) Financeiro(a) (CFO)" },
    { value: "diretor-marketing", label: "Diretor(a) de Marketing (CMO)" },
    { value: "diretor-tecnologia", label: "Diretor(a) de Tecnologia (CTO)" },
    { value: "gerente-projetos", label: "Gerente de Projetos" },
    { value: "gerente-marketing", label: "Gerente de Marketing" },
    { value: "gerente-vendas", label: "Gerente de Vendas" },
    { value: "analista-marketing", label: "Analista de Marketing" },
    { value: "analista-dados", label: "Analista de Dados" },
    { value: "desenvolvedor", label: "Desenvolvedor(a)" },
    { value: "designer", label: "UX/UI Designer" },
    { value: "growth", label: "Growth Hacker" },
    { value: "consultor", label: "Consultor(a)" },
    { value: "freelancer", label: "Freelancer" },
    { value: "outro", label: "Outro" },
  ];

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center",
          errors.current_position ? "text-red-500" : 
          touchedFields.current_position ? "text-[#0ABAB5]" : ""
        )}
      >
        Cargo Atual
        {touchedFields.current_position && !errors.current_position && (
          <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Select
        value={currentPosition}
        onValueChange={(value) => setValue("current_position", value, { 
          shouldValidate: true, 
          shouldTouch: true 
        })}
      >
        <SelectTrigger 
          className={cn(
            "transition-colors",
            errors.current_position ? "border-red-500" : 
            touchedFields.current_position ? "border-[#0ABAB5]" : ""
          )}
        >
          <SelectValue placeholder="Selecione seu cargo" />
        </SelectTrigger>
        <SelectContent>
          {positions.map((position) => (
            <SelectItem key={position.value} value={position.value}>
              {position.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage 
        type={touchedFields.current_position && !errors.current_position ? "success" : "error"}
        message={errors.current_position?.message?.toString()}
      />
    </div>
  );
};
