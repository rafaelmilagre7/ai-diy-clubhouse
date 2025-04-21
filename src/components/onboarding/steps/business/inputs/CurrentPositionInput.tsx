
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldError } from "react-hook-form";

interface CurrentPositionInputProps {
  control: Control<any>;
  error?: FieldError | Record<string, any>;
}

export const CurrentPositionInput: React.FC<CurrentPositionInputProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="current_position">
        Cargo Atual <span className="text-red-500">*</span>
      </Label>
      <Controller
        name="current_position"
        control={control}
        rules={{ required: "O cargo atual é obrigatório" }}
        render={({ field }) => (
          <Input
            id="current_position"
            {...field}
            placeholder="Seu cargo na empresa"
            className={error ? "border-red-500" : ""}
          />
        )}
      />
      {error && <p className="text-red-500 text-sm">{error.message as string}</p>}
    </div>
  );
};
