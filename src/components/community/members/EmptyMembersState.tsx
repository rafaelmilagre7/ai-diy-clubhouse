
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface EmptyMembersStateProps {
  hasFilters: boolean;
}

export const EmptyMembersState: React.FC<EmptyMembersStateProps> = ({ hasFilters }) => {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {hasFilters ? 'Nenhum membro encontrado' : 'Nenhum membro ainda'}
        </h3>
        <p className="text-muted-foreground">
          {hasFilters 
            ? 'Não encontramos membros com os filtros aplicados'
            : 'Os membros da comunidade aparecerão aqui em breve.'
          }
        </p>
      </CardContent>
    </Card>
  );
};
