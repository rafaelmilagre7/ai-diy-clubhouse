
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIBGELocations } from "@/hooks/useIBGELocations";

// Lista de DDI principais (10 países mais prováveis)
const ddis = [
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+1", country: "EUA", flag: "🇺🇸" },
  { code: "+44", country: "Reino Unido", flag: "🇬🇧" },
  { code: "+34", country: "Espanha", flag: "🇪🇸" },
  { code: "+49", country: "Alemanha", flag: "🇩🇪" },
  { code: "+33", country: "França", flag: "🇫🇷" },
  { code: "+39", country: "Itália", flag: "🇮🇹" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" }
];

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
  { name: "Argentina", code: "AR", flag: "🇦🇷" }
];

// Lista de fusos horários GMT
const timezones = [
  "GMT-12", "GMT-11", "GMT-10", "GMT-9", "GMT-8", "GMT-7", "GMT-6", "GMT-5", "GMT-4", "GMT-3",
  "GMT-2", "GMT-1", "GMT+0", "GMT+1", "GMT+2", "GMT+3", "GMT+4", "GMT+5", "GMT+6", 
  "GMT+7", "GMT+8", "GMT+9", "GMT+10", "GMT+11", "GMT+12", "GMT+13", "GMT+14"
];

interface PersonalInfoInputsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    ddi?: string;
    linkedin: string;
    instagram: string;
    country: string;
    state: string;
    city: string;
    timezone: string;
  };
  onChange: (field: string, value: string) => void;
  disabled: boolean;
}

export const PersonalInfoInputs = ({ formData, onChange, disabled }: PersonalInfoInputsProps) => {
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const { estados, cidadesPorEstado, isLoading } = useIBGELocations();

  // Atualiza cidades disponíveis com base no estado selecionado
  useEffect(() => {
    if (formData.country === "Brasil" && formData.state) {
      if (cidadesPorEstado[formData.state]) {
        const cidadesOrdenadas = cidadesPorEstado[formData.state]
          .map(cidade => cidade.name)
          .sort((a, b) => a.localeCompare(b));
        setAvailableCities(cidadesOrdenadas);
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.country, formData.state, cidadesPorEstado]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          disabled={disabled}
          onChange={(e) => onChange("name", e.target.value)}
          required
          placeholder="Seu nome completo"
        />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          disabled={disabled}
          onChange={(e) => onChange("email", e.target.value)}
          required
          placeholder="exemplo@dominio.com"
        />
      </div>
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <div className="flex gap-2 items-center">
          <Select
            value={formData.ddi || "+55"}
            onValueChange={(v) => onChange("ddi", v)}
            disabled={disabled}
          >
            <SelectTrigger className="max-w-[90px]">
              <span>
                {ddis.find(d => d.code === (formData.ddi || "+55"))?.flag || "🏳️"}{" "}
                {formData.ddi || "+55"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {ddis.map(ddi => (
                <SelectItem key={ddi.code} value={ddi.code}>
                  {ddi.flag} {ddi.code} {ddi.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            disabled={disabled}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="(XX) XXXXX-XXXX"
            className="flex-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input
          id="linkedin"
          type="url"
          value={formData.linkedin}
          disabled={disabled}
          onChange={(e) => onChange("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/seunome"
        />
      </div>
      <div>
        <Label htmlFor="instagram">Instagram</Label>
        <Input
          id="instagram"
          type="url"
          value={formData.instagram}
          disabled={disabled}
          onChange={(e) => onChange("instagram", e.target.value)}
          placeholder="https://instagram.com/seunome"
        />
      </div>
      <div>
        <Label htmlFor="country">País</Label>
        <Select
          value={formData.country}
          onValueChange={(v) => onChange("country", v)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country.code} value={country.name}>
                {country.flag} {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="state">Estado</Label>
        {formData.country === "Brasil" ? (
          <Select
            value={formData.state}
            onValueChange={(v) => onChange("state", v)}
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
            value={formData.state}
            disabled={disabled}
            onChange={(e) => onChange("state", e.target.value)}
            placeholder="Estado"
          />
        )}
      </div>
      <div>
        <Label htmlFor="city">Cidade</Label>
        {formData.country === "Brasil" && availableCities.length > 0 ? (
          <Select
            value={formData.city}
            onValueChange={(v) => onChange("city", v)}
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
            value={formData.city}
            disabled={disabled}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Cidade"
          />
        )}
      </div>
      <div>
        <Label htmlFor="timezone">Fuso Horário</Label>
        <Select
          value={formData.timezone}
          onValueChange={(v) => onChange("timezone", v)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o fuso horário" />
          </SelectTrigger>
          <SelectContent>
            {timezones.map(tz => (
              <SelectItem key={tz} value={tz}>{tz}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
