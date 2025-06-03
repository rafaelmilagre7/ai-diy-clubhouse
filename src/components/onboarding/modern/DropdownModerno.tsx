
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

interface DropdownModernoProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  label: string;
  required?: boolean;
}

export const DropdownModerno: React.FC<DropdownModernoProps> = ({
  value,
  onChange,
  options,
  placeholder,
  label,
  required = false
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="text-white hover:bg-gray-700 focus:bg-gray-700"
            >
              <span className="flex items-center gap-2">
                {option.icon && <span>{option.icon}</span>}
                {option.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
