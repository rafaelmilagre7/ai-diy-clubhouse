
import React from "react";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldError } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompanySizeInputProps {
  control: Control<any>;
  error?: FieldError;
}

export const CompanySizeInput: React.FC<CompanySizeInputProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="company_size">
        Tamanho da Empresa <span className="text-red-500">*</span>
      </Label>
      <Controller
        name="company_size"
        control={control}
        rules={{ required: "Selecione o tamanho da empresa" }}
        render={({ field }) => (
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <SelectTrigger id="company_size" className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione o tamanho da empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 funcionários</SelectItem>
              <SelectItem value="11-50">11-50 funcionários</SelectItem>
              <SelectItem value="51-200">51-200 funcionários</SelectItem>
              <SelectItem value="201-500">201-500 funcionários</SelectItem>
              <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
              <SelectItem value="1001+">Mais de 1000 funcionários</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};
