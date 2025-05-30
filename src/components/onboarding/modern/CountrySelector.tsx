
import React from 'react';
import { DropdownModerno } from './DropdownModerno';

const COUNTRIES = [
  { value: 'BR', label: '🇧🇷 Brasil' },
  { value: 'PT', label: '🇵🇹 Portugal' },
  { value: 'US', label: '🇺🇸 Estados Unidos' },
  { value: 'ES', label: '🇪🇸 Espanha' },
  { value: 'FR', label: '🇫🇷 França' },
  { value: 'DE', label: '🇩🇪 Alemanha' },
  { value: 'IT', label: '🇮🇹 Itália' },
  { value: 'UK', label: '🇬🇧 Reino Unido' },
  { value: 'CA', label: '🇨🇦 Canadá' },
  { value: 'AU', label: '🇦🇺 Austrália' },
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'MX', label: '🇲🇽 México' },
  { value: 'CO', label: '🇨🇴 Colômbia' },
  { value: 'CL', label: '🇨🇱 Chile' },
  { value: 'PE', label: '🇵🇪 Peru' },
  { value: 'OTHER', label: '🌍 Outro país' }
];

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  required = false
}) => {
  return (
    <DropdownModerno
      value={value}
      onChange={onChange}
      options={COUNTRIES}
      placeholder="Selecione seu país"
      label="País"
      required={required}
    />
  );
};
