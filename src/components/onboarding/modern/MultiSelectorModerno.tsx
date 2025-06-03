
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface MultiSelectorModernoProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export const MultiSelectorModerno: React.FC<MultiSelectorModernoProps> = ({
  value,
  onChange,
  options,
  placeholder = "Selecione opções...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="min-h-[48px] p-3 border border-gray-600 rounded-md bg-gray-800/50 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {value.map(selectedValue => {
              const option = options.find(opt => opt.value === selectedValue);
              return (
                <Badge 
                  key={selectedValue}
                  variant="secondary"
                  className="bg-viverblue/20 text-viverblue border-viverblue/30"
                >
                  {option?.label || selectedValue}
                  <X 
                    size={12} 
                    className="ml-1 cursor-pointer hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOption(selectedValue);
                    }}
                  />
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <div
              key={option.value}
              className={`p-3 cursor-pointer hover:bg-gray-700 ${
                value.includes(option.value) ? 'bg-viverblue/20 text-viverblue' : 'text-white'
              }`}
              onClick={() => handleToggleOption(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
