
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  disabled?: boolean;
}

export const PersonalInfoInputs = ({
  formData,
  onChange,
  disabled = false,
}: PersonalInfoInputsProps) => (
  <div className="grid gap-6 md:grid-cols-2">
    <div className="space-y-2">
      <Label htmlFor="name">Nome Completo*</Label>
      <Input
        type="text"
        id="name"
        value={formData.name}
        onChange={e => onChange("name", e.target.value)}
        placeholder="Seu nome completo"
        required
        disabled={disabled}
        className="bg-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email*</Label>
      <Input
        type="email"
        id="email"
        value={formData.email}
        onChange={e => onChange("email", e.target.value)}
        placeholder="seu.email@exemplo.com"
        required
        disabled={disabled}
        className="bg-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="phone">Telefone/WhatsApp*</Label>
      <Input
        type="tel"
        id="phone"
        value={formData.phone}
        onChange={e => onChange("phone", e.target.value)}
        placeholder="(00) 00000-0000"
        required
        disabled={disabled}
        className="bg-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="linkedin">LinkedIn</Label>
      <Input
        type="url"
        id="linkedin"
        value={formData.linkedin}
        onChange={e => onChange("linkedin", e.target.value)}
        placeholder="linkedin.com/in/seuperfil"
        disabled={disabled}
        className="bg-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="instagram">Instagram</Label>
      <Input
        type="text"
        id="instagram"
        value={formData.instagram}
        onChange={e => onChange("instagram", e.target.value)}
        placeholder="@seuinstagram"
        disabled={disabled}
        className="bg-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="country">País*</Label>
      <Select 
        value={formData.country} 
        onValueChange={value => onChange("country", value)}
        disabled={disabled}
      >
        <SelectTrigger id="country" className="bg-white">
          <SelectValue placeholder="Selecione seu país" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Brasil">Brasil</SelectItem>
          <SelectItem value="Portugal">Portugal</SelectItem>
          <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
          <SelectItem value="Outro">Outro</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="state">Estado*</Label>
      <Input
        type="text"
        id="state"
        value={formData.state}
        onChange={e => onChange("state", e.target.value)}
        placeholder="Seu estado"
        required
        disabled={disabled}
        className="bg-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="city">Cidade*</Label>
      <Input
        type="text"
        id="city"
        value={formData.city}
        onChange={e => onChange("city", e.target.value)}
        placeholder="Sua cidade"
        required
        disabled={disabled}
        className="bg-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="timezone">Fuso Horário*</Label>
      <Select 
        value={formData.timezone} 
        onValueChange={value => onChange("timezone", value)}
        disabled={disabled}
      >
        <SelectTrigger id="timezone" className="bg-white">
          <SelectValue placeholder="Selecione seu fuso horário" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Horário de Brasília (GMT-3)">Horário de Brasília (GMT-3)</SelectItem>
          <SelectItem value="Fernando de Noronha (GMT-2)">Fernando de Noronha (GMT-2)</SelectItem>
          <SelectItem value="Manaus (GMT-4)">Manaus (GMT-4)</SelectItem>
          <SelectItem value="Acre (GMT-5)">Acre (GMT-5)</SelectItem>
          <SelectItem value="Horário de Lisboa (GMT+0)">Horário de Lisboa (GMT+0)</SelectItem>
          <SelectItem value="Outro">Outro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);
