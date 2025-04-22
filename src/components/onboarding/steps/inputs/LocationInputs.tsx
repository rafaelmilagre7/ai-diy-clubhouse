
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, AlertCircle } from "lucide-react";

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
  // Considera um campo válido se tem valor e não tem erro
  const stateIsValid = state && !errors.state;
  const cityIsValid = city && !errors.city;

  // Lista de estados brasileiros
  const estados = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" }
  ];

  // Cidades para o estado selecionado (exemplo simplificado)
  // Em um caso real, seria carregado com base no estado selecionado
  const cidades: Record<string, string[]> = {
    SC: ["Florianópolis", "Joinville", "Blumenau", "Criciúma", "Chapecó", "Itajaí", "Balneário Camboriú"],
    SP: ["São Paulo", "Campinas", "Santos", "São José dos Campos", "Ribeirão Preto", "Sorocaba"],
    RJ: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu", "Petrópolis", "Volta Redonda"],
    MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros"],
  };

  // Filtrar cidades com base no estado selecionado
  const cidadesDoEstado = state ? (cidades[state] || []) : [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country">País</Label>
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
          errors.state ? "text-red-500" : stateIsValid ? "text-[#0ABAB5]" : ""
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
          disabled={disabled}
        >
          <SelectTrigger 
            id="state" 
            className={cn(
              "w-full transition-colors",
              errors.state ? "border-red-500 focus:border-red-500" : 
              stateIsValid ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
            )}
          >
            <SelectValue placeholder="Selecione seu estado" />
          </SelectTrigger>
          <SelectContent>
            {estados.map((estado) => (
              <SelectItem key={estado.sigla} value={estado.sigla}>
                {estado.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.state && (
          <FormMessage type="error" message={errors.state} />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className={cn(
          "transition-colors flex items-center gap-2",
          errors.city ? "text-red-500" : cityIsValid ? "text-[#0ABAB5]" : ""
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
            disabled={disabled || !state}
          >
            <SelectTrigger 
              id="city" 
              className={cn(
                "w-full transition-colors",
                errors.city ? "border-red-500 focus:border-red-500" : 
                cityIsValid ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
              )}
            >
              <SelectValue placeholder="Selecione sua cidade" />
            </SelectTrigger>
            <SelectContent>
              {cidadesDoEstado.length > 0 ? (
                cidadesDoEstado.map((cidade) => (
                  <SelectItem key={cidade} value={cidade}>
                    {cidade}
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
  );
};
