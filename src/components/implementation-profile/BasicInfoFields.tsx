
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Instagram, Linkedin, User, Mail } from "lucide-react";

type Props = {
  values: any;
  estados: { code: string, name: string }[];
  cidadesPorEstado: Record<string, { name: string }[]>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValues: (fn: (old: any) => any) => void;
  locLoading: boolean;
};

export const BasicInfoFields: React.FC<Props> = ({
  values,
  estados,
  cidadesPorEstado,
  onChange,
  onPhoneChange,
  setValues,
  locLoading
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="name">Nome*</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <User size={16} />
        </span>
        <Input
          id="name"
          name="name"
          value={values.name}
          disabled
          className="bg-gray-100 pl-10"
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">E-mail*</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <Mail size={16} />
        </span>
        <Input
          id="email"
          name="email"
          value={values.email}
          disabled
          className="bg-gray-100 pl-10"
        />
      </div>
    </div>
    <div className="space-y-2 flex flex-col">
      <Label htmlFor="phone">Telefone</Label>
      <div className="flex gap-2 items-center">
        <Select
          value={values.phone_country_code}
          onValueChange={val =>
            setValues((old: any) => ({ ...old, phone_country_code: val }))
          }
        >
          <SelectTrigger className="w-20 rounded-md">
            <span className="flex items-center">
              <span className="mr-2" role="img" aria-label="Brasil">🇧🇷</span>
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+55">
              <span className="mr-2" role="img" aria-label="Brasil">🇧🇷</span> +55 BR
            </SelectItem>
            <SelectItem value="+1">
              <span className="mr-2" role="img" aria-label="USA">🇺🇸</span> +1 US
            </SelectItem>
            <SelectItem value="+351">
              <span className="mr-2" role="img" aria-label="Portugal">🇵🇹</span> +351 PT
            </SelectItem>
          </SelectContent>
        </Select>
        <Input
          id="phone"
          name="phone"
          value={values.phone || ""}
          onChange={onPhoneChange}
          placeholder="(99) 99999-9999"
          maxLength={15}
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="instagram">Instagram</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <Instagram size={16} />
        </span>
        <Input
          id="instagram"
          name="instagram"
          value={values.instagram || ""}
          onChange={onChange}
          placeholder="https://instagram.com/seuusuario"
          className="pl-10"
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="linkedin">LinkedIn</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <Linkedin size={16} />
        </span>
        <Input
          id="linkedin"
          name="linkedin"
          value={values.linkedin || ""}
          onChange={onChange}
          placeholder="https://linkedin.com/in/seuusuario"
          className="pl-10"
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="country">País*</Label>
      <Select
        value={values.country}
        onValueChange={val => setValues((old: any) => ({ ...old, country: val }))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Brasil">Brasil</SelectItem>
          <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
          <SelectItem value="Portugal">Portugal</SelectItem>
          <SelectItem value="Outro">Outro</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="state">Estado</Label>
      <Select
        value={values.state}
        onValueChange={val => setValues((old: any) => ({ ...old, state: val }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {estados.map(e => (
            <SelectItem key={e.code} value={e.name}>{e.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="city">Cidade</Label>
      <Select
        value={values.city}
        onValueChange={val => setValues((old: any) => ({ ...old, city: val }))}
        disabled={!values.state}
      >
        <SelectTrigger>
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          {(cidadesPorEstado[estados.find(e => e.name === values.state)?.code || ""] || []).map(c => (
            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);
