
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import InputMask from "react-input-mask";

interface PhoneInputProps {
  value: string;
  onChange: (field: string, value: string) => void;
  ddi?: string;
  readOnly?: boolean;
  error?: string;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  ddi = "+55",
  readOnly = false,
  disabled = false,
  error
}) => {
  return (
    <div className="flex">
      <Input 
        id="ddi" 
        value={ddi} 
        onChange={e => onChange("ddi", e.target.value)}
        className="w-16 mr-2"
        disabled={disabled || readOnly}
        readOnly={readOnly}
      />
      <InputMask
        mask="(99) 99999-9999"
        value={value}
        onChange={(e) => onChange("phone", e.target.value)}
        disabled={disabled || readOnly}
        readOnly={readOnly}
      >
        {(inputProps: any) => (
          <Input
            {...inputProps}
            id="phone"
            placeholder="(00) 00000-0000"
            className={cn(error && "border-red-500")}
          />
        )}
      </InputMask>
    </div>
  );
};
