
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldError } from "react-hook-form";

interface CompanyWebsiteInputProps {
  control: Control<any>;
  error?: FieldError;
}

export const CompanyWebsiteInput: React.FC<CompanyWebsiteInputProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="company_website">
        Website da Empresa <span className="text-gray-400 text-sm font-normal">(opcional)</span>
      </Label>
      <Controller
        name="company_website"
        control={control}
        render={({ field }) => (
          <Input
            id="company_website"
            {...field}
            placeholder="www.exemplo.com.br"
            className={error ? "border-red-500" : ""}
          />
        )}
      />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};
