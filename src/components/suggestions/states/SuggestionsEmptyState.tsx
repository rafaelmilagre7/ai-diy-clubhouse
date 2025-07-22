
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, SearchX } from 'lucide-react';

interface SuggestionsEmptyStateProps {
  searchQuery?: string;
}

export const SuggestionsEmptyState: React.FC<SuggestionsEmptyStateProps> = ({ searchQuery }) => {
  const navigate = useNavigate();
  
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
        <div className="bg-muted/30 rounded-full p-6 mb-6">
          <SearchX className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          Nenhuma sugestão encontrada
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
          Não encontramos nenhuma sugestão para <span className="font-medium">"{searchQuery}"</span>. 
          Tente usar termos diferentes ou crie uma nova sugestão.
        </p>
        <Button 
          onClick={() => navigate('/suggestions/new')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-11 rounded-lg"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Criar Nova Sugestão
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="bg-muted/30 rounded-full p-6 mb-6">
        <MessageSquarePlus className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">
        Ainda não há sugestões
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
        Seja o primeiro a compartilhar uma ideia ou sugestão para melhorarmos o VIVER DE IA Club.
      </p>
      <Button 
        onClick={() => navigate('/suggestions/new')}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-11 rounded-lg"
      >
        <MessageSquarePlus className="w-4 h-4 mr-2" />
        Criar Primeira Sugestão
      </Button>
    </div>
  );
};
