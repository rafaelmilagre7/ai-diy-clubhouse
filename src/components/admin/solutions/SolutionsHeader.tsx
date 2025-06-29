
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SolutionsHeaderProps {
  totalSolutions: number;
  publishedSolutions: number;
  onCreateNew: () => void;
}

export const SolutionsHeader: React.FC<SolutionsHeaderProps> = ({
  totalSolutions,
  publishedSolutions,
  onCreateNew
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Soluções</h1>
        <p className="text-muted-foreground">
          Gerencie todas as soluções disponíveis na plataforma. 
          {totalSolutions > 0 && (
            <span className="ml-1">
              {totalSolutions} total, {publishedSolutions} publicadas
            </span>
          )}
        </p>
      </div>
      <Button onClick={onCreateNew}>
        <Plus className="mr-2 h-4 w-4" />
        Nova Solução
      </Button>
    </div>
  );
};
