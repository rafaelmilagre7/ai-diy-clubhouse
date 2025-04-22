import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "./PhoneInput";
import { CountrySelect } from "./CountrySelect";
import { TimezoneSelect } from "./TimezoneSelect";
import { cn } from "@/lib/utils";

export const PersonalInfoForm = ({
  validation,
  register,
  errors,
  touchedFields,
  isSubmitting,
  initialData,
  formData,
  onChange,
  readOnly = false
}: any) => {

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="col-span-1">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            type="text"
            id="name"
            placeholder="Seu nome"
            {...register("name")}
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={cn(errors.name && "border-red-500")}
            readOnly={readOnly}
          />
          {validation.name && touchedFields.name && (
            <p className="text-red-500 text-sm mt-1">{validation.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="col-span-1">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="seu@email.com"
            {...register("email")}
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={cn(errors.email && "border-red-500")}
            readOnly={readOnly}
          />
          {validation.email && touchedFields.email && (
            <p className="text-red-500 text-sm mt-1">{validation.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Phone */}
        <div className="col-span-1">
          <Label htmlFor="phone">Telefone</Label>
          <PhoneInput
            value={formData.phone}
            ddi={formData.ddi}
            onChange={onChange}
            readOnly={readOnly}
          />
          {validation.phone && touchedFields.phone && (
            <p className="text-red-500 text-sm mt-1">{validation.phone.message}</p>
          )}
        </div>

        {/* LinkedIn */}
        <div className="col-span-1">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            type="url"
            id="linkedin"
            placeholder="https://www.linkedin.com/in/seuperfil"
            {...register("linkedin")}
            value={formData.linkedin}
            onChange={(e) => onChange("linkedin", e.target.value)}
            className={cn(errors.linkedin && "border-red-500")}
            readOnly={readOnly}
          />
          {validation.linkedin && touchedFields.linkedin && (
            <p className="text-red-500 text-sm mt-1">{validation.linkedin.message}</p>
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
            {...register("instagram")}
            value={formData.instagram}
            onChange={(e) => onChange("instagram", e.target.value)}
            className={cn(errors.instagram && "border-red-500")}
            readOnly={readOnly}
          />
          {validation.instagram && touchedFields.instagram && (
            <p className="text-red-500 text-sm mt-1">{validation.instagram.message}</p>
          )}
        </div>

        {/* Country */}
        <div className="col-span-1">
          <Label htmlFor="country">País</Label>
          <CountrySelect
            value={formData.country}
            onChange={onChange}
            readOnly={readOnly}
          />
          {validation.country && touchedFields.country && (
            <p className="text-red-500 text-sm mt-1">{validation.country.message}</p>
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
            {...register("state")}
            value={formData.state}
            onChange={(e) => onChange("state", e.target.value)}
            className={cn(errors.state && "border-red-500")}
            readOnly={readOnly}
          />
          {validation.state && touchedFields.state && (
            <p className="text-red-500 text-sm mt-1">{validation.state.message}</p>
          )}
        </div>

        {/* City */}
        <div className="col-span-1">
          <Label htmlFor="city">Cidade</Label>
          <Input
            type="text"
            id="city"
            placeholder="Sua cidade"
            {...register("city")}
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            className={cn(errors.city && "border-red-500")}
            readOnly={readOnly}
          />
          {validation.city && touchedFields.city && (
            <p className="text-red-500 text-sm mt-1">{validation.city.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        {/* Timezone */}
        <Label htmlFor="timezone">Fuso Horário</Label>
        <TimezoneSelect
          value={formData.timezone}
          onChange={onChange}
          readOnly={readOnly}
        />
        {validation.timezone && touchedFields.timezone && (
          <p className="text-red-500 text-sm mt-1">{validation.timezone.message}</p>
        )}
      </div>
    </div>
  );
};
