
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface PublishStatusProps {
  published: boolean;
  onToggle?: () => void;
}

export const PublishStatus: React.FC<PublishStatusProps> = ({ published, onToggle }) => {
  const handleClick = () => {
    if (onToggle) {
      onToggle();
    }
  };

  if (published) {
    return (
      <Badge 
        variant="outline" 
        className="bg-green-900/40 text-green-300 border-green-700 cursor-pointer hover:bg-green-800/40"
        onClick={handleClick}
      >
        <Check className="mr-1 h-3 w-3" />
        Publicada
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="outline" 
      className="bg-amber-900/40 text-amber-300 border-amber-700 cursor-pointer hover:bg-amber-800/40"
      onClick={handleClick}
    >
      <X className="mr-1 h-3 w-3" />
      Rascunho
    </Badge>
  );
};
