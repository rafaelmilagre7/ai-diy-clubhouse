
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const SolutionsHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-left">
        <h1 className="text-2xl font-bold tracking-tight">Soluções</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie todas as soluções disponíveis na plataforma.
        </p>
      </div>
      <Button asChild>
        <Link to="/admin/solutions/new">
          <Plus className="mr-2 h-4 w-4" />
          Nova Solução
        </Link>
      </Button>
    </div>
  );
};
