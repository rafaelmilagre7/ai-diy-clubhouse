
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";
import InputMask from "react-input-mask";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  ddi?: string;
  onChangeDDI?: (value: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur = () => {},
  error,
  disabled = false,
  ddi = "+55",
  onChangeDDI
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className={cn(
        "transition-colors",
        error ? "text-red-500" : value ? "text-[#0ABAB5]" : ""
      )}>
        Telefone <span className="text-gray-400">(opcional)</span>
      </Label>
      <div className="flex">
        {onChangeDDI && (
          <div className="w-16 mr-2">
            <Input
              id="ddi"
              value={ddi}
              onChange={(e) => onChangeDDI(e.target.value)}
              disabled={disabled}
              className={cn(
                "transition-all duration-200",
                error ? "border-red-500 focus:border-red-500" : 
                value ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
              )}
            />
          </div>
        )}
        <div className="flex-1">
          <InputMask
            mask="(99) 99999-9999"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="phone"
                placeholder="(00) 00000-0000"
                className={cn(
                  "transition-all duration-200",
                  error ? "border-red-500 focus:border-red-500" : 
                  value ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
                )}
              />
            )}
          </InputMask>
        </div>
      </div>
      <FormMessage
        type={value && !error ? "success" : "error"}
        message={error}
      />
    </div>
  );
};
