
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CompanyNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const CompanyNameInput: React.FC<CompanyNameInputProps> = ({ value, onChange, error }) => (
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
      className={`mt-1 bg-[#f6f8fa] border-[1.4px] ${
        error ? "border-red-500" : "border-[#eaeaea]"
      } focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400`}
      maxLength={80}
      autoComplete="organization"
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);
