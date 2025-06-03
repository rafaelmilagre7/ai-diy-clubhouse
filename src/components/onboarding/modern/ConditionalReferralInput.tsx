
import React from 'react';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';

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
  if (howFoundUs !== 'indicacao') {
    return null;
  }

  return (
    <div className="space-y-2 animate-fade-in">
      <label className="block text-sm font-medium text-white">
        Quem te indicou? <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Users className="w-4 h-4 text-viverblue" />
        </div>
        <Input
          type="text"
          value={referredBy}
          onChange={(e) => onReferredByChange(e.target.value)}
          placeholder="Nome da pessoa que te indicou"
          className="pl-10 h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50 placeholder-gray-500"
        />
      </div>
    </div>
  );
};
