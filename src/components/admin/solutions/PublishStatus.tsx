
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
        className="bg-status-success/20 text-status-success border-status-success/30 cursor-pointer hover:bg-status-success/30"
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
      className="bg-status-warning/20 text-status-warning border-status-warning/30 cursor-pointer hover:bg-status-warning/30"
      onClick={handleClick}
    >
      <X className="mr-1 h-3 w-3" />
      Rascunho
    </Badge>
  );
};
