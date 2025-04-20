
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CompanyWebsiteInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CompanyWebsiteInput: React.FC<CompanyWebsiteInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="company_website" className="text-[#222] font-medium mb-1 block">
      Website da empresa
    </Label>
    <Input
      id="company_website"
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Ex: https://minhaempresa.com.br"
      className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
      maxLength={120}
      autoComplete="url"
    />
  </div>
);
