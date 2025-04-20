
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useIBGELocations } from "@/hooks/useIBGELocations";

interface LocationInputsProps {
  country: string;
  state: string;
  city: string;
  onChangeCountry: (value: string) => void;
  onChangeState: (value: string) => void;
  onChangeCity: (value: string) => void;
  disabled: boolean;
  errors?: {
    state?: string;
    city?: string;
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
  errors = {},
}: LocationInputsProps) => {
  const { estados, cidadesPorEstado, isLoading } = useIBGELocations();
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Atualizar cidades disponíveis quando o estado mudar
  useEffect(() => {
    if (state && cidadesPorEstado[state]) {
      const cidadesDoEstado = cidadesPorEstado[state].map(city => city.name);
      setAvailableCities(cidadesDoEstado);
    } else {
      setAvailableCities([]);
    }
  }, [state, cidadesPorEstado]);

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="country">País</Label>
        <Select
          value={country}
          onValueChange={onChangeCountry}
          disabled={disabled}
        >
          <SelectTrigger id="country">
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Brasil">🇧🇷 Brasil</SelectItem>
            <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
            <SelectItem value="EUA">🇺🇸 Estados Unidos</SelectItem>
            <SelectItem value="Canadá">🇨🇦 Canadá</SelectItem>
            <SelectItem value="Reino Unido">🇬🇧 Reino Unido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="state">Estado</Label>
        <Select
          value={state}
          onValueChange={(value) => {
            onChangeState(value);
            // Limpar cidade ao trocar de estado
            onChangeCity("");
          }}
          disabled={disabled}
        >
          <SelectTrigger id="state" className={errors.state ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {country === "Brasil" && !isLoading && estados.map(st => (
              <SelectItem key={st.code} value={st.code}>
                {st.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="city">Cidade</Label>
        <Select
          value={city}
          onValueChange={onChangeCity}
          disabled={disabled || !state || isLoading}
        >
          <SelectTrigger id="city" className={errors.city ? 'border-red-500' : ''}>
            <SelectValue placeholder={state ? "Selecione a cidade" : "Primeiro selecione o estado"} />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="">Carregando cidades...</SelectItem>
            ) : availableCities.length > 0 ? (
              availableCities.map(cityName => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))
            ) : (
              state && <SelectItem value="Outra">Outra cidade</SelectItem>
            )}
          </SelectContent>
        </Select>
        {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
      </div>
    </>
  );
};
