
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

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

// Estados do Brasil (simplificado)
const brStates = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" },
];

// Algumas cidades por estado (simplificado para exemplo)
const cities: Record<string, string[]> = {
  "SP": ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Osasco"],
  "RJ": ["Rio de Janeiro", "Niterói", "Petrópolis", "Angra dos Reis", "Volta Redonda"],
  "MG": ["Belo Horizonte", "Juiz de Fora", "Uberlândia", "Contagem", "Betim"],
  // Adicione mais estados e cidades conforme necessário
};

// Função para obter cidades de um estado (com fallback para array vazio)
const getCitiesByState = (stateCode: string) => {
  return cities[stateCode] || [];
};

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
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Atualizar cidades disponíveis quando o estado mudar
  useEffect(() => {
    if (state) {
      setAvailableCities(getCitiesByState(state));
    } else {
      setAvailableCities([]);
    }
  }, [state]);

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
          onValueChange={onChangeState}
          disabled={disabled}
        >
          <SelectTrigger id="state" className={errors.state ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {country === "Brasil" && brStates.map(st => (
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
          disabled={disabled || !state}
        >
          <SelectTrigger id="city" className={errors.city ? 'border-red-500' : ''}>
            <SelectValue placeholder={state ? "Selecione a cidade" : "Primeiro selecione o estado"} />
          </SelectTrigger>
          <SelectContent>
            {availableCities.length > 0 ? (
              availableCities.map(c => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="outro">Outra cidade</SelectItem>
            )}
          </SelectContent>
        </Select>
        {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
      </div>
    </>
  );
};
