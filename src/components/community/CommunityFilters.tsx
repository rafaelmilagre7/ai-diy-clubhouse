
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Clock, TrendingUp, MessageSquareX, CheckCircle2 } from "lucide-react";
import { CommunityFilterType, CommunityFiltersProps } from "@/types/communityTypes";

export const CommunityFilters = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange
}: CommunityFiltersProps) => {
  const filters = [
    {
      key: "recentes" as CommunityFilterType,
      label: "Recentes",
      icon: Clock,
      description: "Tópicos mais novos primeiro"
    },
    {
      key: "populares" as CommunityFilterType,
      label: "Populares", 
      icon: TrendingUp,
      description: "Mais visualizados e comentados"
    },
    {
      key: "sem-respostas" as CommunityFilterType,
      label: "Sem Respostas",
      icon: MessageSquareX,
      description: "Tópicos que precisam de ajuda"
    },
    {
      key: "resolvidos" as CommunityFilterType,
      label: "Resolvidos",
      icon: CheckCircle2,
      description: "Tópicos com solução"
    }
  ];

  const activeFilterData = filters.find(f => f.key === activeFilter);

  return (
    <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-lg space-y-md">
      {/* Filtros em Pills - Mais Elegante */}
      <div className="flex items-center justify-between gap-md flex-wrap">
        <div className="flex items-center gap-sm">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Filtrar por:</span>
        </div>

        <div className="flex items-center gap-sm flex-wrap">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.key;
            
            return (
              <Badge
                key={filter.key}
                variant={isActive ? "default" : "secondary"}
                className={`px-md py-sm cursor-pointer transition-all duration-slow hover:scale-105 gap-sm ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg" 
                    : "bg-background/60 backdrop-blur-sm hover:bg-background/80"
                }`}
                onClick={() => onFilterChange(filter.key)}
              >
                <Icon className="h-3 w-3" />
                {filter.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Indicador de Busca */}
      {searchQuery && (
        <div className="flex items-center gap-sm pt-2 border-t border-border/30">
          <Badge variant="outline" className="gap-sm">
            <Search className="h-3 w-3" />
            Buscando por: "{searchQuery}"
            <button
              onClick={() => onSearchChange("")}
              className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
            >
              ✕
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
};
