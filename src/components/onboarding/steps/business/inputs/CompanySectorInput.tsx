
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const sectorOptions = [
  "Agroindústria",
  "Alimentos e Bebidas",
  "Automotivo",
  "Bancos e Finanças",
  "Comércio e Varejo",
  "Construção Civil",
  "Educação",
  "Energia",
  "Entretenimento",
  "Imobiliário",
  "Indústria 4.0",
  "Logística e Transportes",
  "Saúde",
  "Seguros",
  "Serviços de Inteligência Artificial",
  "Tecnologia da Informação",
  "Turismo e Hotelaria",
  "Inteligência Artificial",
  "Outro",
];

interface CompanySectorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CompanySectorInput: React.FC<CompanySectorInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="company_sector" className="text-[#222] font-medium mb-1 block">
      Setor de atuação<span className="text-[#0ABAB5] ml-1">*</span>
    </Label>
    <Select value={value} onValueChange={onChange} required>
      <SelectTrigger
        id="company_sector"
        className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
      >
        <SelectValue placeholder="Selecione o setor" />
      </SelectTrigger>
      <SelectContent className="bg-white text-[#121212] shadow-lg z-50">
        {sectorOptions.map((sector) => (
          <SelectItem key={sector} value={sector}>
            {sector}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
