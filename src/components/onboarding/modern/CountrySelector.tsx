
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const COUNTRIES = [
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+34', name: 'Espanha', flag: '🇪🇸' },
  { code: '+33', name: 'França', flag: '🇫🇷' },
  { code: '+49', name: 'Alemanha', flag: '🇩🇪' },
  { code: '+44', name: 'Reino Unido', flag: '🇬🇧' },
  { code: '+39', name: 'Itália', flag: '🇮🇹' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+52', name: 'México', flag: '🇲🇽' }
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
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Globe className="w-4 h-4 text-viverblue" />
        </div>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="pl-10 h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
            <SelectValue placeholder="Selecione seu país" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {COUNTRIES.map((country) => (
              <SelectItem 
                key={country.code} 
                value={country.code}
                className="text-white hover:bg-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-gray-400">({country.code})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
