
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

// Definindo um tipo para as categorias de ferramentas
export type ToolCategory = string | null;

interface AdminToolsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: ToolCategory;
  onCategoryChange: (value: ToolCategory) => void;
}

export const AdminToolsFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: AdminToolsFiltersProps) => {
  const categories = [
    { value: null, label: 'Todas categorias' },
    { value: 'AI', label: 'Inteligência Artificial' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Analytics', label: 'Analytics' },
    { value: 'Produtividade', label: 'Produtividade' },
    { value: 'CRM', label: 'CRM' },
    { value: 'Vendas', label: 'Vendas' },
    { value: 'Design', label: 'Design' },
    { value: 'Outros', label: 'Outros' }
  ];

  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === 'null' ? null : value);
  };

  return (
    <Card className="p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar ferramentas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
            data-testid="tool-search-input"
          />
        </div>
        
        <div className="w-full sm:w-64">
          <Select 
            onValueChange={handleCategoryChange} 
            value={selectedCategory === null ? 'null' : selectedCategory}
            data-testid="category-select"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem 
                  key={category.label} 
                  value={category.value === null ? 'null' : category.value}
                >
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
