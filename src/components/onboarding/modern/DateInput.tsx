
import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  label = "Data de nascimento",
  required = false,
  placeholder = "dd/mm/aaaa"
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '');
    
    if (inputValue.length >= 2) {
      inputValue = inputValue.substring(0, 2) + '/' + inputValue.substring(2);
    }
    if (inputValue.length >= 5) {
      inputValue = inputValue.substring(0, 5) + '/' + inputValue.substring(5, 9);
    }
    
    onChange(inputValue);
  };

  const isValid = value.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Calendar className={`w-4 h-4 ${isValid ? 'text-green-400' : 'text-gray-400'}`} />
        </div>
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={10}
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
        <p className="text-green-400 text-sm animate-fade-in">Data válida! ✓</p>
      )}
    </div>
  );
};
