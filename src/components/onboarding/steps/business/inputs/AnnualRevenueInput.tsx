
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const revenueOptions = [
  "Até R$ 100 mil",
  "R$ 100 mil - R$ 500 mil",
  "R$ 500 mil - R$ 2 milhões",
  "R$ 2 milhões - R$ 10 milhões",
  "R$ 10 milhões - R$ 50 milhões",
  "Acima de R$ 50 milhões",
  "Prefiro não informar",
];

interface AnnualRevenueInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const AnnualRevenueInput: React.FC<AnnualRevenueInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="annual_revenue" className="text-[#222] font-medium mb-1 block">
      Faturamento anual<span className="text-[#0ABAB5] ml-1">*</span>
    </Label>
    <Select value={value} onValueChange={onChange} required>
      <SelectTrigger
        id="annual_revenue"
        className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
      >
        <SelectValue placeholder="Selecione o faturamento" />
      </SelectTrigger>
      <SelectContent className="bg-white text-[#121212] shadow-lg z-50">
        {revenueOptions.map((revenue) => (
          <SelectItem key={revenue} value={revenue}>
            {revenue}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
