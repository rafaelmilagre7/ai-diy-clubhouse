
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

interface SuggestionsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: 'popular' | 'recent';
  onFilterChange: (value: 'popular' | 'recent') => void;
}

export const SuggestionsHeader = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange
}: SuggestionsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sugestões</h1>
          <p className="text-muted-foreground">
            Compartilhe suas ideias para melhorar a plataforma
          </p>
        </div>

        <Button 
          onClick={() => navigate('/suggestions/new')} 
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Sugestão
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar sugestões..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sm:max-w-[300px]"
        />

        <Tabs value={filter} onValueChange={(value: 'popular' | 'recent') => onFilterChange(value)}>
          <TabsList>
            <TabsTrigger value="popular">Mais Populares</TabsTrigger>
            <TabsTrigger value="recent">Mais Recentes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  );
};
