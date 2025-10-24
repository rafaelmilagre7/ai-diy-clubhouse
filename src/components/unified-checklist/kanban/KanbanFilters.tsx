import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Tag, X } from "lucide-react";
import { UnifiedChecklistItem } from "@/hooks/useUnifiedChecklists";
import { Label } from "./LabelManager";

type ColumnType = 'todo' | 'in_progress' | 'done' | 'all';

interface KanbanFiltersProps {
  items: UnifiedChecklistItem[];
  onFilterChange: (filtered: UnifiedChecklistItem[]) => void;
}

export const KanbanFilters: React.FC<KanbanFiltersProps> = ({ items, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<ColumnType>('all');

  // Obter todos os labels disponíveis
  const allLabels = React.useMemo(() => {
    const labelsSet = new Map<string, Label>();
    items.forEach(item => {
      const itemLabels = (item.metadata?.labels || []) as Label[];
      itemLabels.forEach(label => {
        if (!labelsSet.has(label.id)) {
          labelsSet.set(label.id, label);
        }
      });
    });
    return Array.from(labelsSet.values());
  }, [items]);

  useEffect(() => {
    let filtered = items;

    // Filtro de busca
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.notes?.toLowerCase().includes(search)
      );
    }

    // Filtro de labels
    if (selectedLabels.length > 0) {
      filtered = filtered.filter(item => {
        const itemLabels = (item.metadata?.labels || []) as Label[];
        return itemLabels.some(label =>
          selectedLabels.includes(label.id)
        );
      });
    }

    // Filtro de coluna
    if (selectedColumn !== 'all') {
      filtered = filtered.filter(item => item.column === selectedColumn);
    }

    onFilterChange(filtered);
  }, [searchTerm, selectedLabels, selectedColumn, items, onFilterChange]);

  const hasActiveFilters = searchTerm || selectedLabels.length > 0 || selectedColumn !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLabels([]);
    setSelectedColumn('all');
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <Card className="p-4 mb-6 glass-card">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro de coluna */}
        <Select value={selectedColumn} onValueChange={(v) => setSelectedColumn(v as ColumnType)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todas colunas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas colunas</SelectItem>
            <SelectItem value="todo">A Fazer</SelectItem>
            <SelectItem value="in_progress">Em Progresso</SelectItem>
            <SelectItem value="done">Concluído</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de labels */}
        {allLabels.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Tag className="h-4 w-4 mr-2" />
                Labels {selectedLabels.length > 0 && `(${selectedLabels.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {allLabels.map(label => (
                <DropdownMenuCheckboxItem
                  key={label.id}
                  checked={selectedLabels.includes(label.id)}
                  onCheckedChange={() => toggleLabel(label.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>
    </Card>
  );
};
