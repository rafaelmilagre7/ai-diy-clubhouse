
import React from "react";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldError } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurrentPositionSelectInputProps {
  control: Control<any>;
  error?: FieldError | Record<string, any>;
}

const POSITIONS = [
  "CEO",
  "Founder",
  "Sócio",
  "Diretor(a) Executivo(a)",
  "Diretor(a) de Operações (COO)",
  "Diretor(a) Financeiro(a) (CFO)",
  "Diretor(a) de Marketing (CMO)",
  "Diretor(a) de Tecnologia (CTO)",
  "Gerente de Projetos",
  "Gerente de Marketing",
  "Gerente de Vendas",
  "Analista de Marketing",
  "Analista de Dados",
  "Desenvolvedor(a)",
  "UX/UI Designer",
  "Growth Hacker",
  "Consultor(a)",
  "Freelancer",
  "Outro"
];

export const CurrentPositionSelectInput: React.FC<CurrentPositionSelectInputProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="current_position">
        Cargo Atual <span className="text-red-500">*</span>
      </Label>
      <Controller
        name="current_position"
        control={control}
        rules={{ required: "O cargo atual é obrigatório" }}
        render={({ field }) => (
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <SelectTrigger id="current_position" className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione seu cargo atual" />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((position) => (
                <SelectItem value={position} key={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-red-500 text-sm">{error.message as string}</p>}
    </div>
  );
};
