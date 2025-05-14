
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimezoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export const TimezoneInput: React.FC<TimezoneInputProps> = ({
  value,
  onChange,
  disabled = false,
  error
}) => {
  // Lista de fusos horários comuns no Brasil
  const timezones = [
    { value: "GMT-2", label: "GMT-2 (Fernando de Noronha)" },
    { value: "GMT-3", label: "GMT-3 (Brasília, São Paulo, Rio de Janeiro)" },
    { value: "GMT-4", label: "GMT-4 (Manaus, Cuiabá)" },
    { value: "GMT-5", label: "GMT-5 (Acre)" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="timezone" className={error ? "text-red-500" : ""}>Fuso Horário</Label>
      <Select 
        value={value} 
        onValueChange={onChange} 
        disabled={disabled}
      >
        <SelectTrigger id="timezone" className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Selecione seu fuso horário" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
