
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CurrentPositionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CurrentPositionInput: React.FC<CurrentPositionInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="current_position" className="text-[#222] font-medium mb-1 block">
      Seu cargo atual<span className="text-[#0ABAB5] ml-1">*</span>
    </Label>
    <Input
      id="current_position"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      placeholder="Ex: Diretor, CEO, Marketing..."
      className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
      maxLength={48}
      autoComplete="organization-title"
    />
  </div>
);
