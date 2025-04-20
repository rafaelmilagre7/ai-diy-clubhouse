
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

// Lista dos estados do Brasil com nomes completos
const estadosBR = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" }
];

// Lista de cidades por estado
const cidadesPorEstado: Record<string, string[]> = {
  "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira"],
  "AL": ["Maceió", "Arapiraca", "Palmeira dos Índios"],
  "AP": ["Macapá", "Santana", "Laranjal do Jari"],
  "AM": ["Manaus", "Parintins", "Itacoatiara"],
  "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte"],
  "DF": ["Brasília", "Ceilândia", "Taguatinga"],
  "ES": ["Vitória", "Vila Velha", "Serra"],
  "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis"],
  "MA": ["São Luís", "Imperatriz", "Timon"],
  "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis"],
  "MS": ["Campo Grande", "Dourados", "Três Lagoas"],
  "MG": ["Belo Horizonte", "Uberlândia", "Contagem"],
  "PA": ["Belém", "Ananindeua", "Santarém"],
  "PB": ["João Pessoa", "Campina Grande", "Santa Rita"],
  "PR": ["Curitiba", "Londrina", "Maringá"],
  "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda"],
  "PI": ["Teresina", "Parnaíba", "Picos"],
  "RJ": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias"],
  "RN": ["Natal", "Mossoró", "Parnamirim"],
  "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas"],
  "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes"],
  "RR": ["Boa Vista", "Rorainópolis", "Caracaraí"],
  "SC": ["Florianópolis", "Joinville", "Blumenau"],
  "SP": ["São Paulo", "Guarulhos", "Campinas"],
  "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto"],
  "TO": ["Palmas", "Araguaína", "Gurupi"]
};

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
  const [availableStates, setAvailableStates] = useState<{uf: string, nome: string}[]>([]);

  // Atualiza estados disponíveis com base no país selecionado
  useEffect(() => {
    if (formData.country === "Brasil") {
      setAvailableStates(estadosBR);
    } else {
      setAvailableStates([]);
    }
  }, [formData.country]);

  // Atualiza cidades disponíveis com base no estado selecionado
  useEffect(() => {
    if (formData.country === "Brasil" && formData.state) {
      setAvailableCities(cidadesPorEstado[formData.state] || []);
    } else {
      setAvailableCities([]);
    }
  }, [formData.country, formData.state]);

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
        {formData.country === "Brasil" && availableStates.length > 0 ? (
          <Select
            value={formData.state}
            onValueChange={(v) => onChange("state", v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {availableStates.map(estado => (
                <SelectItem key={estado.uf} value={estado.uf}>
                  {estado.nome}
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
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a cidade" />
            </SelectTrigger>
            <SelectContent>
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
