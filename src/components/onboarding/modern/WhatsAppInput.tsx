
import React from 'react';
import { Input } from '@/components/ui/input';
import { Phone } from 'lucide-react';

interface WhatsAppInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const WhatsAppInput: React.FC<WhatsAppInputProps> = ({
  value,
  onChange,
  placeholder = "(11) 99999-9999",
  required = true
}) => {
  const formatWhatsApp = (input: string) => {
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    onChange(formatted);
  };

  const isValid = value.length === 15; // (11) 99999-9999

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        WhatsApp {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Phone className={`w-4 h-4 ${isValid ? 'text-green-400' : 'text-viverblue'}`} />
        </div>
        <Input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={15}
          className={`pl-10 h-12 bg-gray-800/50 border transition-all duration-200 ${
            isValid
              ? 'border-green-500/50 bg-green-50/5 focus:ring-green-500/50'
              : 'border-gray-600 focus:ring-viverblue/50'
          } text-white placeholder-gray-500`}
        />
        {isValid && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {isValid && (
        <p className="text-green-400 text-sm animate-fade-in">Número válido! ✓</p>
      )}
    </div>
  );
};
