
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
        <span className="text-viverblue font-semibold">{value}</span>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        max={max}
        min={min}
        step={step}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
