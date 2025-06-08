
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Plus } from 'lucide-react';

export const SolutionsHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <Text variant="page" textColor="primary">Soluções</Text>
        <Text variant="body" textColor="secondary" className="mt-1">
          Gerencie todas as soluções disponíveis na plataforma.
        </Text>
      </div>
      <Button asChild className="hover-lift">
        <Link to="/admin/solutions/new">
          <Plus className="mr-2 h-4 w-4" />
          Nova Solução
        </Link>
      </Button>
    </div>
  );
};
