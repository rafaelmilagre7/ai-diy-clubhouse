
import React from "react";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldError } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnnualRevenueInputProps {
  control: Control<any>;
  error?: FieldError;
}

export const AnnualRevenueInput: React.FC<AnnualRevenueInputProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="annual_revenue">
        Faturamento Anual <span className="text-red-500">*</span>
      </Label>
      <Controller
        name="annual_revenue"
        control={control}
        rules={{ required: "Selecione o faturamento anual" }}
        render={({ field }) => (
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <SelectTrigger id="annual_revenue" className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione o faturamento anual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ate100k">Até R$ 100 mil</SelectItem>
              <SelectItem value="100k-500k">R$ 100 mil a R$ 500 mil</SelectItem>
              <SelectItem value="500k-1m">R$ 500 mil a R$ 1 milhão</SelectItem>
              <SelectItem value="1m-5m">R$ 1 milhão a R$ 5 milhões</SelectItem>
              <SelectItem value="5m-10m">R$ 5 milhões a R$ 10 milhões</SelectItem>
              <SelectItem value="10m-50m">R$ 10 milhões a R$ 50 milhões</SelectItem>
              <SelectItem value="50m-100m">R$ 50 milhões a R$ 100 milhões</SelectItem>
              <SelectItem value="mais100m">Mais de R$ 100 milhões</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};
