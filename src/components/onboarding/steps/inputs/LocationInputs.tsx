
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";
import { useIBGELocations } from "@/hooks/useIBGELocations";

interface LocationInputsProps {
  country: string;
  state: string;
  city: string;
  onChangeCountry: (value: string) => void;
  onChangeState: (value: string) => void;
  onChangeCity: (value: string) => void;
  disabled?: boolean;
  errors?: {
    state?: string;
    city?: string;
  };
}

export const LocationInputs: React.FC<LocationInputsProps> = ({
  country,
  state,
  city,
  onChangeState,
  onChangeCity,
  disabled,
  errors = {}
}) => {
  const { estados, cidadesPorEstado, isLoading } = useIBGELocations();

  const cidadesDoEstado = state ? cidadesPorEstado[state] || [] : [];

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="country">País</Label>
        <Input
          id="country"
          value={country}
          disabled={true}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="state">Estado</Label>
        <select
          id="state"
          value={state}
          onChange={(e) => onChangeState(e.target.value)}
          disabled={disabled || isLoading}
          className={cn(
            "w-full px-3 py-2 border rounded-md",
            "bg-white dark:bg-gray-800",
            "text-gray-900 dark:text-gray-100",
            "disabled:opacity-50",
            "transition-colors",
            errors.state ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#0ABAB5]"
          )}
        >
          <option value="">Selecione o estado</option>
          {estados.map((estado) => (
            <option key={estado.code} value={estado.code}>
              {estado.name}
            </option>
          ))}
        </select>
        <FormMessage
          type="error"
          message={errors.state}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Cidade</Label>
        <select
          id="city"
          value={city}
          onChange={(e) => onChangeCity(e.target.value)}
          disabled={disabled || !state || isLoading}
          className={cn(
            "w-full px-3 py-2 border rounded-md",
            "bg-white dark:bg-gray-800",
            "text-gray-900 dark:text-gray-100",
            "disabled:opacity-50",
            "transition-colors",
            errors.city ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#0ABAB5]"
          )}
        >
          <option value="">Selecione a cidade</option>
          {cidadesDoEstado.map((cidade) => (
            <option key={cidade.code} value={cidade.name}>
              {cidade.name}
            </option>
          ))}
        </select>
        <FormMessage
          type="error"
          message={errors.city}
        />
      </div>
    </>
  );
};
