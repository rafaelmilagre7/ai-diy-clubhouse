
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SuggestionsHeaderProps {
  totalSuggestions: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SuggestionsHeader: React.FC<SuggestionsHeaderProps> = ({
  totalSuggestions,
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Lightbulb className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Sugestões da Comunidade</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Compartilhe ideias e ajude a melhorar nossa plataforma
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar sugestões..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild className="whitespace-nowrap">
            <Link to="/suggestions/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Sugestão
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="text-center">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{totalSuggestions}</span> sugestões da comunidade
        </p>
      </div>
    </div>
  );
};
