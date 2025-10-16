
import React, { useState } from 'react';
import { ImplementationCard } from "../implementation/ImplementationCard";
import { EmptyImplementationsState } from "./EmptyImplementationsState";
import { Implementation } from "@/hooks/useProfileData";
import { Button } from '@/components/ui/button';
import { Check, Clock, Filter } from 'lucide-react';

interface ImplementationsTabContentProps {
  implementations: Implementation[];
}

export const ImplementationsTabContent = ({ implementations }: ImplementationsTabContentProps) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  
  const filteredImplementations = implementations.filter(impl => {
    if (filter === 'all') return true;
    if (filter === 'completed') return impl.is_completed;
    if (filter === 'in-progress') return !impl.is_completed;
    return true;
  });

  if (implementations.length === 0) {
    return <EmptyImplementationsState />;
  }
  
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between bg-surface-elevated p-2 rounded-lg mb-4">
        <div className="flex items-center gap-2 text-sm text-medium-contrast">
          <Filter className="h-4 w-4" /> Filtrar por:
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos ({implementations.length})
          </Button>
          <Button 
            variant={filter === 'completed' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? '' : 'hover:bg-green-600/10 hover:text-green-500'}
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            Concluídos ({implementations.filter(i => i.is_completed).length})
          </Button>
          <Button 
            variant={filter === 'in-progress' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('in-progress')}
            className={filter === 'in-progress' ? '' : 'hover:bg-warning/10 hover:text-warning'}
          >
            <Clock className="mr-1 h-3.5 w-3.5" />
            Em andamento ({implementations.filter(i => !i.is_completed).length})
          </Button>
        </div>
      </div>
      
      {filteredImplementations.length > 0 ? (
        <div className="space-y-4">
          {filteredImplementations.map((implementation) => (
            <ImplementationCard 
              key={implementation.id} 
              implementation={implementation} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface-elevated rounded-lg border border-border">
          <p className="text-medium-contrast">Nenhuma implementação encontrada com o filtro atual.</p>
        </div>
      )}
    </div>
  );
};
