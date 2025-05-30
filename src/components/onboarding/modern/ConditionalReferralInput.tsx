
import React from 'react';
import { Input } from '@/components/ui/input';

interface ConditionalReferralInputProps {
  howFoundUs: string;
  referredBy: string;
  onReferredByChange: (value: string) => void;
}

export const ConditionalReferralInput: React.FC<ConditionalReferralInputProps> = ({
  howFoundUs,
  referredBy,
  onReferredByChange
}) => {
  if (howFoundUs !== 'indicacao') return null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Quem te indicou? <span className="text-red-400">*</span>
      </label>
      <Input
        type="text"
        value={referredBy}
        onChange={(e) => onReferredByChange(e.target.value)}
        placeholder="Nome de quem te indicou"
        className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
      />
    </div>
  );
};
