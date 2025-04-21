
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldError } from "react-hook-form";

interface CompanyNameInputProps {
  control: Control<any>;
  error?: FieldError;
}

export const CompanyNameInput: React.FC<CompanyNameInputProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="company_name">
        Nome da Empresa <span className="text-red-500">*</span>
      </Label>
      <Controller
        name="company_name"
        control={control}
        rules={{ required: "O nome da empresa é obrigatório" }}
        render={({ field }) => (
          <Input
            id="company_name"
            {...field}
            placeholder="Digite o nome da sua empresa"
            className={error ? "border-red-500" : ""}
          />
        )}
      />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};
