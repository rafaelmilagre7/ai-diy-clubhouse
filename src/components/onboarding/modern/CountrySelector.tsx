
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  ddi: string;
}

const countries: CountryOption[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', ddi: '+55' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', ddi: '+1' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', ddi: '+54' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', ddi: '+56' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴', ddi: '+57' },
  { code: 'MX', name: 'México', flag: '🇲🇽', ddi: '+52' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', ddi: '+51' },
  { code: 'UY', name: 'Uruguai', flag: '🇺🇾', ddi: '+598' },
  { code: 'PY', name: 'Paraguai', flag: '🇵🇾', ddi: '+595' },
  { code: 'BO', name: 'Bolívia', flag: '🇧🇴', ddi: '+591' },
  { code: 'EC', name: 'Equador', flag: '🇪🇨', ddi: '+593' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', ddi: '+58' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', ddi: '+351' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', ddi: '+34' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', ddi: '+1' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', ddi: '+44' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪', ddi: '+49' },
  { code: 'FR', name: 'França', flag: '🇫🇷', ddi: '+33' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹', ddi: '+39' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺', ddi: '+61' }
];

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  label = "País/DDI",
  required = false
}) => {
  const selectedCountry = countries.find(country => country.ddi === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-12 rounded-lg border border-gray-600 bg-gray-800/50 focus:ring-viverblue/50 text-white">
          <SelectValue placeholder="Selecione o país">
            {selectedCountry && (
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
                <span className="text-viverblue">{selectedCountry.ddi}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600 text-white z-50">
          {countries.map((country) => (
            <SelectItem 
              key={country.code} 
              value={country.ddi}
              className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1">{country.name}</span>
                <span className="text-viverblue font-mono">{country.ddi}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
