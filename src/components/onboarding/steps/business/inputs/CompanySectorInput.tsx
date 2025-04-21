
import React from "react";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldError } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompanySectorInputProps {
  control: Control<any>;
  error?: FieldError | Record<string, any>;
}

export const CompanySectorInput: React.FC<CompanySectorInputProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="company_sector">
        Setor de Atuação <span className="text-red-500">*</span>
      </Label>
      <Controller
        name="company_sector"
        control={control}
        rules={{ required: "Selecione o setor de atuação" }}
        render={({ field }) => (
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <SelectTrigger id="company_sector" className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione o setor de atuação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tecnologia">Tecnologia / TI</SelectItem>
              <SelectItem value="educacao">Educação</SelectItem>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="ecommerce">E-commerce / Varejo</SelectItem>
              <SelectItem value="servicos">Serviços Profissionais</SelectItem>
              <SelectItem value="marketing">Marketing / Publicidade</SelectItem>
              <SelectItem value="manufatura">Manufatura / Indústria</SelectItem>
              <SelectItem value="alimentacao">Alimentação</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-red-500 text-sm">{error.message as string}</p>}
    </div>
  );
};
