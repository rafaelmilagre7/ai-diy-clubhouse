
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { FieldError } from "react-hook-form";

interface LocationInputsProps {
  country: string;
  state: string;
  city: string;
  onChangeCountry: (value: string) => void;
  onChangeState: (value: string) => void;
  onChangeCity: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  defaultValues?: {
    country?: string;
    state?: string;
    city?: string;
  };
  errors?: {
    country?: string | FieldError;
    state?: string | FieldError;
    city?: string | FieldError;
  };
}

export const LocationInputs = ({
  country,
  state,
  city,
  onChangeCountry,
  onChangeState,
  onChangeCity,
  disabled,
  readOnly,
  defaultValues,
  errors = {}
}: LocationInputsProps) => {
  const { 
    estados, 
    cidades, 
    loadingEstados, 
    loadingCidades, 
    buscarEstados, 
    buscarCidades 
  } = useIBGELocations();

  const [availableCountries] = useState([
    { value: "Brasil", label: "Brasil" },
  ]);

  useEffect(() => {
    buscarEstados();
  }, [buscarEstados]);

  useEffect(() => {
    if (state) {
      buscarCidades(state);
    }
  }, [state, buscarCidades]);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-6">
      <h3 className="text-lg font-semibold text-[#0ABAB5]">Localização</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="country">País</Label>
          <Select
            value={country}
            onValueChange={onChangeCountry}
            disabled={disabled || readOnly || availableCountries.length === 1}
          >
            <SelectTrigger id="country" className={errors.country ? "border-red-400" : ""}>
              <SelectValue placeholder="Selecione um país" />
            </SelectTrigger>
            <SelectContent>
              {availableCountries.map(country => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-xs text-red-500 mt-1">
              {typeof errors.country === 'string' ? errors.country : errors.country.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="state">Estado</Label>
          <Select
            value={state}
            onValueChange={onChangeState}
            disabled={disabled || loadingEstados || country !== "Brasil"}
          >
            <SelectTrigger id="state" className={errors.state ? "border-red-400" : ""}>
              <SelectValue placeholder={loadingEstados ? "Carregando estados..." : "Selecione um estado"} />
            </SelectTrigger>
            <SelectContent>
              {loadingEstados ? (
                <div className="flex items-center justify-center p-2">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Carregando...</span>
                </div>
              ) : (
                estados.map(estado => (
                  <SelectItem key={estado.id} value={estado.sigla}>
                    {estado.nome}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-xs text-red-500 mt-1">
              {typeof errors.state === 'string' ? errors.state : errors.state.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="city">Cidade</Label>
          <Select
            value={city}
            onValueChange={onChangeCity}
            disabled={disabled || loadingCidades || !state || country !== "Brasil"}
          >
            <SelectTrigger id="city" className={errors.city ? "border-red-400" : ""}>
              <SelectValue placeholder={!state ? "Selecione um estado primeiro" : loadingCidades ? "Carregando cidades..." : "Selecione uma cidade"} />
            </SelectTrigger>
            <SelectContent>
              {loadingCidades ? (
                <div className="flex items-center justify-center p-2">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Carregando...</span>
                </div>
              ) : (
                cidades.map(cidade => (
                  <SelectItem key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="text-xs text-red-500 mt-1">
              {typeof errors.city === 'string' ? errors.city : errors.city.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
