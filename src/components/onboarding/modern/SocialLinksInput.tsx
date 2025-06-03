
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Instagram <span className="text-gray-400 text-sm font-normal">(opcional)</span>
        </label>
        <div className="relative">
          <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="url"
            value={instagramValue}
            onChange={(e) => onInstagramChange(e.target.value)}
            placeholder="instagram.com/seu.perfil"
            className="h-12 pl-10 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          LinkedIn <span className="text-gray-400 text-sm font-normal">(opcional)</span>
        </label>
        <div className="relative">
          <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="url"
            value={linkedinValue}
            onChange={(e) => onLinkedinChange(e.target.value)}
            placeholder="linkedin.com/in/seu-perfil"
            className="h-12 pl-10 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
          />
        </div>
      </div>
    </div>
  );
};
