
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
  SelectValue
} from "@/components/ui/select";

// Lista de cargos comuns
const COMMON_POSITIONS = [
  "CEO",
  "Founder",
  "Sócio(a)",
  "Diretor(a) Executivo(a)",
  "Diretor(a) de Operações (COO)",
  "Diretor(a) Financeiro(a) (CFO)",
  "Diretor(a) de Marketing (CMO)",
  "Diretor(a) de Tecnologia (CTO)",
  "Gerente de Projetos",
  "Gerente de Marketing",
  "Gerente de Vendas",
  "Gerente de Produto",
  "Analista de Marketing",
  "Analista de Dados",
  "Desenvolvedor(a)",
  "UX/UI Designer",
  "Growth Hacker",
  "Consultor(a)",
  "Freelancer",
  "Outro"
];

export const CurrentPositionField: React.FC = () => {
  const { 
    register, 
    setValue, 
    watch, 
    formState: { errors, touchedFields } 
  } = useFormContext();
  
  const currentPositionValue = watch("current_position");

  const handlePositionChange = (value: string) => {
    setValue("current_position", value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center gap-2",
          errors.current_position ? "text-red-500" : 
          touchedFields.current_position ? "text-[#0ABAB5]" : ""
        )}
      >
        <Briefcase className="h-4 w-4" />
        Seu Cargo
        {touchedFields.current_position && !errors.current_position && (
          <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      
      <Select 
        value={currentPositionValue || ""}
        onValueChange={handlePositionChange}
      >
        <SelectTrigger 
          className={cn(
            "transition-all duration-200",
            errors.current_position ? "border-red-500" : 
            touchedFields.current_position ? "border-[#0ABAB5]" : ""
          )}
        >
          <SelectValue placeholder="Selecione seu cargo atual" />
        </SelectTrigger>
        <SelectContent>
          {COMMON_POSITIONS.map((position) => (
            <SelectItem key={position} value={position}>
              {position}
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
