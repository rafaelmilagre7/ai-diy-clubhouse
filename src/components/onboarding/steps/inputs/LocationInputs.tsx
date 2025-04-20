
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIBGELocations } from "@/hooks/useIBGELocations";

// Lista de países principais
const countries = [
  { name: "Brasil", code: "BR", flag: "🇧🇷" },
  { name: "Portugal", code: "PT", flag: "🇵🇹" },
  { name: "Estados Unidos", code: "US", flag: "🇺🇸" },
  { name: "Reino Unido", code: "GB", flag: "🇬🇧" },
  { name: "Espanha", code: "ES", flag: "🇪🇸" },
  { name: "Alemanha", code: "DE", flag: "🇩🇪" },
  { name: "França", code: "FR", flag: "🇫🇷" },
  { name: "Itália", code: "IT", flag: "🇮🇹" },
  { name: "México", code: "MX", flag: "🇲🇽" },
  { name: "Argentina", code: "AR", flag: "🇦🇷" },
];

interface LocationInputsProps {
  country: string;
  state: string;
  city: string;
  onChangeCountry: (value: string) => void;
  onChangeState: (value: string) => void;
  onChangeCity: (value: string) => void;
  disabled: boolean;
}

export const LocationInputs = ({
  country,
  state,
  city,
  onChangeCountry,
  onChangeState,
  onChangeCity,
  disabled,
}: LocationInputsProps) => {
  const { estados, cidadesPorEstado, isLoading } = useIBGELocations();
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    if (country === "Brasil" && state) {
      if (cidadesPorEstado[state]) {
        const cidadesOrdenadas = cidadesPorEstado[state]
          .map(cidade => cidade.name)
          .sort((a, b) => a.localeCompare(b));
        setAvailableCities(cidadesOrdenadas);
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  }, [country, state, cidadesPorEstado]);

  return (
    <>
      <div>
        <Label htmlFor="country">País</Label>
        <Select
          value={country}
          onValueChange={onChangeCountry}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(countryItem => (
              <SelectItem key={countryItem.code} value={countryItem.name}>
                {countryItem.flag} {countryItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="state">Estado</Label>
        {country === "Brasil" ? (
          <Select
            value={state}
            onValueChange={onChangeState}
            disabled={disabled || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {estados.map(estado => (
                <SelectItem key={estado.code} value={estado.code}>
                  {estado.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="state"
            type="text"
            value={state}
            disabled={disabled}
            onChange={e => onChangeState(e.target.value)}
            placeholder="Estado"
          />
        )}
      </div>
      <div>
        <Label htmlFor="city">Cidade</Label>
        {country === "Brasil" && availableCities.length > 0 ? (
          <Select
            value={city}
            onValueChange={onChangeCity}
            disabled={disabled || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a cidade" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {availableCities.map(cidade => (
                <SelectItem key={cidade} value={cidade}>
                  {cidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="city"
            type="text"
            value={city}
            disabled={disabled}
            onChange={e => onChangeCity(e.target.value)}
            placeholder="Cidade"
          />
        )}
      </div>
    </>
  );
};
