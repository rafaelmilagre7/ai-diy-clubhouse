
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, TrendingUp, Clock, Lightbulb, Wrench, CheckCircle, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SuggestionFilter } from '@/hooks/suggestions/useSuggestions';
import { cn } from '@/lib/utils';

interface SuggestionsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: SuggestionFilter;
  onFilterChange: (value: SuggestionFilter) => void;
}

export const SuggestionsHeader: React.FC<SuggestionsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange
}) => {
  const navigate = useNavigate();

  const filterOptions = [
    { value: 'all', label: 'Todas', icon: Filter, color: 'bg-gray-100 text-gray-700' },
    { value: 'popular', label: 'Populares', icon: TrendingUp, color: 'bg-red-100 text-red-700' },
    { value: 'recent', label: 'Recentes', icon: Clock, color: 'bg-blue-100 text-blue-700' },
    { value: 'new', label: 'Novas', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'in_development', label: 'Em Desenvolvimento', icon: Wrench, color: 'bg-orange-100 text-orange-700' },
    { value: 'implemented', label: 'Implementadas', icon: CheckCircle, color: 'bg-green-100 text-green-700' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Central de Sugestões
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Compartilhe suas ideias, vote em sugestões da comunidade e acompanhe o desenvolvimento de novas funcionalidades.
            </p>
            <div className="flex items-center gap-2 text-white/80">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">Sua voz importa para o futuro da plataforma</span>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/suggestions/new')}
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 font-semibold gap-2 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={20} />
            Nova Sugestão
          </Button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            placeholder="Buscar sugestões por título, descrição..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-primary transition-colors bg-white/50 backdrop-blur-sm"
          />
        </div>
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 justify-center">
          {filterOptions.map((option) => {
            const isActive = filter === option.value;
            const Icon = option.icon;
            
            return (
              <button
                key={option.value}
                onClick={() => onFilterChange(option.value as SuggestionFilter)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/25" 
                    : "bg-white border border-gray-200 text-gray-700 hover:border-primary/50 hover:shadow-md"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
