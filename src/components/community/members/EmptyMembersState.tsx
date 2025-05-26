
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, UserPlus } from 'lucide-react';

interface EmptyMembersStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export const EmptyMembersState: React.FC<EmptyMembersStateProps> = ({
  hasFilters,
  onClearFilters
}) => {
  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum membro encontrado</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Não encontramos membros que correspondam aos filtros aplicados. 
            Tente ajustar os critérios de busca.
          </p>
          {onClearFilters && (
            <Button onClick={onClearFilters} variant="outline">
              Limpar filtros
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhum membro na comunidade</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          A comunidade ainda não possui membros. Seja um dos primeiros a se juntar 
          e começar a construir conexões valiosas!
        </p>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar membros
        </Button>
      </CardContent>
    </Card>
  );
};
