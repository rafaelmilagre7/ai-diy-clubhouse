
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyTopicsStateProps {
  searchQuery?: string;
}

export const EmptyTopicsState: React.FC<EmptyTopicsStateProps> = ({ searchQuery }) => {
  const navigate = useNavigate();

  if (searchQuery) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum tópico encontrado</h3>
          <p className="text-muted-foreground mb-6">
            Não encontramos tópicos que correspondam à sua busca por "{searchQuery}".
            Tente usar termos diferentes ou criar um novo tópico.
          </p>
          <Button onClick={() => navigate('/comunidade/novo-topico')}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Tópico
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhum tópico nesta categoria</h3>
        <p className="text-muted-foreground mb-6">
          Seja o primeiro a iniciar uma discussão nesta categoria.
          Compartilhe suas dúvidas, ideias ou conhecimentos!
        </p>
        <Button onClick={() => navigate('/comunidade/novo-topico')}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Primeiro Tópico
        </Button>
      </CardContent>
    </Card>
  );
};
