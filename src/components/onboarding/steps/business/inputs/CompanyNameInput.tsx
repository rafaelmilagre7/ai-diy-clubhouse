
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CompanyNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CompanyNameInput: React.FC<CompanyNameInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="company_name" className="text-[#222] font-medium mb-1 block">
      Nome da empresa<span className="text-[#0ABAB5] ml-1">*</span>
    </Label>
    <Input
      id="company_name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      placeholder="Ex: Milagre Digital"
      className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
      maxLength={80}
      autoComplete="organization"
    />
  </div>
);
