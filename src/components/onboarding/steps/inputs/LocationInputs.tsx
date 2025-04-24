
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, AlertCircle } from "lucide-react";
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
    country?: string;
    state?: string;
    city?: string;
  };
}

export const LocationInputs: React.FC<LocationInputsProps> = ({
  country,
  state,
  city,
  onChangeCountry,
  onChangeState,
  onChangeCity,
  disabled = false,
  errors = {}
}) => {
  // Usar o hook para obter estados e cidades
  const { estados, cidadesPorEstado, isLoading } = useIBGELocations();
  
  // Considera um campo válido se tem valor e não tem erro
  const stateIsValid = state && !errors.state;
  const cityIsValid = city && !errors.city;

  // Filtrar cidades com base no estado selecionado
  const cidadesDoEstado = state && cidadesPorEstado[state] ? cidadesPorEstado[state] : [];

  return (
    <div className="space-y-6 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-[#0ABAB5]">Localização</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-gray-700">País</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => onChangeCountry(e.target.value)}
            disabled={true}
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className={cn(
            "transition-colors flex items-center gap-2",
            errors.state ? "text-red-500" : stateIsValid ? "text-[#0ABAB5]" : "text-gray-700"
          )}>
            Estado <span className="text-red-500">*</span>
            {state && (
              stateIsValid ? (
                <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
              ) : errors.state ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : null
            )}
          </Label>
          <Select
            value={state}
            onValueChange={onChangeState}
            disabled={disabled || isLoading}
          >
            <SelectTrigger 
              id="state" 
              className={cn(
                "w-full transition-colors",
                errors.state ? "border-red-500 focus:border-red-500" : 
                stateIsValid ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
              )}
            >
              <SelectValue placeholder={isLoading ? "Carregando estados..." : "Selecione seu estado"} />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Carregando estados...
                </SelectItem>
              ) : (
                estados.map((estado) => (
                  <SelectItem key={estado.code} value={estado.code}>
                    {estado.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.state && (
            <FormMessage type="error" message={errors.state} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className={cn(
            "transition-colors flex items-center gap-2",
            errors.city ? "text-red-500" : cityIsValid ? "text-[#0ABAB5]" : "text-gray-700"
          )}>
            Cidade <span className="text-red-500">*</span>
            {city && (
              cityIsValid ? (
                <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
              ) : errors.city ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : null
            )}
          </Label>
          
          {state ? (
            <Select
              value={city}
              onValueChange={onChangeCity}
              disabled={disabled || !state || isLoading}
            >
              <SelectTrigger 
                id="city" 
                className={cn(
                  "w-full transition-colors",
                  errors.city ? "border-red-500 focus:border-red-500" : 
                  cityIsValid ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
                )}
              >
                <SelectValue placeholder={isLoading ? "Carregando cidades..." : "Selecione sua cidade"} />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="" disabled>
                    Carregando cidades...
                  </SelectItem>
                ) : cidadesDoEstado.length > 0 ? (
                  cidadesDoEstado.map((cidade) => (
                    <SelectItem key={cidade.code} value={cidade.name}>
                      {cidade.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Selecione um estado primeiro
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="city"
              value={city}
              onChange={(e) => onChangeCity(e.target.value)}
              disabled={disabled || !state}
              placeholder="Selecione um estado primeiro"
              className={cn(
                "transition-colors",
                errors.city ? "border-red-500 focus:border-red-500" : 
                cityIsValid ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
              )}
            />
          )}
          
          {errors.city && (
            <FormMessage type="error" message={errors.city} />
          )}
        </div>
      </div>
    </div>
  );
};
