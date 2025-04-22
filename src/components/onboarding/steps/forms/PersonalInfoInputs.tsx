
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "./PhoneInput";
import { CountrySelect } from "./CountrySelect";
import { TimezoneSelect } from "./TimezoneSelect";
import { cn } from "@/lib/utils";

interface PersonalInfoInputsProps {
  formData: {
    name?: string;
    email?: string;
    phone?: string;
    ddi?: string;
    linkedin?: string;
    instagram?: string;
    country?: string;
    state?: string;
    city?: string;
    timezone?: string;
    [key: string]: any;
  };
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
  readOnly?: boolean;
}

export const PersonalInfoInputs: React.FC<PersonalInfoInputsProps> = ({
  formData,
  onChange,
  disabled,
  errors = {},
  readOnly = false
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="col-span-1">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            type="text"
            id="name"
            placeholder="Seu nome"
            value={formData.name || ''}
            onChange={(e) => onChange("name", e.target.value)}
            className={cn(errors.name && "border-red-500")}
            readOnly={readOnly}
            disabled={disabled}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="col-span-1">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="seu@email.com"
            value={formData.email || ''}
            onChange={(e) => onChange("email", e.target.value)}
            className={cn(errors.email && "border-red-500")}
            readOnly={readOnly}
            disabled={disabled}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Phone */}
        <div className="col-span-1">
          <Label htmlFor="phone">Telefone</Label>
          <PhoneInput
            value={formData.phone || ''}
            ddi={formData.ddi || '+55'}
            onChange={onChange}
            readOnly={readOnly}
            error={errors.phone}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* LinkedIn */}
        <div className="col-span-1">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            type="url"
            id="linkedin"
            placeholder="https://www.linkedin.com/in/seuperfil"
            value={formData.linkedin || ''}
            onChange={(e) => onChange("linkedin", e.target.value)}
            className={cn(errors.linkedin && "border-red-500")}
            readOnly={readOnly}
            disabled={disabled}
          />
          {errors.linkedin && (
            <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Instagram */}
        <div className="col-span-1">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            type="url"
            id="instagram"
            placeholder="https://www.instagram.com/seuperfil"
            value={formData.instagram || ''}
            onChange={(e) => onChange("instagram", e.target.value)}
            className={cn(errors.instagram && "border-red-500")}
            readOnly={readOnly}
            disabled={disabled}
          />
          {errors.instagram && (
            <p className="text-red-500 text-sm mt-1">{errors.instagram}</p>
          )}
        </div>

        {/* Country */}
        <div className="col-span-1">
          <Label htmlFor="country">País</Label>
          <CountrySelect
            value={formData.country || 'Brasil'}
            onChange={onChange}
            readOnly={readOnly}
            error={errors.country}
          />
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">{errors.country}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* State */}
        <div className="col-span-1">
          <Label htmlFor="state">Estado</Label>
          <Input
            type="text"
            id="state"
            placeholder="Seu estado"
            value={formData.state || ''}
            onChange={(e) => onChange("state", e.target.value)}
            className={cn(errors.state && "border-red-500")}
            readOnly={readOnly}
            disabled={disabled}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
          )}
        </div>

        {/* City */}
        <div className="col-span-1">
          <Label htmlFor="city">Cidade</Label>
          <Input
            type="text"
            id="city"
            placeholder="Sua cidade"
            value={formData.city || ''}
            onChange={(e) => onChange("city", e.target.value)}
            className={cn(errors.city && "border-red-500")}
            readOnly={readOnly}
            disabled={disabled}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        {/* Timezone */}
        <Label htmlFor="timezone">Fuso Horário</Label>
        <TimezoneSelect
          value={formData.timezone || 'GMT-3'}
          onChange={onChange}
          readOnly={readOnly}
          error={errors.timezone}
        />
        {errors.timezone && (
          <p className="text-red-500 text-sm mt-1">{errors.timezone}</p>
        )}
      </div>
    </div>
  );
};
