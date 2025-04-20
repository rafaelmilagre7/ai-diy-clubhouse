
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

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
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
];

interface PhoneInputProps {
  ddi: string;
  phone: string;
  onChangeDDI: (value: string) => void;
  onChangePhone: (value: string) => void;
  disabled: boolean;
  error?: string;
}

export const PhoneInput = ({
  ddi,
  phone,
  onChangeDDI,
  onChangePhone,
  disabled,
  error,
}: PhoneInputProps) => (
  <div className="space-y-1">
    <Label htmlFor="phone">Telefone</Label>
    <div className="flex gap-2 items-center">
      <Select
        value={ddi || "+55"}
        onValueChange={onChangeDDI}
        disabled={disabled}
      >
        <SelectTrigger className="max-w-[90px]">
          <span>
            {ddis.find(d => d.code === (ddi || "+55"))?.flag || "🏳️"}{" "}
            {ddi || "+55"}
          </span>
        </SelectTrigger>
        <SelectContent>
          {ddis.map(ddiItem => (
            <SelectItem key={ddiItem.code} value={ddiItem.code}>
              {ddiItem.flag} {ddiItem.code} {ddiItem.country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id="phone"
        type="tel"
        value={phone}
        disabled={disabled}
        onChange={e => onChangePhone(e.target.value)}
        placeholder="(XX) XXXXX-XXXX"
        className={`flex-1 ${error ? 'border-red-500' : ''}`}
      />
    </div>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);
