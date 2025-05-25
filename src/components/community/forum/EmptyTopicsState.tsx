
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyTopicsStateProps {
  searchQuery?: string;
}

export const EmptyTopicsState = ({ searchQuery }: EmptyTopicsStateProps) => {
  if (searchQuery) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum tópico encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            Não encontramos tópicos para "{searchQuery}". Tente outras palavras-chave.
          </p>
          <Button asChild>
            <Link to="/comunidade/novo-topico">
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Tópico
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Seja o primeiro a iniciar uma discussão
        </h3>
        <p className="text-muted-foreground mb-4">
          Ainda não há tópicos nesta categoria. Que tal começar uma nova conversa?
        </p>
        <Button asChild>
          <Link to="/comunidade/novo-topico">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Tópico
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
