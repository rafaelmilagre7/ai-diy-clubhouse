
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "react-hook-form";

interface TimezoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string | FieldError;
}

export const TimezoneInput = ({ value, onChange, disabled, readOnly, error }: TimezoneInputProps) => {
  const timezones = [
    { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
    { value: "America/Manaus", label: "Manaus (GMT-4)" },
    { value: "America/Bahia", label: "Salvador (GMT-3)" },
    { value: "America/Fortaleza", label: "Fortaleza (GMT-3)" },
    { value: "America/Belem", label: "Belém (GMT-3)" },
    { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
    { value: "America/New_York", label: "Nova York (GMT-4)" },
    { value: "Europe/Lisbon", label: "Lisboa (GMT+1)" },
    { value: "Europe/London", label: "Londres (GMT+1)" },
    { value: "Europe/Madrid", label: "Madrid (GMT+2)" },
    { value: "Europe/Paris", label: "Paris (GMT+2)" }
  ];

  return (
    <div>
      <Label htmlFor="timezone">Fuso Horário</Label>
      <Select 
        value={value} 
        onValueChange={onChange} 
        disabled={disabled || readOnly}
      >
        <SelectTrigger id="timezone" className={error ? "border-red-400" : ""}>
          <SelectValue placeholder="Selecione seu fuso horário" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map(tz => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
};
