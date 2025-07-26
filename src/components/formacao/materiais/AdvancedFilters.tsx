import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  HardDrive,
  Heart,
  Clock,
  RotateCcw
} from "lucide-react";
import { MaterialFilters } from "./types";

interface AdvancedFiltersProps {
  filters: MaterialFilters;
  onFiltersChange: (filters: MaterialFilters) => void;
  cursos: {id: string, title: string}[];
  activeFilterCount: number;
}

export const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  cursos,
  activeFilterCount 
}: AdvancedFiltersProps) => {
  
  const updateFilter = (key: keyof MaterialFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      course: 'todos',
      type: 'todos',
      dateRange: 'todos',
      sizeRange: 'todos',
      showFavorites: false
    });
  };

  const getActiveFilters = () => {
    const active = [];
    if (filters.search) active.push(`Busca: "${filters.search}"`);
    if (filters.course !== 'todos') {
      const course = cursos.find(c => c.id === filters.course);
      active.push(`Curso: ${course?.title || filters.course}`);
    }
    if (filters.type !== 'todos') active.push(`Tipo: ${filters.type}`);
    if (filters.dateRange !== 'todos') active.push(`Data: ${filters.dateRange}`);
    if (filters.sizeRange !== 'todos') active.push(`Tamanho: ${filters.sizeRange}`);
    if (filters.showFavorites) active.push('Favoritos');
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <Card className="bg-gradient-to-r from-card/50 to-card/30 border-0 shadow-lg">
      <CardContent className="p-6 space-y-4">
        {/* Busca principal */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar materiais por nome, descrição ou conteúdo..." 
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 h-12 bg-background/50 border-0 shadow-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {activeFilterCount} filtros ativos
            </span>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-2"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Filtros avançados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Curso */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Curso</Label>
            <Select value={filters.course} onValueChange={(value) => updateFilter('course', value)}>
              <SelectTrigger className="h-10 bg-background/50 border-0 shadow-sm">
                <SelectValue placeholder="Todos os cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os cursos</SelectItem>
                {cursos.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {curso.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de arquivo */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Tipo</Label>
            <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
              <SelectTrigger className="h-10 bg-background/50 border-0 shadow-sm">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="doc">Documentos</SelectItem>
                <SelectItem value="zip">Arquivos compactados</SelectItem>
                <SelectItem value="image">Imagens</SelectItem>
                <SelectItem value="video">Vídeos</SelectItem>
                <SelectItem value="link">Links externos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Data</Label>
            <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
              <SelectTrigger className="h-10 bg-background/50 border-0 shadow-sm">
                <SelectValue placeholder="Qualquer data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Qualquer data</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Último mês</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="ano">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tamanho */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Tamanho</Label>
            <Select value={filters.sizeRange} onValueChange={(value) => updateFilter('sizeRange', value)}>
              <SelectTrigger className="h-10 bg-background/50 border-0 shadow-sm">
                <SelectValue placeholder="Qualquer tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Qualquer tamanho</SelectItem>
                <SelectItem value="pequeno">Pequeno (&lt; 1MB)</SelectItem>
                <SelectItem value="medio">Médio (1-10MB)</SelectItem>
                <SelectItem value="grande">Grande (10-100MB)</SelectItem>
                <SelectItem value="muito-grande">Muito grande (&gt; 100MB)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Especiais */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">Especiais</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="favorites"
                  checked={filters.showFavorites}
                  onCheckedChange={(checked) => updateFilter('showFavorites', checked)}
                />
                <Label htmlFor="favorites" className="text-sm flex items-center">
                  <Heart className="h-3 w-3 mr-1 text-red-500" />
                  Favoritos
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros ativos */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-muted/20">
            <span className="text-xs text-muted-foreground self-center">Filtros ativos:</span>
            {activeFilters.map((filter, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {filter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => {
                    if (filter.startsWith('Busca:')) updateFilter('search', '');
                    else if (filter.startsWith('Curso:')) updateFilter('course', 'todos');
                    else if (filter.startsWith('Tipo:')) updateFilter('type', 'todos');
                    else if (filter.startsWith('Data:')) updateFilter('dateRange', 'todos');
                    else if (filter.startsWith('Tamanho:')) updateFilter('sizeRange', 'todos');
                    else if (filter === 'Favoritos') updateFilter('showFavorites', false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};