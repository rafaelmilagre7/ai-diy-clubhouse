
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PublishStatusProps {
  published: boolean;
}

export const PublishStatus: React.FC<PublishStatusProps> = ({ published }) => {
  return published ? (
    <Badge className="bg-green-100 text-green-800">Publicada</Badge>
  ) : (
    <Badge variant="outline">Rascunho</Badge>
  );
};
