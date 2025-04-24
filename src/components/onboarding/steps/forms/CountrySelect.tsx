
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountrySelectProps {
  value: string;
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
  error?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  readOnly = false,
  error
}) => {
  const countries = [
    { value: "Brasil", label: "Brasil" },
    { value: "Portugal", label: "Portugal" }
  ];

  return (
    <div>
      <Select 
        value={value} 
        onValueChange={(newValue) => onChange("country", newValue)}
        disabled={readOnly}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
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
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
