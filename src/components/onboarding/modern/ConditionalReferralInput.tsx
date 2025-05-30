
import React from 'react';
import { Input } from '@/components/ui/input';

interface ConditionalReferralInputProps {
  show: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const ConditionalReferralInput: React.FC<ConditionalReferralInputProps> = ({
  show,
  value,
  onChange
}) => {
  if (!show) return null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Quem te indicou? <span className="text-red-400">*</span>
      </label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nome da pessoa que te indicou"
        className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
      />
    </div>
  );
};
