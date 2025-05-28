
import React from 'react';
import { Input } from '@/components/ui/input';

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
  required = false
}) => {
  const formatWhatsApp = (input: string) => {
    // Remove tudo que não for número
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

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        WhatsApp {required && <span className="text-red-400">*</span>}
      </label>
      <Input
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
        maxLength={15}
      />
    </div>
  );
};
