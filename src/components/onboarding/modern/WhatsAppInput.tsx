
import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const WhatsAppInput: React.FC<WhatsAppInputProps> = ({
  value,
  onChange,
  error,
  placeholder = "WhatsApp"
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Formatar número no padrão brasileiro
  const formatPhoneNumber = (input: string) => {
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica formatação
    if (limitedNumbers.length === 0) return '';
    if (limitedNumbers.length <= 2) return `(${limitedNumbers}`;
    if (limitedNumbers.length <= 7) return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  };

  useEffect(() => {
    setDisplayValue(formatPhoneNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numbersOnly = inputValue.replace(/\D/g, '');
    
    setDisplayValue(formatPhoneNumber(inputValue));
    onChange(numbersOnly);
  };

  const isValid = value.length >= 10; // DDD + pelo menos 8 dígitos

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        WhatsApp <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <MessageCircle className={`w-4 h-4 ${isValid ? 'text-green-400' : 'text-gray-400'}`} />
          <span className="text-gray-400 text-sm">+55</span>
        </div>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-20 pr-4 py-3 rounded-lg border transition-all duration-200 ${
            error
              ? 'border-red-500 bg-red-50/5 focus:ring-red-500/50'
              : isValid
                ? 'border-green-500/50 bg-green-50/5 focus:ring-green-500/50'
                : 'border-gray-600 bg-gray-800/50 focus:ring-viverblue/50'
          } focus:outline-none focus:ring-2 text-white placeholder-gray-500`}
        />
        {isValid && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-sm animate-fade-in">{error}</p>
      )}
      {isValid && !error && (
        <p className="text-green-400 text-sm animate-fade-in">WhatsApp válido! ✓</p>
      )}
    </div>
  );
};
