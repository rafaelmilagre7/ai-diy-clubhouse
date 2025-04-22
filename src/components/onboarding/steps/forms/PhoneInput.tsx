
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputMask from "react-input-mask";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
  ddi?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  readOnly = false,
  ddi = "+55"
}) => {
  return (
    <div>
      <Label htmlFor="phone">Telefone</Label>
      <div className="flex">
        <Input 
          id="ddi" 
          value={ddi} 
          readOnly 
          className="w-16 mr-2"
        />
        <InputMask
          mask="(99) 99999-9999"
          value={value}
          onChange={(e) => onChange("phone", e.target.value)}
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              readOnly={readOnly}
              placeholder="(00) 00000-0000"
            />
          )}
        </InputMask>
      </div>
    </div>
  );
};
