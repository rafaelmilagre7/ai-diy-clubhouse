
import React, { useState, useEffect } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationInputsProps {
  country: string;
  state: string;
  city: string;
  onChangeCountry: (value: string) => void;
  onChangeState: (value: string) => void;
  onChangeCity: (value: string) => void;
  disabled?: boolean;
  errors: {
    state?: string;
    city?: string;
  };
  isValid?: {
    state?: boolean;
    city?: boolean;
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
  errors,
  isValid = { state: false, city: false }
}) => {
  const { estados, cidadesPorEstado, isLoading } = useIBGELocations();
  const [availableCities, setAvailableCities] = useState<Array<{name: string, code: string}>>([]);

  // Atualiza as cidades disponíveis quando o estado muda
  useEffect(() => {
    if (state) {
      const stateCities = cidadesPorEstado[state] || [];
      setAvailableCities(stateCities);
    } else {
      setAvailableCities([]);
    }
  }, [state, cidadesPorEstado]);

  const handleStateChange = (newState: string) => {
    onChangeState(newState);
    onChangeCity(""); // Limpa a cidade quando o estado muda
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="country" className="text-gray-700 flex items-center">
          País <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
        </Label>
        <Select value={country} onValueChange={onChangeCountry} disabled={true}>
          <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Brasil">Brasil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="state" className={cn(
          "transition-colors flex items-center",
          errors.state ? "text-red-500" : state && isValid.state ? "text-[#0ABAB5]" : ""
        )}>
          Estado <span className="text-red-500">*</span>
          {isValid.state && state && (
            <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
          )}
        </Label>
        <Select 
          value={state} 
          onValueChange={handleStateChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className={cn(
            "transition-colors",
            errors.state ? "border-red-500 focus:border-red-500" : 
            state && isValid.state ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
          )}>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {estados.map((estado) => (
              <SelectItem key={estado.code} value={estado.code}>
                {estado.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage
          type={state && isValid.state ? "success" : "error"}
          message={errors.state}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className={cn(
          "transition-colors flex items-center",
          errors.city ? "text-red-500" : city && isValid.city ? "text-[#0ABAB5]" : ""
        )}>
          Cidade <span className="text-red-500">*</span>
          {isValid.city && city && (
            <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
          )}
        </Label>
        <Select 
          value={city} 
          onValueChange={onChangeCity}
          disabled={disabled || !state || isLoading}
        >
          <SelectTrigger className={cn(
            "transition-colors",
            errors.city ? "border-red-500 focus:border-red-500" : 
            city && isValid.city ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
          )}>
            <SelectValue placeholder="Selecione a cidade" />
          </SelectTrigger>
          <SelectContent>
            {availableCities.map((cidade) => (
              <SelectItem key={cidade.code} value={cidade.name}>
                {cidade.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage
          type={city && isValid.city ? "success" : "error"}
          message={errors.city}
        />
      </div>
    </>
  );
};

