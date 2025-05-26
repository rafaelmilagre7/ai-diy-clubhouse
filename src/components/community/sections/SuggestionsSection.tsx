
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, TrendingUp, Clock, CheckCircle, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuggestionsSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'Todas', icon: Lightbulb },
    { id: 'trending', label: 'Em Alta', icon: TrendingUp },
    { id: 'recent', label: 'Recentes', icon: Clock },
    { id: 'implemented', label: 'Implementadas', icon: CheckCircle },
  ];

  const handleNewSuggestion = () => {
    navigate('/suggestions/new');
  };

  return (
    <div className="space-y-6">
      {/* Header com busca e novo tópico */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sugestões..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button onClick={handleNewSuggestion} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Sugestão
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <filter.icon className="h-4 w-4" />
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Estado vazio temporário */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Lightbulb className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Centro de Sugestões</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Compartilhe suas ideias para melhorar a plataforma e a experiência da comunidade. 
            Suas sugestões são valiosas para nós!
          </p>
          <Button onClick={handleNewSuggestion}>
            <Plus className="h-4 w-4 mr-2" />
            Fazer primeira sugestão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
