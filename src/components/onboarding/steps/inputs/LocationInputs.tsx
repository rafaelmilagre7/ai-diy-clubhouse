
import React, { useEffect } from "react";
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
  const { estados, cidadesPorEstado, isLoading, fetchEstados, fetchCidadesPorEstado } = useIBGELocations();
  
  // Considera um campo válido se tem valor e não tem erro
  const stateIsValid = state && !errors.state;
  const cityIsValid = city && !errors.city;

  // Filtrar cidades com base no estado selecionado
  const cidadesDoEstado = state && cidadesPorEstado[state] ? cidadesPorEstado[state] : [];

  // Carregar estados quando componente montar
  useEffect(() => {
    fetchEstados();
  }, [fetchEstados]);

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    if (state) {
      fetchCidadesPorEstado(state);
    }
  }, [state, fetchCidadesPorEstado]);

  // Se já temos um estado selecionado e temos uma cidade definida,
  // mas ela não está na lista de cidades, adicionar manualmente
  useEffect(() => {
    if (state && city && cidadesDoEstado.length > 0 && !cidadesDoEstado.some(c => c.name === city)) {
      // Apenas log para debug
      console.log(`Cidade '${city}' não encontrada na lista para o estado '${state}'`);
    }
  }, [state, city, cidadesDoEstado]);

  return (
    <div className="space-y-6 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-viverblue">Localização</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => onChangeCountry(e.target.value)}
            disabled={true}
            readOnly={true}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className={cn(
            "transition-colors flex items-center gap-2",
            errors.state ? "text-red-500" : stateIsValid ? "text-viverblue" : ""
          )}>
            Estado <span className="text-red-500">*</span>
            {state && (
              stateIsValid ? (
                <CheckCircle className="h-4 w-4 text-viverblue" />
              ) : errors.state ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : null
            )}
          </Label>
          <Select
            value={state}
            onValueChange={(value) => {
              onChangeState(value);
              // Limpar cidade quando mudar o estado
              onChangeCity('');
            }}
            disabled={disabled || isLoading}
          >
            <SelectTrigger 
              id="state" 
              className={cn(
                "w-full transition-colors",
                errors.state ? "border-red-500 focus:border-red-500 focus-visible:ring-red-500" : 
                stateIsValid ? "border-viverblue focus:border-viverblue focus-visible:ring-viverblue" : ""
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
            errors.city ? "text-red-500" : cityIsValid ? "text-viverblue" : ""
          )}>
            Cidade <span className="text-red-500">*</span>
            {city && (
              cityIsValid ? (
                <CheckCircle className="h-4 w-4 text-viverblue" />
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
                  errors.city ? "border-red-500 focus:border-red-500 focus-visible:ring-red-500" : 
                  cityIsValid ? "border-viverblue focus:border-viverblue focus-visible:ring-viverblue" : ""
                )}
              >
                <SelectValue placeholder={
                  isLoading && state ? "Carregando cidades..." : 
                  !state ? "Selecione um estado primeiro" : 
                  "Selecione sua cidade"
                } />
              </SelectTrigger>
              <SelectContent>
                {isLoading && state ? (
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
                {/* Se a cidade já selecionada não estiver na lista, adicionamos ela */}
                {city && cidadesDoEstado.length > 0 && !cidadesDoEstado.some(c => c.name === city) && (
                  <SelectItem key="manual-city" value={city}>
                    {city}
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
                errors.city ? "border-red-500 focus:border-red-500 focus-visible:ring-red-500" : 
                cityIsValid ? "border-viverblue focus:border-viverblue focus-visible:ring-viverblue" : ""
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
