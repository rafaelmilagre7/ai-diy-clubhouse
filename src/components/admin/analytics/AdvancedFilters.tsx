
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CalendarIcon, 
  FilterIcon, 
  XIcon, 
  Clock, 
  Calendar as CalendarSimple,
  TrendingUp,
  Users,
  Settings
} from 'lucide-react';

interface FilterConfig {
  timeRange: string;
  setTimeRange: (range: string) => void;
  category?: string;
  setCategory?: (category: string) => void;
  difficulty?: string;
  setDifficulty?: (difficulty: string) => void;
  role?: string;
  setRole?: (role: string) => void;
  customDateRange?: { from: Date | undefined; to: Date | undefined };
  setCustomDateRange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

const quickFilters = [
  { id: '7d', label: 'Últimos 7 dias', icon: Clock },
  { id: '30d', label: 'Últimos 30 dias', icon: CalendarSimple },
  { id: '90d', label: 'Últimos 90 dias', icon: TrendingUp },
  { id: 'all', label: 'Todo período', icon: Users },
];

export const AdvancedFilters: React.FC<FilterConfig> = ({
  timeRange,
  setTimeRange,
  category,
  setCategory,
  difficulty,
  setDifficulty,
  role,
  setRole,
  customDateRange,
  setCustomDateRange
}) => {
  const [isCustomDateOpen, setIsCustomDateOpen] = React.useState(false);
  const activeFiltersCount = [
    timeRange !== 'all' ? 1 : 0,
    category && category !== 'all' ? 1 : 0,
    difficulty && difficulty !== 'all' ? 1 : 0,
    role && role !== 'all' ? 1 : 0,
    customDateRange?.from ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  const clearAllFilters = () => {
    setTimeRange('all');
    setCategory?.('all');
    setDifficulty?.('all');
    setRole?.('all');
    setCustomDateRange?.({ from: undefined, to: undefined });
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-6">
        {/* Header com contador de filtros ativos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filtros Avançados</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-slate-500 hover:text-slate-700"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Limpar tudo
            </Button>
          )}
        </div>

        {/* Filtros rápidos de período */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Período</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={timeRange === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(filter.id)}
                  className={cn(
                    "justify-start gap-2 h-10",
                    timeRange === filter.id 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{filter.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Período customizado */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Período Customizado</Label>
          <Popover open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !customDateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateRange?.from ? (
                  customDateRange.to ? (
                    <>
                      {format(customDateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(customDateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(customDateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customDateRange?.from}
                selected={customDateRange}
                onSelect={setCustomDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Filtros específicos por contexto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Categoria (para soluções) */}
          {setCategory && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  <SelectItem value="revenue">Aumento de Receita</SelectItem>
                  <SelectItem value="operational">Otimização Operacional</SelectItem>
                  <SelectItem value="strategy">Gestão Estratégica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dificuldade (para soluções) */}
          {setDifficulty && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Dificuldade</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Todas dificuldades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas dificuldades</SelectItem>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Papel (para usuários) */}
          {setRole && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Papel do Usuário</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Todos papéis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos papéis</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="formacao">Formação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
