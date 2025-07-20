
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  SlidersHorizontal, 
  Clock, 
  TrendingUp, 
  MessageSquareX, 
  CheckCircle2,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type FilterType = "recentes" | "populares" | "sem-respostas" | "resolvidos";

interface CommunityFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const CommunityFilters = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange
}: CommunityFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const filters = [
    {
      key: "recentes" as FilterType,
      label: "Recentes",
      icon: Clock,
      description: "Tópicos mais novos primeiro"
    },
    {
      key: "populares" as FilterType,
      label: "Populares",
      icon: TrendingUp,
      description: "Mais visualizados e comentados"
    },
    {
      key: "sem-respostas" as FilterType,
      label: "Sem Respostas",
      icon: MessageSquareX,
      description: "Tópicos que precisam de ajuda"
    },
    {
      key: "resolvidos" as FilterType,
      label: "Resolvidos",
      icon: CheckCircle2,
      description: "Tópicos com solução"
    }
  ];

  const activeFilterData = filters.find(f => f.key === activeFilter);

  return (
    <div className="space-y-4 mb-6">
      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar tópicos na comunidade..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 h-12 text-base"
        />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
        </div>

        {/* Filtros Rápidos - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.key;
            
            return (
              <Button
                key={filter.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(filter.key)}
                className={`h-8 gap-2 ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="h-3 w-3" />
                {filter.label}
              </Button>
            );
          })}
        </div>

        {/* Dropdown de Filtros - Mobile */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <SlidersHorizontal className="h-3 w-3" />
                {activeFilterData?.label || "Filtrar"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.key;
                
                return (
                  <DropdownMenuItem
                    key={filter.key}
                    onClick={() => onFilterChange(filter.key)}
                    className={`gap-2 ${isActive ? "bg-muted" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{filter.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {filter.description}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badge do Filtro Ativo */}
        <Badge variant="secondary" className="gap-1">
          {activeFilterData && <activeFilterData.icon className="h-3 w-3" />}
          {activeFilterData?.label}
        </Badge>

        {/* Indicador de Busca */}
        {searchQuery && (
          <Badge variant="outline" className="gap-1">
            <Search className="h-3 w-3" />
            "{searchQuery}"
            <button
              onClick={() => onSearchChange("")}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              ✕
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
};
