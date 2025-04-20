
import React from "react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface CurrentPositionInputProps {
  value: string;
  onChange: (value: string) => void;
}

// Lista de cargos comuns
const CARGOS = [
  "CEO / Diretor Executivo",
  "Diretor / C-Level",
  "Gerente",
  "Coordenador",
  "Especialista",
  "Analista",
  "Assistente",
  "Consultor",
  "Empreendedor / Proprietário",
  "Desenvolvedor / Programador",
  "Marketing / Vendas",
  "Estudante",
  "Outro"
];

export const CurrentPositionInput: React.FC<CurrentPositionInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="current_position" className="text-[#222] font-medium mb-1 block">
      Seu cargo atual<span className="text-[#0ABAB5] ml-1">*</span>
    </Label>
    <Select 
      value={value} 
      onValueChange={onChange}
      required
    >
      <SelectTrigger 
        id="current_position"
        className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] w-full"
      >
        <SelectValue placeholder="Selecione seu cargo" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {CARGOS.map((cargo) => (
          <SelectItem key={cargo} value={cargo}>
            {cargo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
