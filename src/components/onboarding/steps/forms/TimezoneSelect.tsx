
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimezoneSelectProps {
  value: string;
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onChange,
  readOnly = false
}) => {
  const timezones = [
    { value: "GMT-3", label: "GMT-3 (Brasília)" },
    { value: "GMT-4", label: "GMT-4 (Manaus)" },
    { value: "GMT-2", label: "GMT-2 (Fernando de Noronha)" },
  ];

  return (
    <Select 
      value={value} 
      onValueChange={(newValue) => onChange("timezone", newValue)}
      disabled={readOnly}
    >
      <SelectTrigger>
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
  );
};
