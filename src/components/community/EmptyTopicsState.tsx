
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyTopicsStateProps {
  searchQuery?: string;
  categorySlug?: string;
  onNewTopic?: () => void;
  message?: string;
}

export const EmptyTopicsState: React.FC<EmptyTopicsStateProps> = ({
  searchQuery,
  categorySlug,
  onNewTopic,
  message
}) => {
  const isSearch = !!searchQuery;
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchX className="w-16 h-16 text-muted-foreground" />
      
      <h3 className="mt-4 text-xl font-medium">
        {isSearch 
          ? `Nenhum resultado para "${searchQuery}"`
          : message || "Nenhum tópico encontrado"}
      </h3>
      
      <p className="mt-2 text-muted-foreground max-w-md">
        {isSearch 
          ? "Tente utilizar termos mais gerais ou palavras-chave diferentes."
          : "Seja o primeiro a iniciar uma discussão nessa categoria!"}
      </p>
      
      {categorySlug && !isSearch && (
        <Button 
          className="mt-6"
          onClick={onNewTopic}
          asChild
        >
          <Link to={`/comunidade/novo-topico/${categorySlug}`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar novo tópico
          </Link>
        </Button>
      )}
    </div>
  );
};
