import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format?: string;
}

const COUNTRIES: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', dialCode: '+55', format: '(##) #####-####' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', dialCode: '+1', format: '(###) ###-####' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54', format: '## ####-####' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56', format: '# ####-####' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴', dialCode: '+57', format: '### ###-####' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51', format: '### ###-###' },
  { code: 'UY', name: 'Uruguai', flag: '🇺🇾', dialCode: '+598', format: '## ###-###' },
  { code: 'PY', name: 'Paraguai', flag: '🇵🇾', dialCode: '+595', format: '### ###-###' },
  { code: 'BO', name: 'Bolívia', flag: '🇧🇴', dialCode: '+591', format: '## ###-####' },
  { code: 'EC', name: 'Equador', flag: '🇪🇨', dialCode: '+593', format: '## ###-####' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '+58', format: '### ###-####' },
  { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52', format: '## ####-####' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', format: '### ### ###' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', dialCode: '+34', format: '### ### ###' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹', dialCode: '+39', format: '### ### ####' },
  { code: 'FR', name: 'França', flag: '🇫🇷', dialCode: '+33', format: '## ## ## ## ##' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪', dialCode: '+49', format: '#### #######' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', dialCode: '+44', format: '#### ######' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', dialCode: '+1', format: '(###) ###-####' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺', dialCode: '+61', format: '### ### ###' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵', dialCode: '+81', format: '###-####-####' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86', format: '### #### ####' },
  { code: 'IN', name: 'Índia', flag: '🇮🇳', dialCode: '+91', format: '##### #####' },
];

interface InternationalPhoneInputProps {
  value?: string; // formato: +55|11999999999
  onChange: (phone: string) => void;
  error?: string;
  placeholder?: string;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value = '',
  onChange,
  error,
  placeholder = "Número de telefone"
}) => {
  // Parse do valor atual (formato: +55|11999999999)
  const [dialCode, phoneNumber] = value.split('|');
  const selectedCountry = COUNTRIES.find(c => c.dialCode === dialCode) || COUNTRIES[0];
  
  const [selectedCountryCode, setSelectedCountryCode] = useState(selectedCountry.code);
  const [phone, setPhone] = useState(phoneNumber || '');

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const country = COUNTRIES.find(c => c.code === countryCode)!;
    onChange(`${country.dialCode}|${phone}`);
  };

  const formatPhone = (value: string, format?: string) => {
    if (!format) return value;
    
    const numbers = value.replace(/\D/g, '');
    let formatted = '';
    let numberIndex = 0;
    
    for (let i = 0; i < format.length && numberIndex < numbers.length; i++) {
      if (format[i] === '#') {
        formatted += numbers[numberIndex];
        numberIndex++;
      } else if (numberIndex > 0) {
        formatted += format[i];
      }
    }
    
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const country = COUNTRIES.find(c => c.code === selectedCountryCode)!;
    const formattedPhone = formatPhone(value, country.format);
    setPhone(formattedPhone);
    onChange(`${country.dialCode}|${formattedPhone}`);
  };

  const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountryCode)!;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* Seletor de País */}
        <div className="w-32">
          <Select value={selectedCountryCode} onValueChange={handleCountryChange}>
            <SelectTrigger className={`h-12 ${error ? 'border-destructive' : ''}`}>
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountryData.flag}</span>
                  <span className="text-xs font-mono">{selectedCountryData.dialCode}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-xs">{country.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{country.dialCode}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input do Telefone */}
        <div className="flex-1 relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="tel"
            placeholder={selectedCountryData.format?.replace(/#/g, '9') || placeholder}
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`pl-10 h-12 ${error ? 'border-destructive' : ''}`}
          />
        </div>
      </div>
      
      {/* Texto de ajuda */}
      <p className="text-xs text-muted-foreground">
        Formato: {selectedCountryData.dialCode} {selectedCountryData.format?.replace(/#/g, '9') || 'xxxxxxxxx'}
      </p>
    </div>
  );
};