
import React from 'react';
import { Input } from '@/components/ui/input';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  required = false,
  label = "Data de nascimento",
  placeholder = "DD/MM/AAAA"
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    
    if (input.length >= 2) {
      input = input.substring(0, 2) + '/' + input.substring(2);
    }
    if (input.length >= 5) {
      input = input.substring(0, 5) + '/' + input.substring(5, 9);
    }
    
    onChange(input);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <Input
        type="text"
        value={value}
        onChange={handleDateChange}
        placeholder={placeholder}
        maxLength={10}
        className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
      />
    </div>
  );
};
