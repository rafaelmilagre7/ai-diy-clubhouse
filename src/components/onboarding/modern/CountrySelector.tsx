
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const COUNTRY_OPTIONS = [
  { value: '+55', label: '🇧🇷 Brasil (+55)', country: 'Brasil' },
  { value: '+1', label: '🇺🇸 Estados Unidos (+1)', country: 'Estados Unidos' },
  { value: '+54', label: '🇦🇷 Argentina (+54)', country: 'Argentina' },
  { value: '+56', label: '🇨🇱 Chile (+56)', country: 'Chile' },
  { value: '+57', label: '🇨🇴 Colômbia (+57)', country: 'Colômbia' },
  { value: '+351', label: '🇵🇹 Portugal (+351)', country: 'Portugal' },
  { value: '+34', label: '🇪🇸 Espanha (+34)', country: 'Espanha' },
  { value: '+33', label: '🇫🇷 França (+33)', country: 'França' },
  { value: '+49', label: '🇩🇪 Alemanha (+49)', country: 'Alemanha' },
];

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  required = false
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        País {required && <span className="text-red-400">*</span>}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
          <SelectValue placeholder="Selecione seu país" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {COUNTRY_OPTIONS.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="text-white hover:bg-gray-700"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
