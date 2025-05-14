
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormFeedback } from "@/components/ui/form-feedback";
import { Phone } from "lucide-react";
import { validateBrazilianPhone } from "@/utils/validationUtils";
import InputMask from "react-input-mask";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  ddi?: string;
  onChangeDDI?: (value: string) => void;
}

export const PhoneInput = ({ 
  value = "", 
  onChange, 
  disabled = false, 
  error,
  ddi = "+55",
  onChangeDDI
}: PhoneInputProps) => {
  const formContext = useFormContext();
  const register = formContext?.register;
  const errors = formContext?.formState?.errors;
  
  // Função para renderizar o campo com máscara
  const renderPhoneInput = (inputProps: any) => {
    const { ref, ...restProps } = inputProps;
    
    return (
      <InputMask
        mask="(99) 99999-9999"
        maskChar="_"
        alwaysShowMask={false}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
      >
        {(inputProps: any) => (
          <Input
            ref={ref}
            id="phone"
            type="tel"
            placeholder="(00) 00000-0000"
            className="pl-10"
            disabled={disabled}
            {...restProps}
          />
        )}
      </InputMask>
    );
  };
  
  // Se estiver usando react-hook-form
  if (register && errors && !onChange) {
    return (
      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium">
          Telefone
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Phone className="h-4 w-4 text-gray-500" />
          </div>
          <InputMask
            mask="(99) 99999-9999"
            maskChar="_"
            alwaysShowMask={false}
            {...register("phone", {
              validate: {
                validPhone: (value) => !value || validateBrazilianPhone(value) || "Telefone inválido"
              }
            })}
          >
            {(inputProps: any) => (
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                className={cn(
                  "pl-10",
                  errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
                )}
                {...inputProps}
              />
            )}
          </InputMask>
        </div>
        {errors.phone && (
          <FormFeedback error={errors.phone.message as string} />
        )}
      </div>
    );
  }
  
  // Se estiver usando componente controlado
  return (
    <div className="space-y-2">
      <label htmlFor="phone" className="block text-sm font-medium">
        Telefone
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Phone className="h-4 w-4 text-gray-500" />
        </div>
        <InputMask
          mask="(99) 99999-9999"
          maskChar="_"
          alwaysShowMask={false}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
        >
          {(inputProps: any) => (
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              className={cn(
                "pl-10",
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              )}
              disabled={disabled}
              {...inputProps}
            />
          )}
        </InputMask>
      </div>
      {error && (
        <FormFeedback error={error} />
      )}
    </div>
  );
};
