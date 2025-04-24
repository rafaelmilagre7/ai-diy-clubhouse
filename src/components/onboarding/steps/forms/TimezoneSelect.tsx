
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimezoneSelectProps {
  value: string;
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
  error?: string;
}

export const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onChange,
  readOnly = false,
  error
}) => {
  const timezones = [
    { value: "GMT-5", label: "GMT-5 (Hora do Leste dos EUA)" },
    { value: "GMT-4", label: "GMT-4 (Chile, Venezuela)" },
    { value: "GMT-3", label: "GMT-3 (Brasil)" },
    { value: "GMT-2", label: "GMT-2 (Meio Atlântico)" },
    { value: "GMT-1", label: "GMT-1 (Açores)" },
    { value: "GMT+0", label: "GMT+0 (Londres, Lisboa)" },
    { value: "GMT+1", label: "GMT+1 (Paris, Roma, Berlim)" },
    { value: "GMT+2", label: "GMT+2 (Cairo, Atenas)" }
  ];

  return (
    <div>
      <Select 
        value={value} 
        onValueChange={(newValue) => onChange("timezone", newValue)}
        disabled={readOnly}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Selecione seu fuso horário" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((timezone) => (
            <SelectItem key={timezone.value} value={timezone.value}>
              {timezone.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
