
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 10,
  step = 1
}) => {
  const getLabel = (val: number) => {
    if (val <= 2) return 'Iniciante';
    if (val <= 4) return 'Básico';
    if (val <= 6) return 'Intermediário';
    if (val <= 8) return 'Avançado';
    return 'Expert';
  };

  const getColor = (val: number) => {
    if (val <= 2) return 'text-red-400';
    if (val <= 4) return 'text-orange-400';
    if (val <= 6) return 'text-yellow-400';
    if (val <= 8) return 'text-blue-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-white">
        {label}
      </label>
      
      <div className="px-3">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-bold text-viverblue">{value}</span>
          <span className={`text-sm font-medium ${getColor(value)}`}>
            {getLabel(value)}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {min} - {max}
        </div>
      </div>

      {/* Indicadores visuais */}
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span>Nunca usei</span>
        <span>Uso diariamente</span>
      </div>
    </div>
  );
};
