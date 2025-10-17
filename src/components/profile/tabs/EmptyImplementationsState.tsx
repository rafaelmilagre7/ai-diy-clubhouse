
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

export const EmptyImplementationsState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-elevated/80 backdrop-blur-sm rounded-lg border border-border animate-fade-in shadow-inner">
      <div className="h-16 w-16 rounded-full bg-aurora-primary/10 flex items-center justify-center mb-4 shadow-md border border-aurora-primary/20 animate-pulse-glow">
        <Lightbulb className="h-8 w-8 text-aurora-primary" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Nenhuma implementação encontrada</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Parece que você ainda não iniciou nenhuma implementação. 
        Explore nossas soluções para começar a implementar IA no seu negócio.
      </p>
      <Button asChild className="transition-all duration-300 hover:scale-105">
        <Link to="/dashboard" className="flex items-center gap-2">
          Explorar soluções
        </Link>
      </Button>
    </div>
  );
};
