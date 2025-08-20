import React from "react";
import { Search, Filter, RotateCcw, BookOpen, Globe, Clock, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SolutionsFiltersAsideProps {
  filters: {
    searchTerm: string;
    category: string;
    status: string;
    difficulty: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  totalSolutions: number;
  filteredCount: number;
}

export const SolutionsFiltersAside = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalSolutions,
  filteredCount
}: SolutionsFiltersAsideProps) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetFilters}
            className="h-auto p-1 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCount} de {totalSolutions} soluções
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Busca</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar soluções..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange('searchTerm', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={filters.status === 'all' ? 'default' : 'ghost'}
              size="sm"
              className="justify-start gap-2 h-8"
              onClick={() => onFilterChange('status', 'all')}
            >
              <BookOpen className="h-4 w-4" />
              Todas
            </Button>
            <Button
              variant={filters.status === 'published' ? 'default' : 'ghost'}
              size="sm"
              className="justify-start gap-2 h-8"
              onClick={() => onFilterChange('status', 'published')}
            >
              <Globe className="h-4 w-4" />
              Publicadas
            </Button>
            <Button
              variant={filters.status === 'draft' ? 'default' : 'ghost'}
              size="sm"
              className="justify-start gap-2 h-8"
              onClick={() => onFilterChange('status', 'draft')}
            >
              <Clock className="h-4 w-4" />
              Rascunhos
            </Button>
          </div>
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Categoria</Label>
          <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Operacional">Operacional</SelectItem>
              <SelectItem value="Estratégia">Estratégia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Dificuldade</Label>
          <Select value={filters.difficulty} onValueChange={(value) => onFilterChange('difficulty', value)}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Selecionar dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as dificuldades</SelectItem>
              <SelectItem value="easy">Fácil</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="advanced">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};