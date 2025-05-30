
import React from 'react';
import { Input } from '@/components/ui/input';
import { Instagram, Linkedin } from 'lucide-react';

interface SocialLinksInputProps {
  instagramValue: string;
  linkedinValue: string;
  onInstagramChange: (value: string) => void;
  onLinkedinChange: (value: string) => void;
}

export const SocialLinksInput: React.FC<SocialLinksInputProps> = ({
  instagramValue,
  linkedinValue,
  onInstagramChange,
  onLinkedinChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white flex items-center gap-2">
          <Instagram size={16} />
          Instagram
        </label>
        <Input
          type="url"
          value={instagramValue}
          onChange={(e) => onInstagramChange(e.target.value)}
          placeholder="https://instagram.com/seu-perfil"
          className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white flex items-center gap-2">
          <Linkedin size={16} />
          LinkedIn
        </label>
        <Input
          type="url"
          value={linkedinValue}
          onChange={(e) => onLinkedinChange(e.target.value)}
          placeholder="https://linkedin.com/in/seu-perfil"
          className="h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-viverblue/50"
        />
      </div>
    </div>
  );
};
