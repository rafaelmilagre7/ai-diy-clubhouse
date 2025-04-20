
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Lista de DDI principais e países para exibir as bandeiras (pode ser expandido se precisar)
const ddis = [
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+1", country: "EUA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  // ...adicione outros se necessário
];

// Lista dos estados do Brasil
const estadosBR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES",
  "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR",
  "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// Lista de fusos horários comuns (personalize conforme necessidade)
const timezones = [
  "Horário de Brasília (GMT-3)",
  "Horário de Manaus (GMT-4)",
  "Horário de Fernando de Noronha (GMT-2)",
  "Horário da Bahia (GMT-3)",
  "Horário do Acre (GMT-5)",
  "UTC",
  "America/Sao_Paulo",
  "America/Recife",
  "America/Fortaleza",
  "America/Belem",
  "America/Cuiaba",
  "America/Porto_Velho",
  "America/Boa_Vista",
  "America/Manaus",
  "America/Eirunepe",
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
  // Se país for Brasil, mostra estados do Brasil
  const showEstados = formData.country.toLowerCase() === "brasil" || formData.country.toLowerCase() === "brazil";

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
        <Input
          id="country"
          type="text"
          value={formData.country}
          disabled={disabled}
          onChange={(e) => onChange("country", e.target.value)}
          placeholder="Brasil"
          required
        />
      </div>
      <div>
        <Label htmlFor="state">Estado</Label>
        {showEstados ? (
          <Select
            value={formData.state}
            onValueChange={(v) => onChange("state", v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {estadosBR.map(uf => (
                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
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
        <Input
          id="city"
          type="text"
          value={formData.city}
          disabled={disabled}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="Cidade"
        />
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
