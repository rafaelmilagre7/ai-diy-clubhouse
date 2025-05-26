
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForumCategories } from '@/hooks/community/useForumCategories';

interface CategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}

export const CategorySelector = ({ value, onValueChange, required }: CategorySelectorProps) => {
  const { categories, isLoading, error } = useForumCategories();

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando categorias..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    console.error('Erro ao carregar categorias:', error);
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Erro ao carregar categorias" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma categoria" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              {category.icon && <span className="text-sm">{category.icon}</span>}
              {category.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
