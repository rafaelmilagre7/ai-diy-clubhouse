
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SuggestionsEmptyStateProps {
  searchQuery?: string;
}

export const SuggestionsEmptyState: React.FC<SuggestionsEmptyStateProps> = ({
  searchQuery
}) => {
  const isSearching = searchQuery && searchQuery.trim().length > 0;

  return (
    <Card className="text-center py-16">
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          {isSearching ? (
            <Search className="h-16 w-16 text-muted-foreground" />
          ) : (
            <Lightbulb className="h-16 w-16 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            {isSearching 
              ? `Nenhuma sugestão encontrada para "${searchQuery}"`
              : 'Nenhuma sugestão ainda'
            }
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isSearching
              ? 'Tente usar termos diferentes ou crie uma nova sugestão com sua ideia.'
              : 'Seja o primeiro a compartilhar uma ideia para melhorar nossa plataforma!'
            }
          </p>
        </div>
        
        <div className="space-y-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/suggestions/new">
              <Plus className="h-4 w-4" />
              Criar Nova Sugestão
            </Link>
          </Button>
          
          {isSearching && (
            <div>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Ver todas as sugestões
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
