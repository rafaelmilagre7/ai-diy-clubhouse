
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings2, Search, X } from 'lucide-react';
import { SuggestionFilter } from '@/types/suggestionTypes';

interface AdvancedSearchDialogProps {
  onApplyFilters: (filters: SearchFilters) => void;
  currentFilters: SearchFilters;
}

interface SearchFilters {
  query: string;
  status: string[];
  dateRange: string;
  sortBy: string;
  author: string;
}

export const AdvancedSearchDialog: React.FC<AdvancedSearchDialogProps> = ({
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);
  const [open, setOpen] = useState(false);

  const statusOptions = [
    { value: 'new', label: 'Nova' },
    { value: 'under_review', label: 'Em Análise' },
    { value: 'in_development', label: 'Desenvolvimento' },
    { value: 'completed', label: 'Implementada' },
    { value: 'declined', label: 'Recusada' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Mais Recentes' },
    { value: 'popular', label: 'Mais Populares' },
    { value: 'votes', label: 'Mais Votadas' },
    { value: 'comments', label: 'Mais Comentadas' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Qualquer período' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '1y', label: 'Último ano' }
  ];

  const handleStatusChange = (status: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      status: checked 
        ? [...prev.status, status]
        : prev.status.filter(s => s !== status)
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: '',
      status: [],
      dateRange: 'all',
      sortBy: 'recent',
      author: ''
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Filtros Avançados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Avançada
          </DialogTitle>
          <DialogDescription>
            Configure filtros detalhados para encontrar exatamente o que procura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="query">Termos de busca</Label>
            <Input
              id="query"
              placeholder="Digite palavras-chave..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label>Status da sugestão</Label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={filters.dateRange} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, dateRange: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <Select value={filters.sortBy} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, sortBy: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Author Filter */}
          <div className="space-y-2">
            <Label htmlFor="author">Autor</Label>
            <Input
              id="author"
              placeholder="Nome do usuário..."
              value={filters.author}
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <X className="h-4 w-4" />
            Limpar
          </Button>
          <Button onClick={handleApply} className="gap-2">
            <Search className="h-4 w-4" />
            Aplicar Filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
