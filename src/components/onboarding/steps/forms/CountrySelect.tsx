
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountrySelectProps {
  value: string;
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  readOnly = false
}) => {
  const countries = [
    { value: "Brasil", label: "Brasil" },
    { value: "Portugal", label: "Portugal" }
  ];

  return (
    <Select 
      value={value} 
      onValueChange={(newValue) => onChange("country", newValue)}
      disabled={readOnly}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione seu país" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.value} value={country.value}>
            {country.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
