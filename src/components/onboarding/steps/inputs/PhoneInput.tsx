
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";
import InputMask from "react-input-mask";
import { CheckCircle, AlertCircle } from "lucide-react";
import { validateBrazilianPhone } from "@/utils/validationUtils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  ddi?: string;
  onChangeDDI?: (value: string) => void;
  isValid?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur = () => {},
  error,
  disabled = false,
  ddi = "+55",
  onChangeDDI,
  isValid = false
}) => {
  const phoneIsValid = value ? validateBrazilianPhone(value) : true;
  
  // Certifica-se de que o DDI começa com + (se tiver conteúdo)
  const formatDDI = (ddiValue: string) => {
    if (!ddiValue) return "+55";
    return ddiValue.startsWith('+') ? ddiValue : `+${ddiValue}`;
  };
  
  // Manipula a mudança do DDI garantindo que sempre começa com +
  const handleDDIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeDDI) {
      const newDDI = formatDDI(e.target.value.replace(/\D/g, ''));
      onChangeDDI(newDDI);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className={cn(
        "transition-colors flex items-center gap-2",
        error ? "text-red-500" : value && phoneIsValid ? "text-[#0ABAB5]" : ""
      )}>
        Telefone <span className="text-gray-400">(opcional)</span>
        {value && (
          phoneIsValid ? (
            <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )
        )}
      </Label>
      <div className="flex">
        {onChangeDDI && (
          <div className="w-16 mr-2">
            <Input
              id="ddi"
              value={ddi}
              onChange={handleDDIChange}
              disabled={disabled}
              className={cn(
                "transition-all duration-200",
                error ? "border-red-500 focus:border-red-500" : 
                value && phoneIsValid ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
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
                  value && phoneIsValid ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
                )}
              />
            )}
          </InputMask>
        </div>
      </div>
      <FormMessage
        type={value && phoneIsValid ? "success" : "error"}
        message={error || (value && !phoneIsValid ? "Digite um número de celular válido" : undefined)}
      />
    </div>
  );
};
