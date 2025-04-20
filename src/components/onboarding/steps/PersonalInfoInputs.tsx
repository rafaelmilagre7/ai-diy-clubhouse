
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoInputsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
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
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          disabled={disabled}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="(XX) XXXXX-XXXX"
        />
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
        <Input
          id="state"
          type="text"
          value={formData.state}
          disabled={disabled}
          onChange={(e) => onChange("state", e.target.value)}
          placeholder="Estado"
        />
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
        <Input
          id="timezone"
          type="text"
          value={formData.timezone}
          disabled={disabled}
          onChange={(e) => onChange("timezone", e.target.value)}
          placeholder="Horário de Brasília (GMT-3)"
        />
      </div>
    </div>
  );
};

