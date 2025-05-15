
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface PublishStatusProps {
  published: boolean;
}

export const PublishStatus: React.FC<PublishStatusProps> = ({ published }) => {
  if (published) {
    return (
      <Badge variant="outline" className="bg-green-900/40 text-green-300 border-green-700">
        <Check className="mr-1 h-3 w-3" />
        Publicada
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-900/40 text-amber-300 border-amber-700">
      <X className="mr-1 h-3 w-3" />
      Rascunho
    </Badge>
  );
};
