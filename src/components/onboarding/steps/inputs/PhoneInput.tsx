
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldError } from "react-hook-form";
import InputMask from "react-input-mask";

interface PhoneInputProps {
  control: Control<any>;
  error?: FieldError;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone">
        Telefone <span className="text-red-500">*</span>
      </Label>
      <Controller
        name="phone"
        control={control}
        rules={{ required: "O telefone é obrigatório" }}
        render={({ field }) => (
          <InputMask
            mask="(99) 99999-9999"
            maskChar={null}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          >
            {(inputProps: any) => (
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                className={error ? "border-red-500" : ""}
                {...inputProps}
              />
            )}
          </InputMask>
        )}
      />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};
