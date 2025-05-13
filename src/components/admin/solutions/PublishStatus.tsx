
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PublishStatusProps {
  published: boolean;
}

export const PublishStatus: React.FC<PublishStatusProps> = ({ published }) => {
  return published ? (
    <Badge variant="success">Publicada</Badge>
  ) : (
    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-400">Rascunho</Badge>
  );
};
