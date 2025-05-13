
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PublishStatusProps {
  published: boolean;
}

export const PublishStatus: React.FC<PublishStatusProps> = ({ published }) => {
  return published ? (
    <Badge variant="success">Publicada</Badge>
  ) : (
    <Badge variant="outline">Rascunho</Badge>
  );
};
