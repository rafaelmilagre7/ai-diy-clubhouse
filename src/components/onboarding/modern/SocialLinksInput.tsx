
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
  const validateInstagram = (url: string) => {
    if (!url) return true; // Opcional
    return url.includes('instagram.com') || url.startsWith('@');
  };

  const validateLinkedin = (url: string) => {
    if (!url) return true; // Opcional
    return url.includes('linkedin.com');
  };

  const isInstagramValid = validateInstagram(instagramValue);
  const isLinkedinValid = validateLinkedin(linkedinValue);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Redes Sociais (opcional)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Instagram */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Instagram
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Instagram className={`w-4 h-4 ${isInstagramValid ? 'text-pink-400' : 'text-gray-400'}`} />
            </div>
            <Input
              type="text"
              value={instagramValue}
              onChange={(e) => onInstagramChange(e.target.value)}
              placeholder="@seu_usuario ou link completo"
              className={`pl-10 h-12 bg-gray-800/50 border transition-all duration-200 ${
                isInstagramValid && instagramValue
                  ? 'border-pink-500/50 bg-pink-50/5 focus:ring-pink-500/50'
                  : 'border-gray-600 focus:ring-viverblue/50'
              } text-white placeholder-gray-500`}
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            LinkedIn
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Linkedin className={`w-4 h-4 ${isLinkedinValid ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
            <Input
              type="text"
              value={linkedinValue}
              onChange={(e) => onLinkedinChange(e.target.value)}
              placeholder="linkedin.com/in/seu-perfil"
              className={`pl-10 h-12 bg-gray-800/50 border transition-all duration-200 ${
                isLinkedinValid && linkedinValue
                  ? 'border-blue-500/50 bg-blue-50/5 focus:ring-blue-500/50'
                  : 'border-gray-600 focus:ring-viverblue/50'
              } text-white placeholder-gray-500`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
