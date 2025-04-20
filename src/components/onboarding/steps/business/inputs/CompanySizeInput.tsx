
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const sizeOptions = [
  "Autônomo/MEI",
  "1-10 colaboradores",
  "11-50 colaboradores",
  "51-200 colaboradores",
  "201-500 colaboradores",
  "501-1000 colaboradores",
  "Mais de 1000",
];

interface CompanySizeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CompanySizeInput: React.FC<CompanySizeInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="company_size" className="text-[#222] font-medium mb-1 block">
      Tamanho da empresa<span className="text-[#0ABAB5] ml-1">*</span>
    </Label>
    <Select value={value} onValueChange={onChange} required>
      <SelectTrigger
        id="company_size"
        className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
      >
        <SelectValue placeholder="Selecione o porte" />
      </SelectTrigger>
      <SelectContent className="bg-white text-[#121212] shadow-lg z-50">
        {sizeOptions.map((size) => (
          <SelectItem key={size} value={size}>
            {size}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
