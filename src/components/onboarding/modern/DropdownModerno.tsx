
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Check } from 'lucide-react';

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
  error?: string;
}

export const DropdownModerno: React.FC<DropdownModernoProps> = ({
  value,
  onChange,
  options,
  placeholder,
  label,
  required = false,
  error
}) => {
  const isValid = !required || (required && value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className={`w-full h-12 rounded-lg border transition-all duration-200 ${
            error
              ? 'border-red-500 bg-red-50/5 focus:ring-red-500/50'
              : isValid && value
                ? 'border-green-500/50 bg-green-50/5 focus:ring-green-500/50'
                : 'border-gray-600 bg-gray-800/50 focus:ring-viverblue/50'
          } focus:outline-none focus:ring-2 text-white`}
        >
          <SelectValue 
            placeholder={placeholder}
            className="text-white"
          />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600 text-white z-50">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isValid && value && !error && (
        <div className="flex items-center space-x-1 text-green-400 text-sm animate-fade-in">
          <Check className="w-3 h-3" />
          <span>Selecionado!</span>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm animate-fade-in">{error}</p>
      )}
    </div>
  );
};
