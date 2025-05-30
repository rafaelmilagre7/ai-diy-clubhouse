
import React from 'react';
import { Input } from '@/components/ui/input';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Data de nascimento {required && <span className="text-red-400">*</span>}
      </label>
      <Input
        type="date"
        value={value}
        onChange={handleChange}
        className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
      />
    </div>
  );
};
