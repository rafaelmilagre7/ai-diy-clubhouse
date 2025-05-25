
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface EmptyMembersStateProps {
  hasFilters: boolean;
}

export const EmptyMembersState = ({ hasFilters }: EmptyMembersStateProps) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {hasFilters ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
        </h3>
        <p className="text-muted-foreground">
          {hasFilters 
            ? 'Tente ajustar os filtros para encontrar mais membros.'
            : 'Seja um dos primeiros a se juntar à nossa comunidade!'
          }
        </p>
      </CardContent>
    </Card>
  );
};
