
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

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

export const LocationInputs = ({ 
  country, 
  state, 
  city, 
  onChangeCountry, 
  onChangeState, 
  onChangeCity, 
  disabled,
  errors = {}
}: LocationInputsProps) => {
  const [brazilianStates, setBrazilianStates] = useState<{sigla: string, nome: string}[]>([]);
  
  // Lista de estados brasileiros
  useEffect(() => {
    const states = [
      {sigla: 'AC', nome: 'Acre'},
      {sigla: 'AL', nome: 'Alagoas'},
      {sigla: 'AP', nome: 'Amapá'},
      {sigla: 'AM', nome: 'Amazonas'},
      {sigla: 'BA', nome: 'Bahia'},
      {sigla: 'CE', nome: 'Ceará'},
      {sigla: 'DF', nome: 'Distrito Federal'},
      {sigla: 'ES', nome: 'Espírito Santo'},
      {sigla: 'GO', nome: 'Goiás'},
      {sigla: 'MA', nome: 'Maranhão'},
      {sigla: 'MT', nome: 'Mato Grosso'},
      {sigla: 'MS', nome: 'Mato Grosso do Sul'},
      {sigla: 'MG', nome: 'Minas Gerais'},
      {sigla: 'PA', nome: 'Pará'},
      {sigla: 'PB', nome: 'Paraíba'},
      {sigla: 'PR', nome: 'Paraná'},
      {sigla: 'PE', nome: 'Pernambuco'},
      {sigla: 'PI', nome: 'Piauí'},
      {sigla: 'RJ', nome: 'Rio de Janeiro'},
      {sigla: 'RN', nome: 'Rio Grande do Norte'},
      {sigla: 'RS', nome: 'Rio Grande do Sul'},
      {sigla: 'RO', nome: 'Rondônia'},
      {sigla: 'RR', nome: 'Roraima'},
      {sigla: 'SC', nome: 'Santa Catarina'},
      {sigla: 'SP', nome: 'São Paulo'},
      {sigla: 'SE', nome: 'Sergipe'},
      {sigla: 'TO', nome: 'Tocantins'}
    ];
    setBrazilianStates(states);
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-6">
      <h3 className="text-lg font-semibold text-[#0ABAB5]">Localização</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Select 
            value={country} 
            onValueChange={onChangeCountry}
            disabled={disabled}
          >
            <SelectTrigger id="country" className="bg-[#1A1E2E] border-neutral-700">
              <SelectValue placeholder="Selecione o país" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-[#1A1E2E] border-neutral-700">
              <SelectItem value="Brasil">Brasil</SelectItem>
              <SelectItem value="Portugal">Portugal</SelectItem>
              <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state" className={errors.state ? "text-red-400" : ""}>
            Estado
          </Label>
          <Select 
            value={state} 
            onValueChange={onChangeState}
            disabled={disabled}
          >
            <SelectTrigger id="state" className={`bg-[#1A1E2E] ${errors.state ? "border-red-400" : "border-neutral-700"}`}>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1E2E] border-neutral-700 max-h-60">
              {brazilianStates.map((brState) => (
                <SelectItem key={brState.sigla} value={brState.nome}>
                  {brState.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-sm text-red-400">{errors.state}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city" className={errors.city ? "text-red-400" : ""}>
            Cidade
          </Label>
          <Input
            id="city"
            value={city}
            onChange={e => onChangeCity(e.target.value)}
            disabled={disabled}
            placeholder="Sua cidade"
            className={errors.city ? "border-red-400" : ""}
          />
          {errors.city && <p className="text-sm text-red-400">{errors.city}</p>}
        </div>
      </div>
    </div>
  );
};
