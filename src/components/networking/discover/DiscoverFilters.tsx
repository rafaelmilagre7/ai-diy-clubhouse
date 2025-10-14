import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Handshake, BookOpen, Sparkles } from 'lucide-react';

interface DiscoverFiltersProps {
  selectedFilter: 'all' | 'opportunities' | 'partnerships' | 'knowledge';
  onFilterChange: (filter: 'all' | 'opportunities' | 'partnerships' | 'knowledge') => void;
  matchCount: number;
}

export const DiscoverFilters = ({ selectedFilter, onFilterChange, matchCount }: DiscoverFiltersProps) => {
  const filters = [
    {
      id: 'all' as const,
      label: 'Todos',
      icon: Sparkles,
      description: 'Ver todos os matches',
      color: 'text-aurora'
    },
    {
      id: 'opportunities' as const,
      label: 'Oportunidades',
      icon: Target,
      description: 'Clientes e vendas',
      color: 'text-viverblue'
    },
    {
      id: 'partnerships' as const,
      label: 'Parcerias',
      icon: Handshake,
      description: 'Colaborações estratégicas',
      color: 'text-revenue'
    },
    {
      id: 'knowledge' as const,
      label: 'Conhecimento',
      icon: BookOpen,
      description: 'Expertise e aprendizado',
      color: 'text-operational'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = selectedFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              variant={isActive ? 'default' : 'outline'}
              className={`
                relative group transition-all duration-300
                ${isActive 
                  ? 'bg-aurora/20 text-aurora border-aurora/40 hover:bg-aurora/30' 
                  : 'border-border/50 hover:border-aurora/40 hover:bg-aurora/5'
                }
              `}
            >
              <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-aurora' : filter.color}`} />
              <span className="font-medium">{filter.label}</span>
              {isActive && (
                <div className="absolute inset-0 aurora-glow rounded-lg opacity-50"></div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-elevated border border-border/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-aurora" />
          <span className="text-sm text-text-muted">
            {selectedFilter === 'all' ? 'Total de matches' : `Matches de ${filters.find(f => f.id === selectedFilter)?.label.toLowerCase()}`}
          </span>
        </div>
        <Badge className="bg-aurora/20 text-aurora border-aurora/40">
          {matchCount}
        </Badge>
      </div>
    </div>
  );
};
