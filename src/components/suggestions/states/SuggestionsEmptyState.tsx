
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Plus, Search } from 'lucide-react';

interface SuggestionsEmptyStateProps {
  searchQuery?: string;
}

export const SuggestionsEmptyState: React.FC<SuggestionsEmptyStateProps> = ({ 
  searchQuery 
}) => {
  const navigate = useNavigate();

  if (searchQuery) {
    return (
      <Card className="p-8 text-center border-dashed border-2">
        <div className="max-w-md mx-auto space-y-4">
          <Search className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">Nenhuma sugestão encontrada</h3>
          <p className="text-muted-foreground">
            Não encontramos sugestões para "{searchQuery}". 
            Tente ajustar os termos de busca ou criar uma nova sugestão.
          </p>
          <Button 
            onClick={() => navigate('/suggestions/new')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar nova sugestão
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-12 text-center border-dashed border-2">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="p-4 bg-primary/10 text-primary rounded-full w-20 h-20 mx-auto flex items-center justify-center">
          <Lightbulb className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold">Compartilhe suas ideias</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Ainda não há sugestões na comunidade. Seja o primeiro a contribuir 
            com ideias para melhorar nossa plataforma!
          </p>
        </div>
        <Button 
          onClick={() => navigate('/suggestions/new')}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Criar primeira sugestão
        </Button>
      </div>
    </Card>
  );
};
