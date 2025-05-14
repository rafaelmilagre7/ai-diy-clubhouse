
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, Controller, FieldError } from "react-hook-form";
import { useIBGELocations } from "@/hooks/useIBGELocations";

interface LocationInputsProps {
  control: Control<any>;
  errors: {
    country?: FieldError;
    state?: FieldError;
    city?: FieldError;
  };
  defaultValues?: {
    country?: string;
    state?: string;
    city?: string;
  };
}

export const LocationInputs: React.FC<LocationInputsProps> = ({ control, errors, defaultValues }) => {
  const [selectedState, setSelectedState] = useState<string | undefined>(defaultValues?.state);
  const {
    estados,
    cidades,
    loadingEstados,
    loadingCidades,
    buscarEstados,
    buscarCidades,
  } = useIBGELocations();

  // Buscar estados quando o componente montar
  useEffect(() => {
    buscarEstados();
  }, [buscarEstados]);

  // Buscar cidades quando o estado for selecionado
  useEffect(() => {
    if (selectedState) {
      buscarCidades(selectedState);
    }
  }, [selectedState, buscarCidades]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country">
          País <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="country"
          control={control}
          rules={{ required: "O país é obrigatório" }}
          defaultValue={defaultValues?.country || "Brasil"}
          render={({ field }) => (
            <Input
              id="country"
              {...field}
              className={errors.country ? "border-red-500" : ""}
              readOnly
            />
          )}
        />
        {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="state">
          Estado <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="state"
          control={control}
          rules={{ required: "O estado é obrigatório" }}
          defaultValue={defaultValues?.state || ""}
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setSelectedState(value);
              }}
              value={field.value}
            >
              <SelectTrigger
                id="state"
                className={`${errors.state ? "border-red-500" : ""} ${loadingEstados ? "opacity-70" : ""}`}
                disabled={loadingEstados}
              >
                <SelectValue placeholder="Selecione seu estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map((estado) => (
                  <SelectItem key={estado.id} value={estado.sigla}>
                    {estado.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">
          Cidade <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="city"
          control={control}
          rules={{ required: "A cidade é obrigatória" }}
          defaultValue={defaultValues?.city || ""}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!selectedState || loadingCidades}
            >
              <SelectTrigger
                id="city"
                className={`${errors.city ? "border-red-500" : ""} ${
                  !selectedState || loadingCidades ? "opacity-70" : ""
                }`}
              >
                <SelectValue placeholder="Selecione sua cidade" />
              </SelectTrigger>
              <SelectContent>
                {cidades.map((cidade) => (
                  <SelectItem key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
      </div>
    </div>
  );
};
