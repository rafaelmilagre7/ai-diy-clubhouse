
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Lightbulb, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuggestionsEmptyStateProps {
  searchQuery?: string;
}

export const SuggestionsEmptyState: React.FC<SuggestionsEmptyStateProps> = ({
  searchQuery
}) => {
  const navigate = useNavigate();

  if (searchQuery) {
    return (
      <Card className="text-center py-12 animate-fade-in">
        <CardContent>
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma sugestão encontrada
          </h3>
          <p className="text-muted-foreground mb-6">
            Não encontramos sugestões que correspondam à sua busca por "{searchQuery}".
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Limpar busca
            </Button>
            <Button onClick={() => navigate('/suggestions/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sugestão
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-center py-12 animate-fade-in">
      <CardContent>
        <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Seja o primeiro a sugerir!
        </h3>
        <p className="text-muted-foreground mb-6">
          Ainda não temos sugestões na plataforma. Que tal compartilhar sua ideia e 
          ajudar a comunidade a crescer?
        </p>
        <Button onClick={() => navigate('/suggestions/new')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Criar primeira sugestão
        </Button>
      </CardContent>
    </Card>
  );
};
